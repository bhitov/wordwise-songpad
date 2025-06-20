/**
 * @file API route for whole-text AI operations
 * Handles requests for generating chorus and adding verses to entire documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { generateChorus, addVerse } from '@/lib/ai/openai';
import type { Genre } from '@/types';

/**
 * Request validation schema
 */
const wholeTextAISchema = z.object({
  action: z.enum(['generate-chorus', 'add-verse']),
  fullText: z.string().min(1, 'Text content is required'),
  genre: z.enum(['rap', 'rock', 'country']).default('rap'),
});

/**
 * Handle POST requests for whole-text AI operations
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    console.log('🤖 Whole-text AI API - Received request');
    console.log('🤖 Whole-text AI API - Authenticated user:', userId);

    const body = await request.json();
    console.log('🤖 Whole-text AI API - Request body:', {
      action: body.action,
      textLength: body.fullText?.length || 0,
      genre: body.genre
    });

    // Validate request body
    const validationResult = wholeTextAISchema.safeParse(body);
    if (!validationResult.success) {
      console.error('🤖 Whole-text AI API - Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { action, fullText, genre } = validationResult.data;

    console.log('🤖 Whole-text AI API - Validated request:', {
      action,
      textLength: fullText.length,
      genre
    });

    let result: string;

    try {
      if (action === 'generate-chorus') {
        console.log('🎵 Whole-text AI API - Generating chorus');
        result = await generateChorus(fullText, genre as Genre);
      } else {
        console.log('🎵 Whole-text AI API - Adding verse');
        result = await addVerse(fullText, genre as Genre);
      }

      console.log('🤖 Whole-text AI API - AI operation successful:', {
        action,
        originalLength: fullText.length,
        resultLength: result.length,
        genre
      });

      return NextResponse.json({
        success: true,
        data: {
          action,
          originalText: fullText,
          enhancedText: result,
          genre,
          originalLength: fullText.length,
          resultLength: result.length,
        },
      });

    } catch (aiError) {
      console.error('🤖 Whole-text AI API - AI operation failed:', aiError);
      return NextResponse.json(
        {
          success: false,
          error: aiError instanceof Error ? aiError.message : 'AI processing failed',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('🤖 Whole-text AI API - Unexpected error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
} 