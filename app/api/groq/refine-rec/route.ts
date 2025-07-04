import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { generateCustomPrompt } from "@/constants/aiPrompts";
import { adminDb } from "@/config/FirebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request: NextRequest) {
  try {
    // Get authorization token from header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify Firebase token
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userData = userDoc.data();
    const isPremium = userData?.isPremium || false;

    if (!isPremium) {
      return new Response(
        JSON.stringify({
          error:
            "This feature is only available for premium users. Please upgrade to access AI-powered refinements!",
          isPremiumFeature: true,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "GROQ API key not found" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    if (!groq) {
      return new Response(
        JSON.stringify({ error: "Failed to initialize GROQ client" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body = await request.json();
    const { details, type, prompt } = body;
    if (!details || !type || !prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a JSON-only response bot. Always respond with valid JSON matching this exact format:
            {
              "recommendations": [
                {
                  "title": "Movie Title",
                  "reason": "Reason for recommendation"
                }
              ]
            }`,
        },
        {
          role: "user",
          content: generateCustomPrompt(
            details as any,
            type as string,
            prompt,
            8
          ),
        },
      ],
      // model: "mixtral-8x7b-32768",
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      top_p: 0.1,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content || "";
    console.log("GROQ response:", response);
    const cleanResponse = response.trim();
    const parsed = JSON.parse(cleanResponse);

    if (
      !parsed ||
      !parsed.recommendations ||
      !Array.isArray(parsed.recommendations)
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid response format" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error executing GROQ query:", error);
    return new Response(
      JSON.stringify({ error: "Failed to execute GROQ query" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
