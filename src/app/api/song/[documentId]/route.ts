/**
 * @file API route for fetching songs by document ID.
 * Handles GET requests to retrieve all songs associated with a document.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { documents, songs } from '@/lib/db/schema';
import { getSongStatus } from '@/lib/ai/mureka';

/**
 * Handle GET requests to fetch songs for a document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  console.log('🎵 Song Fetch API - Received request');
  
  try {
    const { userId } = await auth();

    if (!userId) {
      console.log('🎵 Song Fetch API - Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { documentId } = await params;
    console.log('🎵 Song Fetch API - Fetching songs for document:', { documentId, userId });

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

    // Fetch all songs for this document
    const documentSongs = await db
      .select({
        id: songs.id,
        status: songs.status,
        songUrl: songs.songUrl,
        failedReason: songs.failedReason,
        prompt: songs.prompt,
        model: songs.model,
        murekaTaskId: songs.murekaTaskId,
        createdAt: songs.createdAt,
        updatedAt: songs.updatedAt,
      })
      .from(songs)
      .where(eq(songs.documentId, documentId))
      .orderBy(songs.createdAt);

    console.log('🎵 Song Fetch API - Found songs:', {
      count: documentSongs.length,
      songs: documentSongs.map(s => ({ id: s.id, status: s.status, hasUrl: !!s.songUrl })),
    });

    // Check status with Mureka for songs that are still in progress
    const updatedSongs = await Promise.all(
      documentSongs.map(async (song) => {
        // Only check status for songs that are still in progress
        const inProgressStatuses = ['preparing', 'queued', 'running'];
        if (!inProgressStatuses.includes(song.status)) {
          console.log('🎵 Song Fetch API - Song already completed, skipping status check:', {
            songId: song.id,
            status: song.status,
          });
          return song;
        }

        try {
          console.log('🎵 Song Fetch API - Checking status with Mureka for song:', {
            songId: song.id,
            murekaTaskId: song.murekaTaskId,
            currentStatus: song.status,
          });

          // Get fresh status from Mureka
          const murekaStatus = await getSongStatus(song.murekaTaskId);
          
          console.log('🎵 Song Fetch API - Received status from Mureka:', {
            songId: song.id,
            oldStatus: song.status,
            newStatus: murekaStatus.status,
            hasChoices: !!murekaStatus.choices,
            choicesCount: murekaStatus.choices?.length || 0,
          });

          // Update database if status has changed
          if (murekaStatus.status !== song.status) {
            const updateData: any = {
              status: murekaStatus.status,
              updatedAt: new Date(),
            };

            // Handle successful completion
            if (murekaStatus.status === 'succeeded' && murekaStatus.choices && murekaStatus.choices.length > 0) {
              const songUrl = murekaStatus.choices[0].url;
              if (songUrl) {
                updateData.songUrl = songUrl;
                console.log('🎵 Song Fetch API - Song completed, updating with URL');
              }
            }

            // Handle failure
            if (murekaStatus.status === 'failed' && murekaStatus.failed_reason) {
              updateData.failedReason = murekaStatus.failed_reason;
              console.log('🎵 Song Fetch API - Song failed, updating with reason:', murekaStatus.failed_reason);
            }

            console.log('🎵 Song Fetch API - Updating database with new status:', updateData);

            // Update the database
            await db
              .update(songs)
              .set(updateData)
              .where(eq(songs.id, song.id));

            // Return updated song data
            return {
              ...song,
              status: murekaStatus.status,
              songUrl: updateData.songUrl || song.songUrl,
              failedReason: updateData.failedReason || song.failedReason,
              updatedAt: updateData.updatedAt,
            };
          }

          return song;
        } catch (error) {
          console.error('🎵 Song Fetch API - Error checking status with Mureka:', {
            songId: song.id,
            murekaTaskId: song.murekaTaskId,
            error: error instanceof Error ? error.message : error,
          });
          
          // Mark song as failed due to API error and update database
          const errorMessage = error instanceof Error ? error.message : 'Unknown API error';
          const updateData = {
            status: 'failed',
            failedReason: `API Error: ${errorMessage}`,
            updatedAt: new Date(),
          };

          console.log('🎵 Song Fetch API - Marking song as failed due to API error:', {
            songId: song.id,
            updateData,
          });

          try {
            // Update the database to mark as failed
            await db
              .update(songs)
              .set(updateData)
              .where(eq(songs.id, song.id));

            // Return updated song data with failed status
            return {
              ...song,
              status: 'failed',
              failedReason: updateData.failedReason,
              updatedAt: updateData.updatedAt,
            };
          } catch (dbError) {
            console.error('🎵 Song Fetch API - Failed to update database with error status:', {
              songId: song.id,
              dbError: dbError instanceof Error ? dbError.message : dbError,
            });
            
            // Return original song data if database update fails
            return song;
          }
        }
      })
    );

    const responseData = {
      success: true,
      data: updatedSongs.map(song => ({
        id: song.id,
        status: song.status,
        songUrl: song.songUrl,
        failedReason: song.failedReason,
        prompt: song.prompt,
        model: song.model,
        createdAt: song.createdAt.toISOString(),
        updatedAt: song.updatedAt.toISOString(),
      })),
    };

    console.log('🎵 Song Fetch API - Returning response with', responseData.data.length, 'songs (with fresh status)');

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('🎵 Song Fetch API - Error occurred:', {
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