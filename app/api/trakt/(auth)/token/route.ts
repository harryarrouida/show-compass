import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { code } = await request.json();
        
        if (!code) {
            return NextResponse.json({ error: 'No code provided' }, { status: 400 });
        }

        const response = await fetch('https://api.trakt.tv/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                client_id: process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID,
                client_secret: process.env.TRAKT_SECRET,
                redirect_uri: process.env.NEXT_PUBLIC_TRAKT_REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Trakt token exchange error:', data);
            
            // Provide more helpful error messages
            if (data.error === 'invalid_grant') {
                return NextResponse.json({
                    error: 'invalid_grant',
                    error_description: 'The authorization code has expired or has already been used. Please try logging in again.'
                }, { status: 400 });
            }
            
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Token exchange error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to exchange token', error_description: errorMessage },
            { status: 500 }
        );
    }
}