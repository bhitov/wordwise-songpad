/**
 * @file API route for song generation.
 * Handles POST requests to generate songs from document content using Mureka AI.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { documents, songs } from '@/lib/db/schema';
import { generateSong } from '@/lib/ai/mureka';

/**
 * Request validation schema
 */
const generateSongSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  prompt: z.string().optional(),
  model: z.enum(['auto', 'mureka-5.5', 'mureka-6']).optional(),
});

/**
 * Handle POST requests to generate a song
 */
export async function POST(request: NextRequest) {
  console.log('🎵 Song Generation API - Received request');
  
  try {
    const { userId } = await auth();

    if (!userId) {
      console.log('🎵 Song Generation API - Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🎵 Song Generation API - Authenticated user:', userId);

    const body = await request.json();
    console.log('🎵 Song Generation API - Request body:', body);

    // Validate request body
    const validationResult = generateSongSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('🎵 Song Generation API - Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { documentId, prompt, model } = validationResult.data;
    console.log('🎵 Song Generation API - Validated request:', { documentId, prompt, model });

    // Check if document exists and user owns it
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!document) {
      console.error('🎵 Song Generation API - Document not found:', documentId);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (document.userId !== userId) {
      console.error('🎵 Song Generation API - Access denied for user:', { userId, documentUserId: document.userId });
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    console.log('🎵 Song Generation API - Document found:', {
      documentId: document.id,
      title: document.title,
      contentLength: document.content?.length || 0,
    });

    // Validate that document has content
    if (!document.content || document.content.trim().length === 0) {
      console.error('🎵 Song Generation API - Document has no content');
      return NextResponse.json(
        { error: 'Document must have content to generate a song' },
        { status: 400 }
      );
    }

    const songRequest = {
      lyrics: document.content,
      model: model || 'auto',
      prompt: 'rap',
    };

    console.log('🎵 Song Generation API - Calling Mureka API with:', {
      lyricsLength: songRequest.lyrics.length,
      model: songRequest.model,
      prompt: songRequest.prompt,
    });

    // Generate song using Mureka AI
    const songResponse = await generateSong(songRequest);

    console.log('🎵 Song Generation API - Mureka API response received:', {
      taskId: songResponse.id,
      status: songResponse.status,
      model: songResponse.model,
    });

    // Create song record in database
    const songId = crypto.randomUUID();
    const songData = {
      id: songId,
      documentId,
      murekaTaskId: songResponse.id,
      status: songResponse.status,
      prompt: 'rap',
      model: songResponse.model,
    };

    console.log('🎵 Song Generation API - Creating database record:', songData);

    const [newSong] = await db
      .insert(songs)
      .values(songData)
      .returning();

    console.log('🎵 Song Generation API - Database record created:', {
      songId: newSong.id,
      createdAt: newSong.createdAt,
    });

    const responseData = {
      success: true,
      data: {
        id: newSong.id,
        taskId: songResponse.id,
        status: songResponse.status,
        createdAt: newSong.createdAt.toISOString(),
      },
    };

    console.log('🎵 Song Generation API - Returning response:', responseData);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('🎵 Song Generation API - Error occurred:', {
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