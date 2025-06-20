/**
 * @file Song settings panel component for the editor
 * Contains genre selector and description field for song generation
 */

'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music2 } from 'lucide-react';
import { GENRES, type Genre } from '@/types';

/**
 * Props for the song settings panel
 */
interface SongSettingsPanelProps {
  songGenre: Genre;
  songDescription: string;
  onGenreChange: (genre: Genre) => void;
  onDescriptionChange: (description: string) => void;
  className?: string;
}

/**
 * Song settings panel component
 */
export function SongSettingsPanel({
  songGenre,
  songDescription,
  onGenreChange,
  onDescriptionChange,
  className = '',
}: SongSettingsPanelProps) {
  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Music2 className="h-4 w-4" />
          Song Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Genre Selector */}
        <div className="space-y-2">
          <Label htmlFor="song-genre">Genre</Label>
          <Select
            value={songGenre}
            onValueChange={(value) => onGenreChange(value as Genre)}
          >
            <SelectTrigger id="song-genre">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="song-description">Description</Label>
          <Textarea
            id="song-description"
            placeholder="Describe the style or mood for your song..."
            value={songDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
            maxLength={500}
            className="resize-none"
          />
          <div className="text-xs text-muted-foreground text-right">
            {songDescription.length}/500
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 