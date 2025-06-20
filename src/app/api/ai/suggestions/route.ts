/**
 * AI Suggestions API Route
 * 
 * Handles AI-powered text enhancement requests including "Convert to Lyrics"
 * functionality using OpenAI's GPT models.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { makeItRhyme, generateVersesFromDescription } from '@/lib/ai/openai';
import type { Genre } from '@/types';

// Request validation schemas
const convertToLyricsSchema = z.object({
  action: z.literal('convert-to-lyrics'),
  selectedText: z.string().min(1, 'Selected text is required'),
  fullText: z.string().optional(),
  genre: z.enum(['rap', 'rock', 'country']).optional().default('rap'),
});

const generateVersesSchema = z.object({
  action: z.literal('generate-verses'),
  selectedText: z.string().min(1, 'Description text is required'),
  fullText: z.string().optional(),
  genre: z.enum(['rap', 'rock', 'country']).optional().default('rap'),
});

const aiSuggestionsSchema = z.union([convertToLyricsSchema, generateVersesSchema]);

type AIRequest = z.infer<typeof aiSuggestionsSchema>;

/**
 * POST /api/ai/suggestions
 * Handle AI text enhancement requests
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI Suggestions API - Received request');
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      console.log('🤖 AI Suggestions API - Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    console.log('🤖 AI Suggestions API - Request body:', {
      action: body.action,
      selectedTextLength: body.selectedText?.length || 0,
      hasFullText: !!body.fullText,
      genre: body.genre || 'rap',
    });

    // Validate request based on action
    let validatedData: AIRequest;
    
    try {
      validatedData = aiSuggestionsSchema.parse(body);
    } catch (error) {
      console.error('🤖 AI Suggestions API - Validation error:', error);
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      );
    }

    // Handle the action
    let result: string;
    
    switch (validatedData.action) {
      case 'convert-to-lyrics':
        result = await makeItRhyme(
          validatedData.selectedText, 
          validatedData.fullText || '',
          validatedData.genre as Genre
        );
        break;
      
      case 'generate-verses':
        result = await generateVersesFromDescription(
          validatedData.selectedText,
          validatedData.fullText || '',
          validatedData.genre as Genre
        );
        break;
      
      default:
        return NextResponse.json(
          { error: 'Unsupported action' },
          { status: 400 }
        );
    }

    console.log('🤖 AI Suggestions API - Success:', {
      action: validatedData.action,
      genre: validatedData.genre,
      originalLength: validatedData.selectedText.length,
      resultLength: result.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        action: validatedData.action,
        genre: validatedData.genre,
        originalText: validatedData.selectedText,
        transformedText: result,
      },
    });

  } catch (error) {
    console.error('🤖 AI Suggestions API - Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'AI processing failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
} 