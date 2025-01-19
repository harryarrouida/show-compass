import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const baseUrl = 'https://api.trakt.tv';

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
        return Response.json({ error: 'No token provided' }, { status: 400 });
    }
    const response = await axios.get(`${baseUrl}/users/me/watchlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return Response.json(response.data);
}