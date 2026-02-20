"use server";

import Groq from "groq-sdk";
import {
  generateDefaultPrompt,
  generateCustomPrompt,
  type HistoryChain,
} from "@/constants/aiPrompts";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Build taste chains from the user's saved history.
 * Each chain captures: which media they were browsing (from) → what they chose to save (saved).
 * This is a much stronger taste signal than just "here are titles the AI already explained".
 */
function buildHistoryChains(
  rawHistory: Array<{
    title?: string;
    reason?: string;
    from?: string | { title?: string };
  }>
): HistoryChain[] {
  return rawHistory
    .filter((item) => item.title && item.from)
    .map((item) => {
      const fromTitle =
        typeof item.from === "string"
          ? item.from
          : (item.from as { title?: string })?.title ?? "";
      return {
        from: fromTitle,
        saved: item.title as string,
      };
    })
    .filter((c) => c.from && c.from !== "Trakt Recommendations");
}

export async function getAIRecommendations(
  mediaDetails: {
    title: string;
    overview: string;
    genres?: Array<{ name: string }>;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    runtime?: number;
    episode_run_time?: number[];
    number_of_seasons?: number;
    number_of_episodes?: number;
  },
  type: string,
  // Accept the full raw history so we can extract taste chains
  rawHistory: Array<{
    title?: string;
    reason?: string;
    from?: string | { title?: string };
  }> = [],
  userPrompt?: string
): Promise<Array<{ title: string; reason: string }>> {
  try {
    const historyChains = buildHistoryChains(rawHistory);

    const messages = [
      {
        role: "system",
        content: `You are an expert cinematic taste analyst and emotional storytelling consultant. Your specialty is understanding the FEEL, MOOD, and ATMOSPHERE of films and shows.

CORE PRINCIPLES:
1. IGNORE genre classifications — they are superficial labels
2. FOCUS on emotional resonance, narrative tone, and atmospheric qualities
3. ANALYZE storytelling approach: pacing, character depth, thematic weight
4. CONSIDER the viewer's emotional journey and the feelings the content evokes
5. MATCH based on mood, atmosphere, narrative style, and the user's demonstrated taste chains

WHAT TO ANALYZE:
- Emotional Tone: melancholic, uplifting, tense, whimsical, bittersweet, cynical, hopeful
- Pacing: contemplative, slow-burn, frenetic, methodical, explosive, meditative
- Atmosphere: intimate, epic, claustrophobic, expansive, dreamlike, gritty, cozy, unsettling
- Character Focus: character-driven vs plot-driven, ensemble vs lone protagonist
- Narrative Style: linear, non-linear, mystery-box, episodic, serialized
- Thematic Depth: identity, loss, hope, redemption, belonging, moral complexity

EXPLANATION FORMAT:
- Reference specific mood: "shares the same melancholic, introspective tone"
- Mention narrative approach: "both feature slow-burn character studies"
- Highlight thematic resonance: "explores similar themes of identity and isolation"
- Connect to the user's demonstrated taste when chains are available

Return ONLY valid JSON:
{
  "recommendations": [
    { "title": "Exact Title", "reason": "Emotional/atmospheric explanation..." }
  ]
}

CRITICAL: Return ONLY the JSON. Any extra text causes system failure.`,
      },
      {
        role: "user",
        content: userPrompt
          ? generateCustomPrompt(mediaDetails, type, userPrompt, historyChains)
          : generateDefaultPrompt(mediaDetails, type, historyChains),
      },
    ];

    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content || "";
    const parsed = JSON.parse(response.trim());

    if (!parsed?.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error("Invalid response format");
    }

    return parsed.recommendations;
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
}
