export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserData } from '@/lib/database-sqlite';

interface RouteParams {
  id: string;
}

// GET user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  const { id } = await params; // Await params
  try {
    // Check if user is admin
    // const session = getSession();
    // if (!session || session.userType !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const userId = parseInt(id); // Use destructured 'id'
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Get user from database using the existing function
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive data before returning
    const { password_hash, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
): Promise<NextResponse> {
  const { id } = await params; // Await params
  try {
    // Check if user is admin
    // const session = getSession();
    // if (!session || session.userType !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const userId = parseInt(id); // Use destructured 'id'
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const updates = await request.json();

    // Update user data by numeric ID using the existing function
    await updateUserData(userId, updates);

    // Return updated user
    const updatedUser = await getUserById(userId);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found after update' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
): Promise<NextResponse> {
  const { id } = await params; // Await params
  try {
    // Check if user is admin
    // const session = getSession();
    // if (!session || session.userType !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const userId = parseInt(id); // Use destructured 'id'
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const db = (await import('@/lib/database-sqlite')).db;

    // Delete user from database using SQLite
    const stmt = db.prepare('DELETE FROM userdb WHERE id = ?');
    const result = stmt.run(userId);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}