/**
 * @file API route for deleting individual songs.
 * Handles DELETE requests to remove a song record from the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { documents, songs } from '@/lib/db/schema';

/**
 * Handle DELETE requests to delete a specific song
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string; songId: string }> }
) {
  console.log('🗑️ Song Delete API - Received request');
  
  try {
    const { userId } = await auth();

    if (!userId) {
      console.log('🗑️ Song Delete API - Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { documentId, songId } = await params;
    console.log('🗑️ Song Delete API - Deleting song:', { documentId, songId, userId });

    // Check if document exists and user owns it
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (document.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if song exists and belongs to the document
    const [song] = await db
      .select()
      .from(songs)
      .where(and(eq(songs.id, songId), eq(songs.documentId, documentId)))
      .limit(1);

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Delete the song
    await db
      .delete(songs)
      .where(eq(songs.id, songId));

    console.log('🗑️ Song Delete API - Song deleted successfully:', { songId });

    return NextResponse.json({
      success: true,
      message: 'Song deleted successfully'
    });

  } catch (error) {
    console.error('🗑️ Song Delete API - Error occurred:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
} 