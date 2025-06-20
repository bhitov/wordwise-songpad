/**
 * @file Mureka AI client for song generation.
 * Handles API communication with the Mureka platform for generating music from lyrics.
 */

import type { Genre } from '@/types';

/**
 * Mureka API configuration
 */
const MUREKA_API_BASE_URL = 'https://api.mureka.ai';
const MUREKA_API_KEY = process.env.MUREKA_API_KEY;

if (!MUREKA_API_KEY) {
  console.warn('MUREKA_API_KEY environment variable is not set. Song generation will not work.');
}

/**
 * Generate genre-specific prompt for Mureka AI
 */
function generateGenrePrompt(genre: Genre): string {
  const prompts = {
    rap: 'hip-hop, rap, urban, strong beat, rhythmic, modern, male vocal',
    rock: 'rock, alternative, electric guitar, powerful drums, energetic, anthemic, male vocal',
    country: 'country, acoustic guitar, storytelling, heartfelt, melodic, warm, male vocal'
  };
  
  return prompts[genre];
}

/**
 * Song generation request interface
 */
export interface SongGenerationRequest {
  lyrics: string;
  genre?: Genre;
  model?: 'auto' | 'mureka-5.5' | 'mureka-6';
  prompt?: string;
  reference_id?: string;
  vocal_id?: string;
  melody_id?: string;
}

/**
 * Song generation response interface
 */
export interface SongGenerationResponse {
  id: string;
  created_at: number;
  finished_at?: number;
  model: string;
  status: 'preparing' | 'queued' | 'running' | 'succeeded' | 'failed' | 'timeouted' | 'cancelled';
  failed_reason?: string;
  choices?: Array<{
    url?: string;
    duration?: number;
  }>;
}

/**
 * Generate a song using the Mureka AI API
 */
export async function generateSong(request: SongGenerationRequest): Promise<SongGenerationResponse> {
  if (!MUREKA_API_KEY) {
    throw new Error('Mureka API key is not configured. Please set MUREKA_API_KEY environment variable.');
  }

  try {
    // Use genre to generate appropriate prompt if no custom prompt provided
    const genre = request.genre || 'rap';
    const prompt = request.prompt || generateGenrePrompt(genre);
    
    console.log('🎵 Mureka - Generating song:', {
      genre,
      prompt,
      lyricsLength: request.lyrics.length,
      model: request.model || 'auto'
    });

    const response = await fetch(`${MUREKA_API_BASE_URL}/v1/song/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MUREKA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lyrics: request.lyrics,
        model: request.model || 'auto',
        prompt: prompt,
        reference_id: request.reference_id,
        vocal_id: request.vocal_id,
        melody_id: request.melody_id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mureka API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Mureka - Song generation started:', {
      taskId: data.id,
      status: data.status,
      genre
    });
    
    return data as SongGenerationResponse;
  } catch (error) {
    console.error('❌ Mureka - Error generating song:', error);
    throw error;
  }
}

/**
 * Get the status of a song generation task
 */
export async function getSongStatus(taskId: string): Promise<SongGenerationResponse> {
  try {
    // Note: This endpoint might not exist in the current Mureka API
    // We'll implement polling logic in the webhook/status checking
    const response = await fetch(`${MUREKA_API_BASE_URL}/v1/song/query/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MUREKA_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mureka API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data as SongGenerationResponse;
  } catch (error) {
    console.error('Error getting song status from Mureka AI:', error);
    throw error;
  }
}

/**
 * Validate a webhook request from Mureka (basic implementation)
 */
export function validateMurekaWebhook(signature: string, body: string): boolean {
  // Note: Implement proper webhook signature validation based on Mureka's documentation
  // For now, we'll return true but this should be properly implemented for security
  return true;
} 