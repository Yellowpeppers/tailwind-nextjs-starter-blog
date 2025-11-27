'use client'

import { motion } from 'framer-motion'
import { ReactNode, useEffect, useRef, useState } from 'react'

type SoundOption = {
  id: string
  name: string
  path: string
  detail: string
}

const SOUND_LIBRARY: SoundOption[] = [
  {
    id: 'brown',
    name: 'Brown',
    path: '/static/sounds/brown.mp3',
    detail: 'Low rumble to calm intrusive thoughts',
  },
  {
    id: 'white',
    name: 'White',
    path: '/static/sounds/white.mp3',
    detail: 'Bright static for masking office chatter',
  },
  {
    id: 'pink',
    name: 'Pink',
    path: '/static/sounds/pink.mp3',
    detail: 'Balanced rainfall profile for gentle focus',
  },
]

const SoundVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  if (!isPlaying) {
    return (
      <span
        className="h-0.5 w-8 rounded-full bg-gray-300 dark:bg-gray-600"
        aria-hidden="true"
      />
    )
  }

  return (
    <div className="flex h-6 items-end gap-1" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => (
        <motion.span
          key={index}
          className="w-1 rounded-full bg-pink-500"
          animate={{ scaleY: [0.3, 1, 0.4] }}
          transition={{
            repeat: Infinity,
            duration: 0.9,
            delay: index * 0.15,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: 'bottom center' }}
        />
      ))}
    </div>
  )
}

type TimerPreset = 'focus' | 'short' | 'long'

const timerPresets: Record<TimerPreset, { label: string; duration: number }> = {
  focus: { label: 'Focus · 25m', duration: 25 * 60 },
  short: { label: 'Short Break · 5m', duration: 5 * 60 },
  long: { label: 'Long Break · 15m', duration: 15 * 60 },
}

export function FocusLabIntro() {
  return (
    <header className="space-y-4 text-center lg:text-left">
      <p className="text-primary-500 text-xs font-semibold tracking-[0.4em] uppercase">
        Focus Stack
      </p>
      <div className="space-y-3">
        <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100">
          Focus Lab: Your External Executive Function System
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Body Doubling, Brown Noise, and Pomodoro rhythms sit side-by-side so ADHD brains can
          regulate dopamine without context switching. Treat this like a mission control panel:
          stack accountability rooms, brown noise, and targeted sprints to coax your nervous system
          into calm momentum.
        </p>
      </div>
    </header>
  )
}

type WidgetCardProps = {
  title: string
  subtitle: string
  children: ReactNode
}

const WidgetCard = ({ title, subtitle, children }: WidgetCardProps) => (
  <section className="flex h-full flex-col rounded-[32px] border border-gray-200/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-300 sm:p-8 dark:border-gray-800/80 dark:bg-gray-950/85">
    <div className="space-y-1">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
    </div>
    <div className="mt-6 flex-1">{children}</div>
  </section>
)

export function SonicShieldCard() {
  return (
    <WidgetCard
      title="Sonic Shield"
      subtitle="Layer brown, pink, or white noise without leaving this tab."
    >
      <SonicShieldWidget />
    </WidgetCard>
  )
}

export function TimerCard() {
  return (
    <WidgetCard title="Pomodoro Timer" subtitle="25-5-15 ADHD cycles with a calming progress ring.">
      <TimerWidget />
    </WidgetCard>
  )
}

export function TaskBreakerCard() {
  return (
    <WidgetCard title="AI Task Breaker" subtitle="Shrink overwhelming tasks into tiny steps.">
      <TaskBreakerWidget />
    </WidgetCard>
  )
}

export function BrainDumpCard() {
  return (
    <WidgetCard
      title="Brain Dump"
      subtitle="Capture distractions so your prefrontal cortex can relax."
    >
      <BrainDumpWidget />
    </WidgetCard>
  )
}

const SonicShieldWidget = () => {
  const [activeSound, setActiveSound] = useState<string>(SOUND_LIBRARY[0].id)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const audioRef = useRef<HTMLAudioElement>(null)

  const soundMeta = SOUND_LIBRARY.find((sound) => sound.id === activeSound) ?? SOUND_LIBRARY[0]

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.src = soundMeta.path
    audio.load()
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    }
  }, [activeSound, isPlaying, soundMeta.path])

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
    <div className="flex h-full flex-col justify-between gap-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-gray-100 p-1 dark:bg-gray-800">
          {SOUND_LIBRARY.map((sound) => {
            const isActive = activeSound === sound.id
            return (
              <button
                key={sound.id}
                type="button"
                onClick={() => setActiveSound(sound.id)}
                className={`flex-1 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {sound.name}
              </button>
            )
          })}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/60">
          <p className="text-xs font-semibold tracking-[0.3em] text-gray-400 uppercase">
            Now playing
          </p>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {soundMeta.name}
            </p>
            <SoundVisualizer isPlaying={isPlaying} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{soundMeta.detail}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlayback}
          className={`shadow-primary-500/30 focus-visible:outline-primary-400 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            isPlaying ? 'bg-gray-900 dark:bg-gray-100 dark:text-gray-900' : 'bg-primary-500'
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
            className="accent-primary-500 mt-3 w-full cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700"
            aria-label="Adjust volume"
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        loop
        preload="auto"
        src={soundMeta.path}
        className="hidden"
        aria-label="Sonic Shield noise player"
      >
        <track kind="captions" src="/static/captions/blank.vtt" label="Audio track" />
      </audio>
    </div>
  )
}

const TimerWidget = () => {
  const [activePreset, setActivePreset] = useState<TimerPreset>('focus')
  const [timeLeft, setTimeLeft] = useState(timerPresets.focus.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [timerMode, setTimerMode] = useState<'countdown' | 'target'>('countdown')
  const [targetTime, setTargetTime] = useState('')
  const [targetDuration, setTargetDuration] = useState(0)

  useEffect(() => {
    if (timerMode === 'countdown') {
      setTimeLeft(timerPresets[activePreset].duration)
      setTargetDuration(0)
      setIsRunning(false)
    }
  }, [activePreset, timerMode])

  useEffect(() => {
    if (timerMode === 'target' && targetTime) {
      const diff = getSecondsUntilTarget(targetTime)
      setTimeLeft(diff)
      setTargetDuration(diff)
      setIsRunning(false)
    }
  }, [timerMode, targetTime])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (timeLeft === 0) {
      setIsRunning(false)
    }
  }, [timeLeft])

  const handleStartPause = () => {
    if (timeLeft === 0) {
      if (timerMode === 'countdown') {
        setTimeLeft(timerPresets[activePreset].duration)
      } else if (timerMode === 'target' && targetTime) {
        const next = getSecondsUntilTarget(targetTime)
        setTargetDuration(next)
        setTimeLeft(next)
      }
    }
    setIsRunning((prev) => !prev)
  }

  const handleReset = () => {
    setIsRunning(false)
    if (timerMode === 'countdown') {
      setTimeLeft(timerPresets[activePreset].duration)
    } else if (timerMode === 'target' && targetTime) {
      const diff = getSecondsUntilTarget(targetTime)
      setTargetDuration(diff)
      setTimeLeft(diff)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  const fullDuration =
    timerMode === 'countdown'
      ? timerPresets[activePreset].duration
      : targetDuration || Math.max(timeLeft, 1)
  const progress = Math.min(Math.max(timeLeft / fullDuration, 0), 1)
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="flex h-full flex-col items-center py-2">
      <div className="my-4 flex w-full flex-col items-center gap-4">
        <div className="flex w-full max-w-[240px] rounded-lg bg-gray-100 p-1">
          {(['countdown', 'target'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTimerMode(mode)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                timerMode === mode
                  ? 'bg-white shadow-sm text-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {mode === 'countdown' ? 'COUNTDOWN' : 'TARGET TIME'}
            </button>
          ))}
        </div>

        <div className="flex w-full justify-center gap-2">
          {timerMode === 'countdown' ? (
            (['focus', 'short', 'long'] as TimerPreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setActivePreset(preset)}
                className={`rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  activePreset === preset
                    ? 'border-pink-200 bg-pink-50 text-pink-600'
                    : 'text-gray-600 hover:border-pink-200 hover:text-pink-600'
                }`}
              >
                {preset === 'focus' ? 'Focus' : preset === 'short' ? 'Short' : 'Long'}
              </button>
            ))
          ) : (
            <div className="flex w-full max-w-[240px] flex-col items-center gap-2">
              <input
                type="time"
                value={targetTime}
                onChange={(event) => setTargetTime(event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
              <button
                type="button"
                onClick={() => {
                  if (!targetTime) return
                  const diff = getSecondsUntilTarget(targetTime)
                  setTargetDuration(diff)
                  setTimeLeft(diff)
                  setIsRunning(false)
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors hover:border-pink-200 hover:text-pink-600"
              >
                Sync Target
              </button>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">
                Hit a specific clock time
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative my-6 flex h-48 w-48 items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#ec4899"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="relative z-10 text-4xl font-mono font-bold text-gray-900 tabular-nums">
          {display}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-auto pt-4 w-full justify-center border-t border-gray-50">
        <button
          type="button"
          onClick={handleStartPause}
          className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-2 rounded-full font-bold shadow-lg shadow-pink-200 transition-transform active:scale-95"
        >
          {isRunning ? 'PAUSE' : 'START'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="text-gray-400 hover:text-gray-600 text-xs font-medium uppercase tracking-widest px-4"
        >
          RESET
        </button>
      </div>
    </div>
  )
}

const getSecondsUntilTarget = (timeStr: string) => {
  if (!timeStr) return 0
  const [hours, minutes] = timeStr.split(':').map((value) => parseInt(value, 10))
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0
  const now = new Date()
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)
  if (target <= now) {
    target.setDate(target.getDate() + 1)
  }
  return Math.max(Math.round((target.getTime() - now.getTime()) / 1000), 0)
}

const TaskBreakerWidget = () => {
  const [task, setTask] = useState('')
  const [visibleSteps, setVisibleSteps] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timeoutsRef.current.forEach((timer) => clearTimeout(timer))
    timeoutsRef.current = []
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  const handleBreakDown = () => {
    if (!task.trim()) return
    clearTimers()
    setIsLoading(true)
    setVisibleSteps([])
    const loadingTimer = setTimeout(() => {
      const generated = mockTaskBreakdown(task)
      setIsLoading(false)
      generated.forEach((step, index) => {
        const timer = setTimeout(() => {
          setVisibleSteps((prev) => [...prev, step])
        }, index * 500)
        timeoutsRef.current.push(timer)
      })
    }, 1500)
    timeoutsRef.current.push(loadingTimer)
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col gap-4">
      <textarea
        value={task}
        onChange={(event) => setTask(event.target.value)}
        placeholder="What are you trying to do?"
        className="focus:border-primary-400 min-h-[110px] flex-1 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />
      <button
        type="button"
        onClick={handleBreakDown}
        className="from-primary-500 shadow-primary-500/30 hover:from-primary-600 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r to-pink-500 px-4 py-3 text-sm font-semibold tracking-wide text-white uppercase shadow-lg transition hover:to-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400"
      >
        <MagicIcon className="h-4 w-4" /> Break it down for me
      </button>

      <div className="rounded-2xl border border-dashed border-gray-200 p-4 dark:border-gray-700">
        {isLoading ? (
          <p className="animate-pulse text-sm font-semibold text-gray-500 dark:text-gray-300">
            Thinking...
          </p>
        ) : visibleSteps.length > 0 ? (
          <ul className="space-y-3">
            {visibleSteps.map((step, index) => (
              <motion.li
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  className="text-primary-500 focus:ring-primary-400 mt-1 h-4 w-4 rounded border-gray-300"
                />
                <div>
                  <p className="font-semibold">Step {index + 1}</p>
                  <p className="text-gray-600 dark:text-gray-300">{step}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your checklist will appear here once the goblin breaks it down.
          </p>
        )}
      </div>
    </div>
  )
}

const BrainDumpWidget = () => {
  const [notes, setNotes] = useState('')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('focus-lab-brain-dump')
      if (stored) {
        setNotes(stored)
      }
    } catch (error) {
      // ignore persistence errors
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('focus-lab-brain-dump', notes)
    } catch (error) {
      // ignore persistence errors
    }
  }, [notes])

  return (
    <div className="flex h-full flex-col">
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Distracting thought? Type it here and let it go..."
        className="focus:border-primary-300 min-h-[220px] flex-1 rounded-3xl border border-dashed border-gray-200 bg-white/80 p-5 text-base text-gray-800 shadow-inner focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        This pad saves automatically in your browser.
      </p>
    </div>
  )
}

const mockTaskBreakdown = (task: string) => {
  const normalized = task.trim().toLowerCase()
  if (!normalized) return []
  if (normalized.includes('clean') && normalized.includes('room')) {
    return ['Pick up clothes', 'Take out trash', 'Make the bed', 'Wipe surfaces']
  }
  if (normalized.includes('email')) {
    return [
      'Clarify the goal of the email',
      'List key bullet points',
      'Draft a friendly intro',
      'Add any attachments',
      'Send or schedule the email',
    ]
  }
  const verbs = ['Plan', 'Break down', 'Do the messy first step', 'Review', 'Celebrate']
  return verbs.map((verb) => `${verb} ${task.toLowerCase()}`)
}

const MagicIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v3" />
    <path d="M12 18v3" />
    <path d="M5.22 5.22l2.12 2.12" />
    <path d="M16.66 16.66l2.12 2.12" />
    <path d="M3 12h3" />
    <path d="M18 12h3" />
    <path d="M5.22 18.78l2.12-2.12" />
    <path d="M16.66 7.34l2.12-2.12" />
    <path d="m14 9-5 5" />
  </svg>
)

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
