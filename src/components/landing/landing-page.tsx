'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Music } from 'lucide-react'
import { SongCard } from './song-card'

const originalText = `Transform any text into professional song lyrics instantly.
Generate complete songs with verses and choruses in under 2 minutes.



Switch between Rock, Rap, and Country genres with one click.
Convert existing lyrics from one musical style to another seamlessly.
Use "Make it Rhyme" to turn any prose into structured, flowing lyrics.


Create custom songs by describing what you want in detail.
Add a chorus with one click.
Polish your lyrics with built-in grammar checking and AI enhancement.
Scale your creative output by producing multiple original songs quickly.`

const rhymedText = `I grab the mic, SongPad's in my hand, ready to ignite, 
Transform the written word into lyrics that take flight, 
In seconds, verses crafted, like magic in the night, 
From prose to poet's dream, we hit the creative height. 

One click, I switch the vibe, from rap to rock 'n' roll, 
Country tales or hip-hop rhymes, SongPad's got control, 
Seamless transitions, style becomes your soul, 
In this digital age, music's got a brand-new goal. 

With AI by my side, polishing every line, 
Grammar checked and perfect, the flow is so divine, 
Quickly multiplying songs, creation's redesigned, 
In the world of endless beats, my lyrics always shine.`

export function LandingPage() {
  const [isRhymed, setIsRhymed] = useState(false)
  const router = useRouter()

  const handleToggle = () => {
    setIsRhymed(!isRhymed)
  }

  const handleGetStarted = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SongPad is the world's first AI-powered writing assistant specifically designed for song creation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform any text into professional lyrics across multiple genres in under 2 minutes
          </p>
          <Button 
            size="lg" 
            className="px-8 py-3 text-lg"
            onClick={handleGetStarted}
          >
            Get Started Free
          </Button>
        </div>

        {/* Demo Section */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid lg:grid-cols-3">
            {/* Controls - Left Side */}
            <div className="lg:col-span-1">
              <div className="flex flex-col h-full">
                {/* Spacer to push content down */}
                <div className="flex-grow"></div>
                
                {/* Centered Try It Section - Above Song Card */}
                <div className="flex items-center gap-4 mb-4 justify-center">
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
                
                {/* Song Card - Aligned with bottom of editor */}
                <div className="flex justify-center">
                  <SongCard isEnabled={isRhymed} />
                </div>
              </div>
            </div>

            {/* Editor Demo - Right Side */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="min-h-[300px] p-4 border border-gray-200 rounded-md bg-gray-50 text-gray-800 leading-relaxed whitespace-pre-line"
                    style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
                  >
                    {isRhymed ? rhymedText : originalText}
                  </div>
                </div>
              </div>
            </div>
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

        {/* Testimonials Section */}
        <div className="bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What Creators Are Saying
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* YouTube Creator */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">YT</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sarah</h4>
                    <p className="text-sm text-gray-600">Educational YouTuber (500K)</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "I pasted my script about the Battle of Gettysburg into SongPad, selected 'Country' genre, and within 2 minutes had a complete folk ballad. My video got 2M views!"
                </p>
              </div>
            </div>

            {/* Teacher */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">📚</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Ms. Rodriguez</h4>
                    <p className="text-sm text-gray-600">High School Chemistry Teacher</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Students remember 'The Periodic Table Rock Anthem' better than any textbook. Test scores improved 23% since I started using musical mnemonics."
                </p>
              </div>
            </div>

            {/* TikTok Creator */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">TT</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Alex</h4>
                    <p className="text-sm text-gray-600">TikTok Creator (2M followers)</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "When a new meme explodes, I use SongPad to create original songs about it within hours. I've had 12 songs go viral this year."
                </p>
              </div>
            </div>

            {/* Wedding Planner */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-bold">💒</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Maria</h4>
                    <p className="text-sm text-gray-600">Wedding Planner</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Custom songwriting used to cost $2,000+. With SongPad, I input their love story and deliver a custom song for $200. New revenue stream!"
                </p>
              </div>
            </div>

            {/* Agency Director */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">🏢</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Tom</h4>
                    <p className="text-sm text-gray-600">Creative Director</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "We produce content for 50+ brands monthly. SongPad lets us create original jingles without expensive songwriters. Scaling at speed!"
                </p>
              </div>
            </div>

            {/* Podcaster */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">🎙️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Lisa</h4>
                    <p className="text-sm text-gray-600">True Crime Podcaster</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Each episode needs a unique intro. I feed SongPad the case summary and get professional-quality theme music that matches the tone."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 