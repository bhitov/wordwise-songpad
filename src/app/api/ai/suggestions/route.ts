/**
 * AI Suggestions API Route
 * 
 * Handles AI-powered text enhancement requests including "Make it Rhyme"
 * functionality using OpenAI's GPT models.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { makeItRhyme } from '@/lib/ai/openai';

// Request validation schema
const makeItRhymeSchema = z.object({
  action: z.literal('make-it-rhyme'),
  selectedText: z.string().min(1, 'Selected text is required'),
  fullText: z.string().optional(),
});

type MakeItRhymeRequest = z.infer<typeof makeItRhymeSchema>;

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
    });

    // Validate request based on action
    let validatedData: MakeItRhymeRequest;
    
    try {
      validatedData = makeItRhymeSchema.parse(body);
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
      case 'make-it-rhyme':
        result = await makeItRhyme(
          validatedData.selectedText, 
          validatedData.fullText || ''
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
      originalLength: validatedData.selectedText.length,
      resultLength: result.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        action: validatedData.action,
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