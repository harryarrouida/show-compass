"use server";

import { generateVerifiedRecommendations, type RecommendationRequest } from "@/lib/recommendation-engine";

// Keep the public server action small: only verified TMDB IDs returned by the
// server-side candidate pool can become recommendations.
export async function getAIRecommendations(input: RecommendationRequest) {
  try {
    return await generateVerifiedRecommendations({ ...input, mode: "similar" });
  } catch (error) {
    console.error("Similar-title recommendation failed:", error);
    throw new Error(error instanceof Error && (
      error.message.startsWith("No eligible") ||
      error.message.startsWith("The selected") ||
      error.message.startsWith("No verified")
    ) ? error.message : "Recommendations are unavailable right now. Please try again.");
  }
}
