/**
 * @file API route for text corrections using LanguageTool.
 * Handles POST requests to check text for grammar and spelling errors.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkText, transformMatches } from '@/lib/core/checker';
import { z } from 'zod';

/**
 * Request validation schema
 */
const checkTextSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty').max(10000, 'Text too long (max 10,000 characters)'),
  language: z.string().optional().default('en-US'),
});

/**
 * Handle POST requests for text correction checking.
 * 
 * @param request - The incoming request containing text to check
 * @returns JSON response with corrections or error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = checkTextSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { text, language } = validationResult.data;

    // Check text with LanguageTool
    const languageToolResponse = await checkText(text, language);
    
    // Transform matches into simplified format
    const corrections = transformMatches(languageToolResponse.matches);

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        corrections,
        language: languageToolResponse.language,
        totalMatches: corrections.length,
        software: languageToolResponse.software,
      },
    });

  } catch (error) {
    console.error('Error in corrections API:', error);
    
    // Return error response
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
 * Handle GET requests - return method not allowed
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to check text.' },
    { status: 405 }
  );
} 