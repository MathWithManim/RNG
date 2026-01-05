import { NextRequest, NextResponse } from 'next/server';
import { checkEmailExists, createUser, getUserByEmailWithPassword } from '../../../lib/database-sqlite';

// Simple in-memory rate limiting (for demo purposes)
// In production, use Redis or a database for rate limiting
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

// Rate limiting function
const isRateLimited = (identifier: string): boolean => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const record = rateLimitMap.get(identifier);

  if (!record) {
    // First attempt
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return false;
  }

  // Check if window has passed
  if (now - record.timestamp > windowMs) {
    // Reset the counter
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return false;
  }

  // Check if max attempts reached
  if (record.count >= maxAttempts) {
    return true; // Rate limited
  }

  // Increment count
  rateLimitMap.set(identifier, { count: record.count + 1, timestamp: record.timestamp });
  return false;
};

export async function POST(request: NextRequest) {
  try {
    // Get IP address for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Apply rate limiting to sign in attempts
    const { email, password, username, action } = await request.json();

    if (action === 'signin') {
      if (isRateLimited(`signin:${ip}`)) {
        return NextResponse.json({ error: 'Too many sign in attempts. Please try again later.' }, { status: 429 });
      }
    }

    if (action === 'signup') {
      if (isRateLimited(`signup:${ip}`)) {
        return NextResponse.json({ error: 'Too many sign up attempts. Please try again later.' }, { status: 429 });
      }
    }

    switch (action) {
      case 'signup':
        // Check if email already exists
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
          return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        // Create new user with plaintext password
        const newUser = await createUser({
          email,
          username,
          password,
        });

        // Reset rate limit after successful signup
        rateLimitMap.delete(`signup:${ip}`);

        return NextResponse.json({
          id: newUser.id,
          email: newUser.email,
          username: newUser.username
        });

      case 'signin':
        // Get user with plaintext password
        const userWithPassword = await getUserByEmailWithPassword(email);
        if (!userWithPassword) {
          // Add a small delay to prevent timing attacks
          await new Promise(resolve => setTimeout(resolve, 100));
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
        }

        // Verify the plaintext password (WARNING: Security Risk)
        if (password !== userWithPassword.password) {
          // Add a small delay to prevent timing attacks
          await new Promise(resolve => setTimeout(resolve, 100));
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
        }

        // Reset rate limit after successful sign in
        rateLimitMap.delete(`signin:${ip}`);

        // Return user without password
        return NextResponse.json({
          id: userWithPassword.id,
          email: userWithPassword.email,
          username: userWithPassword.username
        });

      case 'checkEmail':
        // Check if email exists in database
        const exists = await checkEmailExists(email);
        return NextResponse.json({ exists });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}