export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { getUserById } from '@/lib/database-sqlite';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return Response.json({ error: 'Unauthorized: Missing user ID' }, { status: 401 });
    }

    const id = parseInt(userId);
    if (isNaN(id)) {
      return Response.json({ error: 'Unauthorized: Invalid user ID format' }, { status: 401 });
    }

    const user = await getUserById(id);
    if (user) {
      return Response.json({
        isBanned: Boolean(user.is_banned),
        isTroll: Boolean(user.is_troll)
      }, { status: 200 });
    } else {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error getting user status:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}