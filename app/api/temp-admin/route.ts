import { NextRequest } from 'next/server';
import { getSession } from '@/services/auth-client';
import { getUserData } from '@/services/auth';

// Declare global variable for rate limiting
declare global {
  var tempTokenGenRateLimit: Map<string, { count: number; resetTime: number }> | undefined;
}

// In-memory store for temporary admin tokens (in production, use Redis or database)
const tempTokenStore = new Map();

// Generate a temporary admin access token
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = getSession();
    if (!session) {
      return Response.json({ error: 'Unauthorized: No session found' }, { status: 401 });
    }

    // Verify user is an admin
    const user = await getUserData(session.id);
    if (!user || !user.is_admin) {
      return Response.json({ error: 'Unauthorized: Not an admin' }, { status: 401 });
    }

    // Rate limiting for token generation
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `temp_token_gen_${clientIP}`;

    // Use environment variables for rate limiting
    const now = Date.now();
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000'); // 5 minutes default
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '10'); // 10 token generations per window

    // Create a separate rate limit store for token generation
    if (typeof global.tempTokenGenRateLimit === 'undefined') {
      global.tempTokenGenRateLimit = new Map();
    }

    const rateLimitStore = global.tempTokenGenRateLimit;
    const record = rateLimitStore.get(rateLimitKey) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count++;
      if (record.count > maxRequests) {
        return Response.json({ error: 'Rate limit exceeded for token generation' }, { status: 429 });
      }
    }

    rateLimitStore.set(rateLimitKey, record);

    // Get expiration time from query parameters (in minutes), default to 30 minutes
    const url = new URL(request.url);
    let expirationMinutes = parseInt(url.searchParams.get('expiration') || '30');

    // Validate and cap the expiration time using environment variables
    const maxExpirationMinutes = parseInt(process.env.TEMP_TOKEN_MAX_MINUTES || '1440'); // 24 hours default
    const minExpirationMinutes = parseInt(process.env.TEMP_TOKEN_MIN_MINUTES || '1'); // 1 minute default

    expirationMinutes = Math.min(Math.max(expirationMinutes, minExpirationMinutes), maxExpirationMinutes);

    const expirationTime = Date.now() + expirationMinutes * 60 * 1000;

    // Generate a temporary token with expiration
    const tempToken = generateTempToken(session.id);

    // Store the token temporarily with expiration and session info
    tempTokenStore.set(tempToken, {
      userId: session.id,
      expiresAt: expirationTime,
      createdById: session.id, // Store the ID of the user who created this token
      createdIp: clientIP // Store the IP that created the token for security tracking
    });

    // Clean up expired tokens
    cleanupExpiredTokens();

    return Response.json({
      success: true,
      tempToken,
      expiresAt: expirationTime,
      expirationMinutes: expirationMinutes
    });
  } catch (error: any) {
    console.error('Temp admin token generation error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Validate a temporary admin token
export async function POST(request: NextRequest) {
  try {
    const { tempToken } = await request.json();

    if (!tempToken || !isValidTempToken(tempToken)) {
      return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Token is valid, return success and remove the token (one-time use)
    const tokenData = tempTokenStore.get(tempToken);

    // Remove the token after use (making it single-use)
    tempTokenStore.delete(tempToken);

    return Response.json({
      success: true,
      userId: tokenData.userId
    });
  } catch (error: any) {
    console.error('Temp admin validation error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Revoke a temporary admin token
export async function DELETE(request: NextRequest) {
  try {
    const { tempToken } = await request.json();

    if (!tempToken) {
      return Response.json({ error: 'Token is required' }, { status: 400 });
    }

    // Check if token exists
    if (!tempTokenStore.has(tempToken)) {
      return Response.json({ error: 'Token not found' }, { status: 404 });
    }

    // Remove the token
    tempTokenStore.delete(tempToken);

    return Response.json({
      success: true,
      message: 'Token revoked successfully'
    });
  } catch (error: any) {
    console.error('Temp admin token revocation error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate a temporary token
function generateTempToken(userId: number): string {
  // Create a unique token based on user ID and timestamp
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `admin_${userId}_${timestamp}_${randomPart}`;
}

// Helper function to validate temporary token
function isValidTempToken(token: string): boolean {
  const tokenData = tempTokenStore.get(token);
  if (!tokenData) {
    return false; // Token doesn't exist
  }

  if (Date.now() > tokenData.expiresAt) {
    // Token has expired, remove it
    tempTokenStore.delete(token);
    return false;
  }

  return true;
}

// Clean up expired tokens
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of tempTokenStore.entries()) {
    if (now > data.expiresAt) {
      tempTokenStore.delete(token);
    }
  }
}