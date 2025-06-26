# Show Compass

A movie and TV show recommendation platform with AI-powered suggestions and Trakt.tv integration.

## Key Features
- AI-powered recommendations using Groq API
- Trakt.tv integration for watch history
- TMDB integration for media details
- Stripe payment integration for premium features
- Local caching for improved performance

## Caching Strategy
- Trakt watch history: 24 hours
- TMDB search results: 24 hours
- AI recommendations: Session-based

## Component Structure
- `/app`: Next.js pages and routing
  - `/(stripe)`: Stripe payment pages
  - `/api/(stripe)`: Stripe API endpoints
- `/components`: Reusable UI components
- `/services`: API integration services
- `/context`: Global state management
- `/types`: TypeScript type definitions

## Environment Variables
Required environment variables:
- NEXT_PUBLIC_TMDB_API_KEY
- NEXT_PUBLIC_TRAKT_CLIENT_ID
- NEXT_PUBLIC_GROQ_API_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_BASE_URL

## Stripe Integration
The application includes Stripe integration for premium features:
1. One-time payment of $9.99 for premium access
2. Webhook for handling successful payments
3. Success and failure pages for payment flow

To test the Stripe integration:
1. Create a Stripe account and get API keys
2. Set up webhook endpoint using Stripe CLI or ngrok
3. Add Stripe keys to .env.local file
4. Use Stripe test card (4242 4242 4242 4242) to test the payment flow
