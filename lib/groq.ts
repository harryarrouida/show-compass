import "server-only";
import Groq from "groq-sdk";

// Change GROQ_MODEL in your server environment to switch models without a code change.
export const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured on the server");
  return new Groq({ apiKey });
}

export function parseRecommendations(content: string | null | undefined): Array<{ title: string; reason: string }> {
  if (!content) throw new Error("The AI returned an empty response");
  const parsed: unknown = JSON.parse(content.trim());
  if (!parsed || typeof parsed !== "object" || !("recommendations" in parsed)) {
    throw new Error("Invalid AI recommendation response");
  }
  const results = (parsed as { recommendations: unknown }).recommendations;
  if (!Array.isArray(results) || !results.every((r) => r && typeof r.title === "string" && typeof r.reason === "string")) {
    throw new Error("Invalid AI recommendation response");
  }
  return results;
}
