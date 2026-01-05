import { NextRequest, NextResponse } from 'next/server';
import { getUserData } from '@/services/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Missing user ID' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const id = parseInt(userId);
    if (isNaN(id)) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Invalid user ID format' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user data from database
    const userData = await getUserData(id);
    if (!userData) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return user data
    return new NextResponse(
      JSON.stringify({
        balance: userData.balance,
        stats: {
          totalRolls: userData.stats.totalRolls,
          totalEarned: userData.stats.totalEarned,
          highestRarityIndex: userData.stats.highestRarityIndex,
          rebirths: userData.stats.rebirths,
          xp: userData.xp
        },
        isAdmin: userData.is_admin,
        isBanned: userData.is_banned,
        isTroll: userData.is_troll
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in /api/user:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}