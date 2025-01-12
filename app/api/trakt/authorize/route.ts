import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_TRAKT_CLIENT_SECRET;
const baseUrl = 'https://api.trakt.tv';

export async function GET(request: NextRequest) { 
    const url = `${baseUrl}/oauth/authorize?` + new URLSearchParams({
        response_type: "code",
        client_id: clientId!,
        scope: "public", 
        redirect_uri: "http://localhost:3000/trakt"
    }).toString();
    
    return Response.json({ url });
}

