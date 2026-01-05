export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/database-sqlite';

export async function GET(request: NextRequest) {
  try {
    // Get all users from the userdb table using SQLite
    const stmt = db.prepare('SELECT * FROM userdb');
    const rows = stmt.all();

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Database view error:', error);
    // Provide a more user-friendly error message
    let errorMessage = 'Internal server error';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}