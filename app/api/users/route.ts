import { NextRequest } from 'next/server';
export const runtime = 'nodejs';

// import { getSession } from '@/services/auth';
import { db } from '@/lib/database-sqlite';

// GET all users
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    // const session = getSession();
    // if (!session || session.userType !== 'admin') {
    //   return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get all users from database (excluding sensitive data) using SQLite
    const stmt = db.prepare('SELECT id, username, email, balance, xp, created_at, last_login, is_banned, is_troll FROM userdb ORDER BY created_at DESC');
    const rows = stmt.all();

    if (!Array.isArray(rows)) {
      return Response.json([], { status: 200 });
    }

    return Response.json(rows);
  } catch (error) {
    console.error('Error getting users:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    // const session = getSession();
    // if (!session || session.userType !== 'admin') {
    //   return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const userData = await request.json();

    // Validate required fields
    if (!userData.email || !userData.username) {
      return Response.json({ error: 'Email and username are required' }, { status: 400 });
    }

    // Create new user in database using SQLite
    const stmt = db.prepare('INSERT INTO userdb (email, username, password_hash, balance, xp) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(userData.email, userData.username, '', userData.balance || 1000, userData.xp || 0);

    const newUserId = result.lastInsertRowid as number;

    // Return the created user
    const userStmt = db.prepare('SELECT id, username, email, balance, xp, created_at, last_login FROM userdb WHERE id = ?');
    const userRow = userStmt.get(newUserId) as any;

    if (!userRow) {
      return Response.json({ error: 'User not found after creation' }, { status: 500 });
    }

    return Response.json(userRow);
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}