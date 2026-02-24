import { NextResponse } from 'next/server';

const baseUrl = 'https://api.trakt.tv';

export async function GET(request: Request) {
    try {
        const authorization = request.headers.get('authorization');

        if (!authorization) {
            return NextResponse.json(
                { error: 'No authorization header' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/users/me`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorization,
                'trakt-api-version': '2',
                'trakt-api-key': process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID!,
                'User-Agent': 'Show-Compass/1.0'
            }
        });

        const textResponse = await response.text();
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (e) {
            console.error(`User fetch non-JSON from Trakt. Status: ${response.status}. Body preview:`, textResponse.substring(0, 500));
            return NextResponse.json(
                { error: `Trakt API returned HTML instead of JSON for User (Status ${response.status})` },
                { status: 502 }
            );
        }

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('User fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user data' },
            { status: 500 }
        );
    }
}