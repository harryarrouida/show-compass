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
                client_secret: process.env.NEXT_PUBLIC_TRAKT_SECRET,
                redirect_uri: process.env.NEXT_PUBLIC_TRAKT_REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Trakt token exchange error:', data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Token exchange error:', error);
        return NextResponse.json(
            { error: 'Failed to exchange token' },
            { status: 500 }
        );
    }
}