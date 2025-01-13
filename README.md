# Show Compass

A movie and TV show recommendation platform with AI-powered suggestions and Trakt.tv integration.

## Key Features
- AI-powered recommendations using Groq API
- Trakt.tv integration for watch history
- TMDB integration for media details
- Local caching for improved performance

## Caching Strategy
- Trakt watch history: 24 hours
- TMDB search results: 24 hours
- AI recommendations: Session-based

## Component Structure
- `/app`: Next.js pages and routing
- `/components`: Reusable UI components
- `/services`: API integration services
- `/context`: Global state management
- `/types`: TypeScript type definitions

## Environment Variables
Required environment variables:
- NEXT_PUBLIC_TMDB_API_KEY
- NEXT_PUBLIC_TRAKT_CLIENT_ID
- NEXT_PUBLIC_GROQ_API_KEY
