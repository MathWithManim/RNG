import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database-sqlite';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    // Sanitize the query to prevent dangerous operations
    const queryLower = query.toLowerCase().trim();

    // Only allow safe operations
    if (!(
      queryLower.startsWith('select ')
    )) {
      return NextResponse.json({ error: 'Only SELECT queries are allowed' }, { status: 400 });
    }

    // Further validate that the query is for the userdb table
    if (!queryLower.includes('userdb')) {
      return NextResponse.json({ error: 'Only queries on the userdb table are allowed' }, { status: 400 });
    }

    // Execute the query using SQLite
    const stmt = db.prepare(query);
    const rows = stmt.all();

    return NextResponse.json({ data: rows });
  } catch (error: any) {
    console.error('Database query error:', error);
    return NextResponse.json({ error: error.message || 'Database query error' }, { status: 500 });
  }
}