import { NextResponse } from 'next/server';

const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_TRAKT_CLIENT_SECRET;
const baseUrl = 'https://api.trakt.tv';

export async function POST(request: Request) {
    try {
        const { code } = await request.json();
        
        const response = await fetch(`${baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: 'http://localhost:3000/trakt',
                grant_type: 'authorization_code'
            })
        });

        const data = await response.json();
        
        if (!response.ok || !data.access_token) {
            console.error('Token exchange failed:', data);
            return NextResponse.json(
                { error: data.error || 'Failed to exchange token' },
                { status: response.status || 500 }
            );
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