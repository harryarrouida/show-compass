import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { adminDb } from "@/config/FirebaseAdmin";
import { getAuth } from "firebase-admin/auth";

// Constants for rate limiting
const FREE_DAILY_LIMIT = 5;
const FREE_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes in milliseconds
const PREMIUM_COOLDOWN_MS = 1.5 * 60 * 1000; // 1.5 minutes in milliseconds

// Helper function to check if enough time has passed since last recommendation
const hasEnoughTimePassed = (lastTimestamp: Date | null, isPremium: boolean) => {
  if (!lastTimestamp) return true;
  
  const cooldownTime = isPremium ? PREMIUM_COOLDOWN_MS : FREE_COOLDOWN_MS;
  const timePassed = Date.now() - lastTimestamp.getTime();
  return timePassed >= cooldownTime;
};

// trakt recommendation generation
export async function POST (req: NextRequest) {
  console.log("GROQ API called");
  try {
    // Get authorization token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify Firebase token
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const isPremium = userData?.isPremium || false;
    const lastRecTimestamp = userData?.lastRecTimestamp?.toDate() || null;
    const lastRecDay = userData?.lastRecDay || null;
    const todayUsedRecs = userData?.todayUsedRecs || 0;

    // Check cooldown period
    if (!hasEnoughTimePassed(lastRecTimestamp, isPremium)) {
      const cooldownTime = isPremium ? PREMIUM_COOLDOWN_MS : FREE_COOLDOWN_MS;
      const remainingTime = cooldownTime - (Date.now() - lastRecTimestamp.getTime());
      return NextResponse.json({
        error: 'Please wait before generating new recommendations',
        remainingTime: Math.ceil(remainingTime / 1000) // Convert to seconds
      }, { status: 429 });
    }

    // Check daily limit for free users
    const today = new Date().toISOString().split('T')[0];
    if (!isPremium) {
      if (lastRecDay === today && todayUsedRecs >= FREE_DAILY_LIMIT) {
        return NextResponse.json({
          error: 'Daily limit reached. Upgrade to premium for unlimited recommendations!',
          dailyLimit: FREE_DAILY_LIMIT,
          used: todayUsedRecs
        }, { status: 429 });
      }
    }

    const body = await req.json();
    const { prompt } = body;

    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // Generate recommendations
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
          You are a movie and TV show recommendation assistant. You will receive user input details and generate personalized recommendations. 
          - Your responses MUST only be in valid JSON format.
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3, // Lower for more focused, consistent reasoning
      top_p: 0.8,       // Slightly higher for better vocabulary diversity
      max_tokens: 4096,
      response_format: { type: "json_object" },
      frequency_penalty: 0.1, // Reduce repetitive phrasing
      presence_penalty: 0.1   // Encourage diverse vocabulary
    });

    const response = completion.choices[0]?.message?.content || "";

    if (!response) {
      return NextResponse.json({ error: "No response from Groq" }, { status: 500 });
    }

    // Update user's recommendation stats
    const updateData: any = {
      lastRecTimestamp: new Date(),
    };

    if (lastRecDay !== today) {
      updateData.lastRecDay = today;
      updateData.todayUsedRecs = 1;
    } else {
      updateData.todayUsedRecs = todayUsedRecs + 1;
    }

    await userRef.update(updateData);

    return NextResponse.json({
      response,
      remainingDaily: isPremium ? null : FREE_DAILY_LIMIT - updateData.todayUsedRecs,
      cooldownSeconds: isPremium ? PREMIUM_COOLDOWN_MS / 1000 : FREE_COOLDOWN_MS / 1000
    });

  } catch (error: any) {
    console.error('Error in GROQ API:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { 
      status: error.status || 500 
    });
  }
}
