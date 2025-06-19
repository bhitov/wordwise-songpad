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

/**
 * Request validation schema
 */
const updateDocumentSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title too long').optional(),
  content: z.string().max(100000, 'Content too long'),
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

    const { title, content } = validationResult.data;

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
      content,
      updatedAt: new Date(),
    };

    if (title !== undefined) {
      updateData.title = title;
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