/**
 * @file Component for displaying and managing generated songs.
 * Shows all songs associated with a document, their status, and audio players for completed songs.
 */

'use client';

import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Music, 
  Play, 
  Pause, 
  Download, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Song data interface
 */
interface Song {
  id: string;
  name?: string; // Document title at time of song creation
  status: 'preparing' | 'queued' | 'running' | 'succeeded' | 'failed' | 'timeouted' | 'cancelled';
  songUrl?: string;
  failedReason?: string;
  prompt?: string;
  model?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Props for the GeneratedSongsList component
 */
interface GeneratedSongsListProps {
  documentId: string;
}

/**
 * Ref interface for imperative actions
 */
export interface GeneratedSongsListRef {
  refresh: () => void;
}

/**
 * Get status badge variant and icon
 */
function getStatusInfo(status: Song['status']) {
  switch (status) {
    case 'succeeded':
      return { 
        variant: 'default' as const, 
        icon: CheckCircle2, 
        label: 'Complete',
        color: 'text-green-600'
      };
    case 'failed':
    case 'timeouted':
    case 'cancelled':
      return { 
        variant: 'destructive' as const, 
        icon: XCircle, 
        label: 'Failed',
        color: 'text-red-600'
      };
    case 'preparing':
    case 'queued':
    case 'running':
      return { 
        variant: 'secondary' as const, 
        icon: Loader2, 
        label: 'Generating...',
        color: 'text-blue-600'
      };
    default:
      return { 
        variant: 'outline' as const, 
        icon: Clock, 
        label: 'Unknown',
        color: 'text-gray-600'
      };
  }
}

/**
 * Individual song card component
 */
function SongCard({ song, onDelete }: { song: Song; onDelete: (songId: string) => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const statusInfo = getStatusInfo(song.status);
  const StatusIcon = statusInfo.icon;

  // Initialize audio element for completed songs
  useEffect(() => {
    if (song.songUrl && !audio) {
      const audioElement = new Audio(song.songUrl);
      audioElement.addEventListener('ended', () => setIsPlaying(false));
      audioElement.addEventListener('error', () => {
        toast.error('Error playing audio');
        setIsPlaying(false);
      });
      setAudio(audioElement);
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('ended', () => setIsPlaying(false));
        audio.removeEventListener('error', () => setIsPlaying(false));
      }
    };
  }, [song.songUrl, audio]);

  const handlePlayPause = useCallback(() => {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          toast.error('Error playing audio');
          setIsPlaying(false);
        });
    }
  }, [audio, isPlaying]);

  const handleDownload = useCallback(() => {
    if (!song.songUrl) return;

    const link = document.createElement('a');
    link.href = song.songUrl;
    link.download = `song-${song.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [song.songUrl, song.id]);

  const handleDelete = useCallback(async () => {
    if (isDeleting) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this song? This action cannot be undone.');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(song.id);
    } catch (error) {
      console.error('Failed to delete song:', error);
      toast.error('Failed to delete song');
    } finally {
      setIsDeleting(false);
    }
  }, [song.id, onDelete, isDeleting]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="grid grid-cols-[1fr_auto] gap-2 items-start w-full">
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <Music className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <CardTitle className="text-sm truncate">
              {song.name ? `Song ${song.name}` : `Song #${song.id.slice(-8)}`}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          >
            {isDeleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
          </Button>
        </div>
        
        {song.prompt && (
          <CardDescription className="text-xs mt-2">
            Style: {song.prompt}
          </CardDescription>
        )}
        
        <div className="mt-1">
          <Badge variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
            <StatusIcon 
              className={`h-3 w-3 ${statusInfo.color} ${
                song.status === 'preparing' || song.status === 'queued' || song.status === 'running' 
                  ? 'animate-spin' 
                  : ''
              }`} 
            />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {song.status === 'succeeded' && song.songUrl && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePlayPause}
              className="flex items-center gap-2"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        )}

        {song.status === 'failed' && song.failedReason && (
          <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
            <div className="text-sm text-destructive">
              <p className="font-medium">Generation failed</p>
              <p className="text-xs opacity-80">{song.failedReason}</p>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-2">
          Created: {new Date(song.createdAt).toLocaleString()}
          {song.model && ` • Model: ${song.model}`}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main component for displaying generated songs list
 */
export const GeneratedSongsList = forwardRef<GeneratedSongsListRef, GeneratedSongsListProps>(
  function GeneratedSongsList({ documentId }, ref) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch songs for the document
  const fetchSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/song/${documentId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch songs: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSongs(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch songs');
      }
    } catch (err) {
      console.error('Error fetching songs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch songs');
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  // Expose refresh function via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchSongs
  }), [fetchSongs]);

  // Delete song function
  const deleteSong = useCallback(async (songId: string) => {
    try {
      console.log('🗑️ Deleting song:', songId);
      
      const response = await fetch(`/api/song/${documentId}/${songId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete song');
      }

      console.log('🗑️ Song deleted successfully:', songId);
      toast.success('Song deleted successfully');
      
      // Remove the song from local state immediately for better UX
      setSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
      
    } catch (error) {
      console.error('🗑️ Error deleting song:', error);
      throw error; // Re-throw so SongCard can handle the error
    }
  }, [documentId]);

  // Initial fetch
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Poll for updates on generating songs
  useEffect(() => {
    const hasGeneratingSongs = songs.some(song => 
      ['preparing', 'queued', 'running'].includes(song.status)
    );

    if (!hasGeneratingSongs) return;

    const interval = setInterval(fetchSongs, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [songs, fetchSongs]);

  if (isLoading && songs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading songs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">{error}</p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={fetchSongs}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-center p-8">
        <Music className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No songs generated yet. Click "Generate Song" to create your first track!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Generated Songs ({songs.length})</h3>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={fetchSongs}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Refresh'
          )}
        </Button>
      </div>
      
      <div className="space-y-3">
        {songs.map((song) => (
          <SongCard key={song.id} song={song} onDelete={deleteSong} />
        ))}
      </div>
    </div>
  );
  }
);