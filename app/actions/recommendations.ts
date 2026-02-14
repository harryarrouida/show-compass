"use server";

import Groq from "groq-sdk";
import { generateDefaultPrompt, generateCustomPrompt } from "@/constants/aiPrompts";
import { AIRecommendation, MediaDetails } from "@/types/types";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function getAIRecommendations(
    mediaDetails: {
        title: string;
        overview: string;
        genres: Array<{ name: string }>;
        release_date: string;
        vote_average: number;
    },
    type: string,
    userHistory: Array<{ title: string; reason: string }> = [],
    userPrompt?: string
): Promise<AIRecommendation[]> {
    try {
        const messages = [
            {
                role: "system",
                content: `You are an expert cinematic taste analyst and emotional storytelling consultant. Your specialty is understanding the FEEL, MOOD, and ATMOSPHERE of films and shows, not just their genre labels.

CORE PRINCIPLES:
1. IGNORE genre classifications - they are superficial labels
2. FOCUS on emotional resonance, narrative tone, and atmospheric qualities
3. ANALYZE storytelling approach: pacing, character depth, thematic weight
4. CONSIDER the viewer's emotional journey and what feelings the content evokes
5. MATCH based on mood, atmosphere, and narrative style

WHAT TO ANALYZE:
- Emotional Tone: melancholic, uplifting, tense, whimsical, bittersweet, cynical, hopeful
- Pacing: contemplative, slow-burn, frenetic, methodical, explosive, meditative
- Atmosphere: intimate, epic, claustrophobic, expansive, dreamlike, gritty, cozy, unsettling
- Character Focus: character-driven vs plot-driven, ensemble vs lone protagonist, relationship dynamics
- Narrative Style: linear, non-linear, mystery-box, anthology, episodic, serialized
- Thematic Depth: what ideas/emotions does it explore? (identity, loss, hope, redemption, belonging)
- Visual/Aesthetic Style: naturalistic, stylized, surreal, minimalist, maximalist

YOUR RECOMMENDATIONS MUST:
- Explain the EMOTIONAL and ATMOSPHERIC connection, not genre similarity
- Reference specific mood elements: "shares the same melancholic, introspective tone"
- Mention narrative approach: "both feature slow-burn character studies"
- Highlight thematic resonance: "explores similar themes of identity and isolation"
- Consider pacing compatibility: don't recommend frenetic content to contemplative viewers

RESPONSE FORMAT:
Return ONLY valid JSON with this exact structure:
{
  "recommendations": [
    {
      "title": "Exact Title",
      "reason": "Detailed explanation focusing on emotional/atmospheric match, narrative tone, pacing, and thematic connection. Avoid mentioning genres."
    }
  ]
}

CRITICAL: Return ONLY the JSON object. Any extra text will cause system failure.`,
            },
            {
                role: "user",
                content: userPrompt
                    ? generateCustomPrompt(mediaDetails, type, userPrompt, userHistory)
                    : generateDefaultPrompt(mediaDetails, type, userHistory),
            },
        ];

        const completion = await groq.chat.completions.create({
            messages: messages as any,
            model: "llama-3.3-70b-versatile", // Use better model for nuanced analysis
            temperature: userPrompt ? 0.3 : 0.5, // Higher temp for creative mood matching
            max_tokens: 2048, // More tokens for richer explanations
            response_format: { type: "json_object" },
        });

        const response = completion.choices[0]?.message?.content || "";
        const cleanResponse = response.trim();
        const parsed = JSON.parse(cleanResponse);

        if (
            !parsed ||
            !parsed.recommendations ||
            !Array.isArray(parsed.recommendations)
        ) {
            throw new Error("Invalid response format");
        }

        return parsed.recommendations;
    } catch (error) {
        console.error("AI Recommendation Error:", error);
        return [];
    }
}
