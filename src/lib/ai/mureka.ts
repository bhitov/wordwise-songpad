/**
 * @file Mureka AI client for song generation.
 * Handles API communication with the Mureka platform for generating music from lyrics.
 */

/**
 * Mureka API configuration
 */
const MUREKA_API_BASE_URL = 'https://api.mureka.ai';
const MUREKA_API_KEY = process.env.MUREKA_API_KEY;

if (!MUREKA_API_KEY) {
  console.warn('MUREKA_API_KEY environment variable is not set. Song generation will not work.');
}

/**
 * Song generation request interface
 */
export interface SongGenerationRequest {
  lyrics: string;
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
    const response = await fetch(`${MUREKA_API_BASE_URL}/v1/song/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MUREKA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lyrics: request.lyrics,
        model: request.model || 'auto',
        prompt: request.prompt,
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
    return data as SongGenerationResponse;
  } catch (error) {
    console.error('Error generating song with Mureka AI:', error);
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