'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

type NoiseColor = 'brown' | 'pink' | 'white'

const noiseTracks: Record<NoiseColor, { label: string; sublabel: string; src: string }> = {
  brown: {
    label: 'Brown Noise',
    sublabel: 'Deep rumble for silencing mental chatter',
    src: '/static/sounds/brown.mp3',
  },
  pink: {
    label: 'Pink Noise',
    sublabel: 'Balanced rain-like bed for gentle focus',
    src: '/static/sounds/pink.mp3',
  },
  white: {
    label: 'White Noise',
    sublabel: 'Bright static to mask office conversations',
    src: '/static/sounds/white.mp3',
  },
}

export default function FocusNoisePage() {
  const [activeNoise, setActiveNoise] = useState<NoiseColor>('brown')
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.src = noiseTracks[activeNoise].src
    audio.load()
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    }
  }, [activeNoise, isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying])

  const togglePlayback = () => {
    setIsPlaying((prev) => !prev)
  }

  const handleVolumeChange = (value: string) => {
    const nextVolume = parseFloat(value)
    setVolume(nextVolume)
    if (audioRef.current) {
      audioRef.current.volume = nextVolume
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.5em] text-gray-400 uppercase">
            Deep Work Utility
          </p>
          <h1 className="mt-4 text-4xl font-bold text-gray-900">Deep Focus Noise Generator</h1>
          <p className="mt-3 text-lg text-gray-600">
            Select a color frequency to mask distractions.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-full bg-gray-100 p-1">
            {(Object.keys(noiseTracks) as NoiseColor[]).map((color) => {
              const isActive = activeNoise === color
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setActiveNoise(color)}
                  className={`flex-1 rounded-full px-5 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-white text-pink-500 shadow' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {noiseTracks[color].label}
                </button>
              )
            })}
          </div>

          <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <div className="text-gray-800">
                <p className="text-xs font-semibold tracking-[0.4em] text-gray-400 uppercase">
                  Now Playing
                </p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {noiseTracks[activeNoise].label}
                </h2>
                <p className="text-sm text-gray-500">{noiseTracks[activeNoise].sublabel}</p>
              </div>

              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={togglePlayback}
                  className={`inline-flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg shadow-pink-500/30 transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400 ${
                    isPlaying ? 'bg-gray-900' : 'bg-pink-500'
                  }`}
                  aria-label={isPlaying ? 'Pause noise' : 'Play noise'}
                >
                  {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-semibold tracking-[0.3em] text-gray-400 uppercase">
                    <span>Volume</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(event) => handleVolumeChange(event.target.value)}
                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-pink-500"
                  />
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <motion.div
                className="relative flex h-48 w-48 items-center justify-center rounded-full border border-pink-200 bg-pink-50"
                animate={
                  isPlaying
                    ? {
                        scale: [1, 1.07, 1],
                        boxShadow: [
                          '0 0 0px rgba(236,72,153,0.2)',
                          '0 0 40px rgba(236,72,153,0.35)',
                          '0 0 0px rgba(236,72,153,0.2)',
                        ],
                      }
                    : { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' }
                }
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.span
                  className="absolute h-64 w-64 rounded-full border border-pink-100"
                  animate={
                    isPlaying
                      ? { opacity: [0.3, 0.7, 0.3], scale: [0.85, 1.05, 0.85] }
                      : { opacity: 0.2, scale: 0.9 }
                  }
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative rounded-full bg-white px-6 py-4 text-center shadow">
                  <p className="text-sm font-semibold text-gray-500">Color</p>
                  <p className="text-xl font-bold text-gray-900">
                    {noiseTracks[activeNoise].label}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-gray-700">
            <p className="text-sm font-semibold tracking-[0.4em] text-pink-500 uppercase">
              Why it works
            </p>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
              Brown noise (low frequency) is often preferred by ADHD brains because it dampens the
              'internal monologue' and creates a consistent sound blanket, unlike White noise which
              can be too harsh.
            </p>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        loop
        preload="auto"
        src={noiseTracks[activeNoise].src}
        className="hidden"
        aria-label="Focus noise player"
      >
        <track kind="captions" src="/static/captions/blank.vtt" label="Audio track" />
      </audio>
    </div>
  )
}

const PlayIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="7 4 20 12 7 20 7 4" />
  </svg>
)

const PauseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="6" y1="4" x2="6" y2="20" />
    <line x1="18" y1="4" x2="18" y2="20" />
  </svg>
)
