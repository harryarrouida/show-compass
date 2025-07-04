import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { generateWatchlistPrompt } from "@/constants/aiPrompts";
import { adminDb } from "@/config/FirebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const token = authHeader.split("Bearer ")[1];
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user doc (optional, for future premium checks)
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = await request.json();
    const { ratingDistribution, decadePreferences, favoriteGenres, watchedTitles, watchlist, type, numRecommendations, animeOnly, lengthPreference, episodeCount, status, minimumRating } = body;
    if (!watchlist || !Array.isArray(watchlist) || !type) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate prompt
    const prompt = generateWatchlistPrompt(
      ratingDistribution,
      decadePreferences,
      favoriteGenres,
      watchedTitles,
      watchlist,
      type,
      numRecommendations,
      animeOnly,
      lengthPreference,
      episodeCount,
      status,
      minimumRating
    );

    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "GROQ API key not found" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a JSON-only response bot. Always respond with valid JSON matching this exact format:\n{\n  \"recommendations\": [\n    {\n      \"title\": \"Title from Watchlist\",\n      \"reason\": \"Concise explanation of why this watchlist item matches their proven taste profile and will deliver similar satisfaction to their favorites, highlighting its unique appeal.\"\n    }\n  ]\n}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      top_p: 0.1,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content || "";
    const cleanResponse = response.trim();
    const parsed = JSON.parse(cleanResponse);

    if (!parsed || !parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      return new Response(JSON.stringify({ error: "Invalid response format" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error executing GROQ watchlist-rec query:", error);
    return new Response(
      JSON.stringify({ error: "Failed to execute GROQ watchlist-rec query" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
