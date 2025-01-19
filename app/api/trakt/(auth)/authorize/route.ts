import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID!;
const clientSecret = process.env.NEXT_PUBLIC_TRAKT_CLIENT_SECRET;
const baseUrl = process.env.NEXT_PUBLIC_TRAKT_BASE_URL!;

const redirectUri = process.env.NEXT_PUBLIC_TRAKT_REDIRECT_URI!;

export async function GET(request: NextRequest) { 
    const url = `${baseUrl}/oauth/authorize?` + new URLSearchParams({
        response_type: "code",
        client_id: clientId!,
        scope: "public", 
        redirect_uri: redirectUri
    }).toString();
    
    return Response.json({ url });
}

