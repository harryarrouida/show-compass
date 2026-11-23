"use server";

import { generateVerifiedRecommendations, type RecommendationRequest } from "@/lib/recommendation-engine";

// Server-side ranking and TMDB validation. Never expose the Groq key to clients.
export async function generateTraktAIRecommendations(input: RecommendationRequest) {
  try {
    return await generateVerifiedRecommendations({ ...input, mode: "trakt" });
  } catch (error) {
    console.error("Trakt recommendation failed:", error);
    throw new Error(error instanceof Error && (
      error.message.startsWith("No eligible") ||
      error.message.startsWith("No verified") ||
      error.message.startsWith("Connect Trakt")
    ) ? error.message : "Recommendations are unavailable right now. Please try again.");
  }
}
