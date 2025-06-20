'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Download } from 'lucide-react'

interface SongCardProps {
  isEnabled?: boolean
}

export function SongCard({ isEnabled = false }: SongCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = 'https://cdn.mureka.ai/cos-prod/open/song/20250620/78858497949697-CNcALGz4ah5UUAR6MUpDAz.mp3'
    link.download = 'SongPad-demo.mp3'
    link.click()
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-sm transition-all duration-300 ${
      !isEnabled ? 'opacity-50 pointer-events-none grayscale' : ''
    }`}>
      <audio 
        ref={audioRef}
        src="https://cdn.mureka.ai/cos-prod/open/song/20250620/78858497949697-CNcALGz4ah5UUAR6MUpDAz.mp3"
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 text-blue-600">♪</div>
          <h3 className="font-semibold text-gray-900">SongPad rap</h3>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">Style: rap</p>
      </div>

      <div className="mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          ✓ Complete
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        <Button 
          onClick={handlePlayPause}
          variant="outline" 
          className="flex items-center gap-2 w-20"
          disabled={!isEnabled}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        
        <Button 
          onClick={handleDownload}
          variant="outline" 
          className="flex items-center gap-2"
          disabled={!isEnabled}
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      <div className="text-xs text-gray-500">
        <p>Created: 6/20/2025, 10:17:42 AM •</p>
        <p>Model: mureka-6</p>
      </div>
    </div>
  )
} 