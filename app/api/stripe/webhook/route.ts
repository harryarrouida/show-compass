import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { adminDb } from '@/config/FirebaseAdmin';

// Import FieldValue from Firestore Admin SDK
import { FieldValue } from 'firebase-admin/firestore';

// Initialize Stripe with the server-side secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Let Stripe auto-select the API version
});

// Get the webhook secret from environment variables
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Handles Stripe webhook events, particularly focusing on successful checkout sessions
 * to update user premium status in Firestore database using Firebase Admin SDK.
 * 
 * @param req - Next.js request object containing the webhook payload
 * @returns NextResponse with status indicating success or failure
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Retrieve the user ID from the metadata
        const userId = session.metadata?.userId;
        
        if (!userId) {
          console.error('No userId found in session metadata');
          return NextResponse.json(
            { error: 'Missing userId in session metadata' },
            { status: 400 }
          );
        }

        try {
          // Update the user's premium status in Firestore using Admin SDK
          const userRef = adminDb.collection('users').doc(userId);
          
          await userRef.set({
            isPremium: true,
            premiumPurchaseDate: FieldValue.serverTimestamp(),
            stripeSessionId: session.id, // Store the session ID for reference
            updatedAt: FieldValue.serverTimestamp()
          }, { merge: true });
          
          console.log(`User ${userId} has been upgraded to premium successfully`);
        } catch (dbError) {
          console.error('Error updating user premium status:', dbError);
          return NextResponse.json(
            { error: 'Failed to update user premium status' },
            { status: 500 }
          );
        }
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred processing the webhook' },
      { status: 500 }
    );
  }
}
