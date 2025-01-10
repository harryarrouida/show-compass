import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
  }

  try {
    const response = await axios.post("http://127.0.0.1:11434/api/generate", {
      model: "qwen:4b",
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.8,
        top_k: 40,
        max_tokens: 500,
        repeat_penalty: 1.1
      }
    });

    const data = response.data;
    return NextResponse.json({ response: data.response });
  } catch (error) {
    console.error("Ollama API Error:", error);
    return NextResponse.json(
      { error: `Failed to get AI response: ${error}` },
      { status: 500 }
    );
  }
}
