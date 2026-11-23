"use server";

import { getGroqClient, GROQ_MODEL, parseRecommendations } from "@/lib/groq";

export async function generateTraktAIRecommendations(prompt: string): Promise<Array<{ title: string; reason: string }>> {
  if (!prompt?.trim() || prompt.length > 100000) throw new Error("Invalid recommendation prompt");
  try {
    const completion = await getGroqClient().chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert cinematic taste analyst. Your job is to understand a viewer's emotional and atmospheric preferences from their watch history and find new content that will genuinely resonate with them.

CRITICAL RULES:
- Analyze the AGGREGATE pattern across the full history, not individual titles
- Weight SIGNATURE TITLES (those with overviews provided) more heavily — they best represent the user's taste
- Recommendations must NOT appear in the user's complete watch history
- Explanations must reference MOOD, ATMOSPHERE, PACING, and THEMES — not genres
- Provide VARIETY: diverse picks that all fit the taste profile
- Your responses MUST be valid JSON only`,
        },
        { role: "user", content: prompt },
      ],
      model: GROQ_MODEL,
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });
    return parseRecommendations(completion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Trakt AI Recommendation Error:", error);
    throw new Error("Could not generate recommendations. Please try again later.");
  }
}
