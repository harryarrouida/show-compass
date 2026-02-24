import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'No code provided' }, { status: 400 });
        }

        const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
        const clientSecret = process.env.TRAKT_SECRET;
        const origin = new URL(request.url).origin;
        const redirectUri = `${origin}/trakt`;

        console.log('--- Trakt Token Exchange Start ---');
        console.log('Client ID exists:', !!clientId);
        console.log('Client Secret exists:', !!clientSecret);
        console.log('Redirect URI:', redirectUri);

        if (!clientId || !clientSecret) {
            console.error('Missing Trakt environment variables');
            return NextResponse.json({ error: 'Server configuration error: Missing environment variables' }, { status: 500 });
        }

        const requestBody = {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        };

        const response = await fetch('https://api.trakt.tv/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'trakt-api-version': '2',
                'trakt-api-key': clientId,
                'User-Agent': 'Show-Compass/1.0'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Trakt Response Status:', response.status);

        const textResponse = await response.text();
        let data;

        try {
            data = JSON.parse(textResponse);
        } catch (e) {
            console.error(`Trakt returned non-JSON. Status: ${response.status}. Body preview:`, textResponse.substring(0, 1000));
            return NextResponse.json(
                { error: `Trakt API returned HTML instead of JSON (Status ${response.status}). Body: ${textResponse.substring(0, 100)}` },
                { status: 502 }
            );
        }

        if (!response.ok) {
            console.error('Trakt token exchange error:', {
                status: response.status,
                data,
                requestPayload: { ...requestBody, client_secret: '***' }
            });
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Token exchange error exception:', error);
        return NextResponse.json(
            { error: 'Failed to exchange token details: ' + (error?.message || String(error)) },
            { status: 500 }
        );
    }
}