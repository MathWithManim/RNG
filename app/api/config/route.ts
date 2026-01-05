import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the custom IP from environment variables
  const customIP = process.env.NEXT_PUBLIC_CUSTOM_IP || request.nextUrl.origin;
  
  return Response.json({ customIP });
}