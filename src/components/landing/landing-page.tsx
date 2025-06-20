'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Music } from 'lucide-react'
import { SongCard } from './song-card'

const originalText = `Transform any text into professional song lyrics instantly. Generate complete songs with verses and choruses in under 2 minutes. Switch between Rock, Rap, and Country genres with one click. Convert existing lyrics from one musical style to another seamlessly. Use "Make it Rhyme" to turn any prose into structured, flowing lyrics. Create custom songs by describing what you want in detail. Polish your lyrics with built-in grammar checking and AI enhancement. Scale your creative output by producing multiple original songs quickly.`

const rhymedText = `Turn your words to gold, watch the magic unfold,
Professional lyrics in seconds, stories retold.
Two minutes flat, complete songs where it's at,
Verses and choruses flowing like a chat.

Rock, Rap, Country - switch with ease,
One click transforms, guaranteed to please.
Convert your style, mile after mile,
Seamless transitions with musical guile.

"Make it Rhyme" is the name of the game,
Turn prose to poetry, never the same.
Describe your vision, we'll make it real,
Custom songs with that perfect feel.

Grammar checked, AI enhanced,
Every lyric perfectly balanced.
Scale your output, create with speed,
Multiple originals to meet every need.`

export function LandingPage() {
  const [isRhymed, setIsRhymed] = useState(false)

  const handleToggle = () => {
    setIsRhymed(!isRhymed)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SongPad is the world's first AI-powered writing assistant specifically designed for song creation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform any text into professional lyrics across multiple genres in under 2 minutes
          </p>
        </div>

        {/* Editor Demo */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="prose prose-lg max-w-none">
              <div 
                className="min-h-[200px] p-4 border border-gray-200 rounded-md bg-gray-50 text-gray-800 leading-relaxed whitespace-pre-line"
                style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
              >
                {isRhymed ? rhymedText : originalText}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-lg font-medium text-gray-700">Try it:</span>
              <Button
                onClick={handleToggle}
                variant={isRhymed ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Music className="w-4 h-4" />
                Make it Rhyme
              </Button>
            </div>
            
            <SongCard />
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Music className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Text-to-Lyrics Magic</h3>
            <p className="text-gray-600">Transform any written content into structured, rhyming lyrics while preserving meaning</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Generate complete songs with verses and choruses in under 2 minutes</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎵</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Genre</h3>
            <p className="text-gray-600">Switch between Rock, Rap, and Country styles with intelligent AI adaptation</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to transform your content creation?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of creators who've discovered the power of AI-assisted songwriting
          </p>
          <Button size="lg" className="px-8 py-3 text-lg">
            Get Started Free
          </Button>
        </div>
      </div>
    </div>
  )
} 