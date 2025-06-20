/**
 * API endpoint to mark the tour as seen for the current user
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Mark the tour as seen for the current user
 */
export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update the user's tour_seen status
    await db
      .update(users)
      .set({ 
        tourSeen: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking tour as seen:', error);
    return NextResponse.json(
      { error: 'Failed to mark tour as seen' },
      { status: 500 }
    );
  }
}

/**
 * Get the current user's tour_seen status
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's tour_seen status
    const user = await db
      .select({ tourSeen: users.tourSeen })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ tourSeen: user[0].tourSeen });
  } catch (error) {
    console.error('Error getting tour status:', error);
    return NextResponse.json(
      { error: 'Failed to get tour status' },
      { status: 500 }
    );
  }
} 