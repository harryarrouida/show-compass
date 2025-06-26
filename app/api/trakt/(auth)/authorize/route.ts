import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Validate required environment variables
        const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
        const redirectUri = process.env.NEXT_PUBLIC_TRAKT_REDIRECT_URI;
        const baseUrl = process.env.NEXT_PUBLIC_TRAKT_BASE_URL;

        if (!clientId || !redirectUri || !baseUrl) {
            console.error('Missing required environment variables for Trakt authorization', {
                clientId: !!clientId,
                redirectUri: !!redirectUri,
                baseUrl: !!baseUrl
            });
            
            return NextResponse.json(
                { error: 'Server configuration error', error_description: 'Missing required Trakt API configuration' },
                { status: 500 }
            );
        }

        // Build the authorization URL
        const url = `${baseUrl}/oauth/authorize?` + new URLSearchParams({
            response_type: "code",
            client_id: clientId,
            scope: "public", 
            redirect_uri: redirectUri
        }).toString();
        
        return NextResponse.json({ url });
    } catch (error) {
        console.error('Error generating Trakt authorization URL:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        return NextResponse.json(
            { error: 'Failed to generate authorization URL', error_description: errorMessage },
            { status: 500 }
        );
    }
}

