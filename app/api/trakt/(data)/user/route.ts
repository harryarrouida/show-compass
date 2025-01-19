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
                'trakt-api-key': process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID!
            }
        });

        const data = await response.json();
        
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