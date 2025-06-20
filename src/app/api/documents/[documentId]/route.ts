/**
 * @file API route for updating document content.
 * Handles PUT requests to update document title and content.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { Genre } from '@/types';

/**
 * Request validation schema
 */
const updateDocumentSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title too long').optional(),
  content: z.string().max(100000, 'Content too long').optional(),
  songGenre: z.enum(['rock', 'rap', 'country'] as const).optional(),
  songDescription: z.string().max(500, 'Description too long').optional(),
});

/**
 * Handle PUT requests to update a document
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { documentId } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = updateDocumentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { title, content, songGenre, songDescription } = validationResult.data;

    // Check if document exists and user owns it
    const [existingDocument] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (existingDocument.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update the document
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) {
      updateData.title = title;
    }

    if (content !== undefined) {
      updateData.content = content;
    }

    if (songGenre !== undefined) {
      updateData.songGenre = songGenre;
    }

    if (songDescription !== undefined) {
      updateData.songDescription = songDescription;
    }

    const [updatedDocument] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, documentId))
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDocument.id,
        title: updatedDocument.title,
        content: updatedDocument.content,
        songGenre: updatedDocument.songGenre,
        songDescription: updatedDocument.songDescription,
        updatedAt: updatedDocument.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Error updating document:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests to fetch a single document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { documentId } = await params;

    // Fetch the document
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

    return NextResponse.json({
      success: true,
      data: {
        id: document.id,
        title: document.title,
        content: document.content,
        songGenre: document.songGenre,
        songDescription: document.songDescription,
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Error fetching document:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
} 