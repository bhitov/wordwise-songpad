/**
 * @file Webhook endpoint for Mureka AI song generation status updates.
 * Receives notifications when song generation tasks are completed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { songs } from '@/lib/db/schema';
import { validateMurekaWebhook } from '@/lib/ai/mureka';

/**
 * Webhook payload validation schema
 */
const webhookPayloadSchema = z.object({
  id: z.string(),
  status: z.enum(['preparing', 'queued', 'running', 'succeeded', 'failed', 'timeouted', 'cancelled']),
  finished_at: z.number().optional(),
  failed_reason: z.string().optional(),
  choices: z.array(z.object({
    url: z.string().optional(),
    duration: z.number().optional(),
  })).optional(),
});

/**
 * Handle POST requests from Mureka webhook
 */
export async function POST(request: NextRequest) {
  console.log('🎵 Mureka Webhook - Received POST request');
  
  try {
    const body = await request.text();
    const signature = request.headers.get('x-mureka-signature') || '';
    
    console.log('🎵 Mureka Webhook - Request details:', {
      bodyLength: body.length,
      hasSignature: !!signature,
      signature: signature ? `${signature.substring(0, 20)}...` : 'none',
      headers: Object.fromEntries(request.headers.entries()),
    });

    // Validate webhook signature
    if (!validateMurekaWebhook(signature, body)) {
      console.error('🎵 Mureka Webhook - Invalid signature');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse and validate payload
    let payload;
    try {
      payload = JSON.parse(body);
      console.log('🎵 Mureka Webhook - Parsed payload:', payload);
    } catch (parseError) {
      console.error('🎵 Mureka Webhook - JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const validationResult = webhookPayloadSchema.safeParse(payload);
    
    if (!validationResult.success) {
      console.error('🎵 Mureka Webhook - Invalid payload:', {
        errors: validationResult.error.errors,
        payload,
      });
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    const { id: taskId, status, finished_at, failed_reason, choices } = validationResult.data;
    
    console.log('🎵 Mureka Webhook - Processing update:', {
      taskId,
      status,
      finished_at,
      failed_reason,
      choicesCount: choices?.length || 0,
    });

    // Find the song record by Mureka task ID
    const [song] = await db
      .select()
      .from(songs)
      .where(eq(songs.murekaTaskId, taskId))
      .limit(1);

    if (!song) {
      console.error(`🎵 Mureka Webhook - Song not found for task ID: ${taskId}`);
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }
    
    console.log('🎵 Mureka Webhook - Found song record:', {
      songId: song.id,
      documentId: song.documentId,
      currentStatus: song.status,
      newStatus: status,
    });

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Handle successful completion
    if (status === 'succeeded' && choices && choices.length > 0) {
      // Use the first choice's URL
      const songUrl = choices[0].url;
      if (songUrl) {
        updateData.songUrl = songUrl;
      }
    }

    // Handle failure
    if (status === 'failed' && failed_reason) {
      updateData.failedReason = failed_reason;
    }

    console.log('🎵 Mureka Webhook - Updating song with data:', updateData);

    // Update the song record
    await db
      .update(songs)
      .set(updateData)
      .where(eq(songs.id, song.id));

    console.log(`🎵 Mureka Webhook - Successfully updated song ${song.id} with status: ${status}`);

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    console.error('🎵 Mureka Webhook - Error processing webhook:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests for webhook verification (if needed)
 */
export async function GET(request: NextRequest) {
  // Some webhook services require GET endpoint verification
  const challenge = request.nextUrl.searchParams.get('challenge');
  
  if (challenge) {
    return new Response(challenge);
  }

  return NextResponse.json({
    message: 'Mureka webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
} 