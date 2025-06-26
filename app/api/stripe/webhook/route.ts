import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Let Stripe auto-select the API version, avoiding version issues
});

// This is your Stripe webhook secret for testing your endpoint locally
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = headers();
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
        
        if (userId) {
          // Here you would update your database to mark the user as a premium user
          console.log(`User ${userId} has been upgraded to premium`);
          
          // You can add your database update logic here
          // For example:
          // await db.user.update({
          //   where: { id: userId },
          //   data: { isPremium: true }
          // });
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
