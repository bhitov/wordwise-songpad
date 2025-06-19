/**
 * @file API route for manually checking song generation status.
 * This is a debugging endpoint to test the Mureka API status checking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSongStatus } from '@/lib/ai/mureka';

/**
 * Handle GET requests to check song status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  console.log('🎵 Song Status API - Received request');
  
  try {
    const { userId } = await auth();

    if (!userId) {
      console.log('🎵 Song Status API - Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { taskId } = await params;
    console.log('🎵 Song Status API - Checking status for task:', { taskId, userId });

    // Call Mureka API to get status
    const statusResponse = await getSongStatus(taskId);

    console.log('🎵 Song Status API - Status retrieved successfully');

    return NextResponse.json({
      success: true,
      data: statusResponse,
    });

  } catch (error) {
    console.error('🎵 Song Status API - Error occurred:', {
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