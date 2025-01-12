import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const baseUrl = 'https://api.trakt.tv';

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
        return Response.json({ error: 'No token provided' }, { status: 400 });
    }
    const response = await axios.get(`${baseUrl}/users/me/watched`, {
        headers: { 'Authorization': `Bearer ${token}`, 'trakt-api-key': process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID, 'trakt-api-version': '2' }
    });
    console.log(response.data);
    return Response.json(response.data);
}
