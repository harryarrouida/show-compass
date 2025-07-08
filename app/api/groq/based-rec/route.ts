import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { generateDefaultPrompt } from "@/constants/aiPrompts";

export async function POST(req: NextRequest) {
  console.log("GROQ API called");
  try {
    const body = await req.json();
    const { mediaDetails, type } = body;

    if (!mediaDetails || !type) {
      return NextResponse.json(
        { error: "No media details provided" },
        { status: 400 }
      );
    }
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ API key not found" },
        { status: 500 }
      );
    }
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that provides recommendations. Your responses must be valid JSON with a 'recommendations' array containing objects with 'title' and 'reason' fields. The JSON must be complete and properly formatted. Example format:
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
          content: generateDefaultPrompt(mediaDetails as any, type as string),
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    console.log("Prompt for based-rec:", generateDefaultPrompt(mediaDetails as any, type as string));

    const response = completion.choices[0]?.message?.content || "";
    const cleanResponse = response.trim();
    const parsed = JSON.parse(cleanResponse);

    if (
      !parsed ||
      !parsed.recommendations ||
      !Array.isArray(parsed.recommendations)
    ) {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
