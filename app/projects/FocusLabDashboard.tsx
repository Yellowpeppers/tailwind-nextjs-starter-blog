'use client'

import { motion, AnimatePresence, Reorder, useDragControls, DragControls } from 'framer-motion'
import { ReactNode, useEffect, useRef, useState, createContext, useContext } from 'react'

// Context for passing drag controls to children
const DragHandleContext = createContext<DragControls | null>(null)

// --- Shared Components ---

const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) => {
  return (
    <div className="flex h-8 w-full min-w-max rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative flex-1 rounded-md px-3 text-xs font-bold tracking-wider whitespace-nowrap uppercase transition-all ${
              isActive
                ? 'bg-white text-pink-600 shadow-sm dark:bg-gray-700 dark:text-pink-400'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

// --- Data & Types ---

type SoundOption = {
  id: string
  name: string
  path: string
  detail: string
}

const SOUND_LIBRARY: SoundOption[] = []

const SoundVisualizer = ({ activeCount }: { activeCount: number }) => {
  if (activeCount === 0) {
    return (
      <div className="flex h-12 items-center justify-center gap-1 opacity-30" aria-hidden="true">
        <div className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
      </div>
    )
  }

  return (
    <div className="flex h-12 items-center justify-center gap-1" aria-hidden="true">
      {Array.from({ length: 8 + activeCount * 2 }).map((_, index) => (
        <motion.div
          key={index}
          className="w-1.5 rounded-full bg-pink-500/80"
          animate={{
            height: [12, 32 + Math.random() * 16, 12],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.8 + Math.random() * 0.5,
            delay: index * 0.05,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

type ActiveTrack = {
  id: string
  volume: number
  isPlaying: boolean
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

// --- Widget Card Component ---

type WidgetCardProps = {
  title: string
  subtitle: string
  children: ReactNode
}

const WidgetCard = ({ title, subtitle, children }: WidgetCardProps) => {
  const [showInfo, setShowInfo] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setShowInfo(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const dragControls = useContext(DragHandleContext)

  return (
    <motion.section
      layout
      className={`group flex h-full flex-col rounded-[32px] border border-gray-200/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-shadow duration-300 sm:p-6 dark:border-gray-800/80 dark:bg-gray-950/85`}
    >
      <div
        className="flex cursor-grab items-center justify-between gap-2 active:cursor-grabbing"
        onPointerDown={(e) => {
          dragControls?.start(e)
        }}
      >
        <div className="flex items-center gap-2">
          {/* Drag Handle (only visible when not focused) */}
          {/* <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-2 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm8-14a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-2 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm2 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8-14a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-2 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm2 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            </svg>
          </div> */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <div className="relative" ref={infoRef}>
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className={`transition-colors ${
                showInfo
                  ? 'text-pink-500 dark:text-pink-400'
                  : 'text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400'
              }`}
              aria-label="Toggle description"
            >
              <InfoIcon className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 z-50 mt-2 w-56 origin-top-left"
                >
                  <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-xl ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-900 dark:ring-white/10">
                    <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                      {subtitle}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Focus Toggle Removed for now */}
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col">{children}</div>
    </motion.section>
  )
}

// --- Grid System ---

type GridItem = {
  id: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

const INITIAL_LAYOUT: GridItem[] = [
  { id: 'sonic', x: 0, y: 0, w: 6, h: 5, minW: 6, minH: 5 }, // 5 rows, 6 cols
  { id: 'timer', x: 6, y: 0, w: 6, h: 5, minW: 4, minH: 5 }, // 5 rows, 6 cols
  { id: 'brain', x: 0, y: 5, w: 6, h: 6, minW: 4, minH: 4 }, // Min 4x4
  { id: 'breaker', x: 6, y: 5, w: 6, h: 6, minW: 4, minH: 5 }, // Min 5x4
  { id: 'dopamine', x: 0, y: 11, w: 6, h: 6, minW: 4, minH: 4 }, // New Widget
]

const GRID_COLS = 12
const ROW_HEIGHT = 60
const GAP = 24

export const FocusLabGrid = () => {
  const [layout, setLayout] = useState<GridItem[]>(INITIAL_LAYOUT)
  const [activeId, setActiveId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0) // Start at 0 to prevent FOUC

  const [isDraggingOrResizing, setIsDraggingOrResizing] = useState(false)

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const colWidth = (containerWidth - (GRID_COLS - 1) * GAP) / GRID_COLS

  // Helper to snap to grid
  const snapToGrid = (value: number, unitSize: number) => {
    return Math.round(value / unitSize) * unitSize
  }

  const updateLayout = (id: string, newProps: Partial<GridItem>) => {
    setLayout((prev) => prev.map((item) => (item.id === id ? { ...item, ...newProps } : item)))
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full transition-opacity duration-500 ${containerWidth > 0 ? 'opacity-100' : 'opacity-0'}`}
      style={{
        height: Math.max(...layout.map((i) => (i.y + i.h) * (ROW_HEIGHT + GAP))) + 100,
      }}
    >
      {/* Visible Grid Background */}

      {containerWidth > 0 &&
        layout.map((item) => (
          <DraggableResizableItem
            key={item.id}
            item={item}
            colWidth={colWidth}
            onUpdate={(newProps) => updateLayout(item.id, newProps)}
            isActive={activeId === item.id}
            onActivate={() => setActiveId(item.id)}
            onInteractionStart={() => setIsDraggingOrResizing(true)}
            onInteractionEnd={() => setIsDraggingOrResizing(false)}
          >
            {item.id === 'sonic' && <SonicShieldCard />}
            {item.id === 'timer' && <TimerCard />}
            {item.id === 'brain' && <BrainDumpCard />}
            {item.id === 'breaker' && <TaskBreakerCard />}
            {item.id === 'dopamine' && <DopamineMenuCard cols={item.w} />}
          </DraggableResizableItem>
        ))}
    </div>
  )
}

const DraggableResizableItem = ({
  item,
  colWidth,
  onUpdate,
  children,
  isActive,
  onActivate,
  onInteractionStart,
  onInteractionEnd,
}: {
  item: GridItem
  colWidth: number
  onUpdate: (props: Partial<GridItem>) => void
  children: ReactNode
  isActive: boolean
  onActivate: () => void
  onInteractionStart: () => void
  onInteractionEnd: () => void
}) => {
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const isResizingRef = useRef(false)

  // Calculate pixel positions
  const x = item.x * (colWidth + GAP)
  const y = item.y * (ROW_HEIGHT + GAP)
  const width = item.w * colWidth + (item.w - 1) * GAP
  const height = item.h * ROW_HEIGHT + (item.h - 1) * GAP

  // Manual Resize Logic
  useEffect(() => {
    if (!isResizing) return

    const handlePointerMove = (e: PointerEvent) => {
      const newWidth = startSizeRef.current.w + (e.clientX - startPosRef.current.x)
      const newHeight = startSizeRef.current.h + (e.clientY - startPosRef.current.y)

      const gridW = Math.max(item.minW || 3, Math.round(newWidth / (colWidth + GAP)))
      const gridH = Math.max(item.minH || 3, Math.round(newHeight / (ROW_HEIGHT + GAP)))

      onUpdate({ w: gridW, h: gridH })
    }

    const handlePointerUp = () => {
      setIsResizing(false)
      isResizingRef.current = false
      onInteractionEnd()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isResizing, colWidth, onUpdate, onInteractionEnd, item.minW, item.minH])

  const startPosRef = useRef({ x: 0, y: 0 })
  const startSizeRef = useRef({ w: 0, h: 0 })

  const dragControls = useDragControls()

  return (
    <motion.div
      drag={!isResizing}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      onDragStart={() => {
        if (isResizingRef.current) return
        setIsDragging(true)
        onActivate()
        onInteractionStart()
      }}
      onDragEnd={(_, info) => {
        if (!isDragging || isResizingRef.current) {
          setIsDragging(false)
          return
        }
        setIsDragging(false)
        onInteractionEnd()
        const newX = Math.max(0, Math.round((x + info.offset.x) / (colWidth + GAP)))
        const newY = Math.max(0, Math.round((y + info.offset.y) / (ROW_HEIGHT + GAP)))
        onUpdate({ x: newX, y: newY })
      }}
      initial={false}
      animate={{ x, y, width, height, zIndex: isActive ? 50 : 10 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onPointerDown={onActivate}
      className="absolute rounded-[32px] shadow-sm"
    >
      <div className="relative h-full w-full">
        <DragHandleContext.Provider value={dragControls}>{children}</DragHandleContext.Provider>

        {/* Resize Handle (Diagonal Arrow) */}
        <div
          className="absolute right-2 bottom-2 z-50 cursor-nwse-resize p-1.5 opacity-50 transition-opacity hover:opacity-100"
          onPointerDown={(e) => {
            e.stopPropagation() // Prevent drag start on the item
            e.preventDefault()
            setIsResizing(true)
            isResizingRef.current = true
            onInteractionStart()
            startPosRef.current = { x: e.clientX, y: e.clientY }
            startSizeRef.current = { w: width, h: height }
          }}
        >
          <div className="rounded-full bg-white/90 p-1 shadow-sm ring-1 ring-black/5 backdrop-blur-md dark:bg-gray-800/90 dark:ring-white/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400"
            >
              <path d="M15 9l6 6" />
              <path d="M9 15l6 6" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

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

export function DopamineMenuCard({ cols }: { cols?: number }) {
  return (
    <WidgetCard title="Dopamine Menu" subtitle="Stuck? Spin the wheel for a quick dopamine hit.">
      <DopamineMenuWidget cols={cols} />
    </WidgetCard>
  )
}

type TimerPreset = 'focus' | 'short' | 'long'

const timerPresets: Record<TimerPreset, { label: string; duration: number }> = {
  focus: { label: 'Focus · 25m', duration: 25 * 60 },
  short: { label: 'Short Break · 5m', duration: 5 * 60 },
  long: { label: 'Long Break · 15m', duration: 15 * 60 },
}

const SonicShieldWidget = () => {
  const [customSounds, setCustomSounds] = useState<SoundOption[]>([])
  const [activeTracks, setActiveTracks] = useState<Record<string, ActiveTrack>>({})
  const [masterVolume, setMasterVolume] = useState(0.8)
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})

  useEffect(() => {
    const fetchCustomSounds = async () => {
      try {
        const response = await fetch('/api/sounds')
        if (response.ok) {
          const data = await response.json()
          const newSounds = data.sounds.map((file: string) => ({
            id: `custom-${file}`,
            name: file.replace(/\.[^/.]+$/, ''),
            path: `/static/sounds/custom/${file}`,
            detail: 'Custom sound',
          }))
          setCustomSounds(newSounds)
        }
      } catch (error) {
        console.error('Failed to fetch custom sounds:', error)
      }
    }
    fetchCustomSounds()
  }, [])

  const allSounds = [...SOUND_LIBRARY, ...customSounds]

  const toggleTrack = (soundId: string) => {
    setActiveTracks((prev) => {
      if (prev[soundId]) {
        const next = { ...prev }
        delete next[soundId]
        return next
      }
      return {
        ...prev,
        [soundId]: { id: soundId, volume: 0.5, isPlaying: true },
      }
    })
  }

  const updateTrackVolume = (soundId: string, volume: number) => {
    setActiveTracks((prev) => ({
      ...prev,
      [soundId]: { ...prev[soundId], volume },
    }))
  }

  const toggleMasterPlayback = () => {
    const isAnyPlaying = Object.values(activeTracks).some((t) => t.isPlaying)
    setActiveTracks((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((key) => {
        next[key] = { ...next[key], isPlaying: !isAnyPlaying }
      })
      return next
    })
  }

  // Sync Audio Elements
  useEffect(() => {
    Object.values(activeTracks).forEach((track) => {
      const audio = audioRefs.current[track.id]
      if (audio) {
        audio.volume = track.volume * masterVolume
        if (track.isPlaying) {
          audio.play().catch(() => {})
        } else {
          audio.pause()
        }
      }
    })
  }, [activeTracks, masterVolume])

  const activeCount = Object.keys(activeTracks).length
  const isGlobalPlaying = activeCount > 0 && Object.values(activeTracks).some((t) => t.isPlaying)

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Visualizer & Master Control */}
      <div className="relative flex min-h-[100px] shrink-0 items-center justify-between rounded-2xl bg-white px-6 py-4 text-gray-900 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800">
        {/* Visualizer Area */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <SoundVisualizer activeCount={isGlobalPlaying ? activeCount : 0} />
          <div className="text-xs font-medium opacity-60">
            {activeCount === 0 ? 'Select sounds' : `${activeCount} active`}
          </div>
        </div>

        {/* Vertical Master Volume */}
        <div className="group flex h-full flex-col items-center justify-center gap-2 border-l border-gray-100 pl-4 dark:border-gray-800">
          <div
            className="relative h-16 w-1.5 cursor-pointer rounded-full bg-gray-100 py-1 transition-all hover:w-2 dark:bg-gray-800"
            onPointerDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const handleMove = (moveEvent: PointerEvent) => {
                const height = rect.height
                const bottom = rect.bottom
                const clientY = moveEvent.clientY
                // Calculate percentage from bottom (0 to 1)
                const percentage = Math.max(0, Math.min(1, (bottom - clientY) / height))
                setMasterVolume(percentage)
              }

              handleMove(e.nativeEvent) // Set initial value on click

              const handleUp = () => {
                window.removeEventListener('pointermove', handleMove)
                window.removeEventListener('pointerup', handleUp)
              }

              window.addEventListener('pointermove', handleMove)
              window.addEventListener('pointerup', handleUp)
            }}
          >
            <div
              className="absolute bottom-0 w-full rounded-full bg-gray-300 transition-all group-hover:bg-pink-500 dark:bg-gray-600 dark:group-hover:bg-pink-400"
              style={{ height: `${masterVolume * 100}%` }}
            />
            {/* Thumb indicator on hover */}
            <div
              className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:bg-gray-200"
              style={{ bottom: `calc(${masterVolume * 100}% - 6px)` }}
            />
          </div>
          <span className="text-[9px] font-bold tracking-widest uppercase opacity-40">Vol</span>
        </div>
      </div>

      {/* Sound Grid */}
      <div className="scrollbar-none flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {allSounds.map((sound) => {
            const isActive = !!activeTracks[sound.id]
            const track = activeTracks[sound.id]

            return (
              <div
                key={sound.id}
                className={`group relative flex flex-col justify-between rounded-xl border p-3 transition-all ${
                  isActive
                    ? 'border-pink-500 bg-pink-50 dark:border-pink-400 dark:bg-pink-900/20'
                    : 'border-gray-100 bg-white hover:border-pink-200 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-pink-900'
                }`}
              >
                <button
                  onClick={() => toggleTrack(sound.id)}
                  className="flex flex-1 flex-col items-start text-left"
                >
                  <span
                    className={`text-sm font-bold ${isActive ? 'text-pink-700 dark:text-pink-300' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {sound.name}
                  </span>
                </button>

                {isActive && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 mt-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={track.volume}
                      onChange={(e) => updateTrackVolume(sound.id, parseFloat(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      className="h-1 w-full cursor-pointer rounded-full bg-pink-200 accent-pink-600 dark:bg-pink-900 dark:accent-pink-400"
                    />
                  </div>
                )}

                {/* Hidden Audio Element */}
                {isActive && (
                  <audio
                    ref={(el) => {
                      if (el) audioRefs.current[sound.id] = el
                      else delete audioRefs.current[sound.id]
                    }}
                    loop
                    preload="auto"
                    src={sound.path}
                    className="hidden"
                  >
                    <track
                      kind="captions"
                      src="data:text/vtt;base64,V0VCVlRVCg=="
                      label="English"
                    />
                  </audio>
                )}
              </div>
            )
          })}
        </div>
      </div>
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
    <div className="flex h-full flex-col items-center justify-between py-2">
      {/* Top Controls */}
      <div className="flex w-full flex-col items-center gap-2">
        <div className="flex w-full max-w-[240px] rounded-lg bg-gray-100 p-1">
          {(['countdown', 'target'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTimerMode(mode)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                timerMode === mode
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {mode === 'countdown' ? 'COUNTDOWN' : 'TARGET TIME'}
            </button>
          ))}
        </div>

        {/* Presets or Target Input */}
        <div className="flex h-8 w-full items-center justify-center">
          {timerMode === 'countdown' ? (
            <div className="flex justify-center gap-2">
              {(['focus', 'short', 'long'] as TimerPreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setActivePreset(preset)}
                  className={`rounded-md border px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                    activePreset === preset
                      ? 'border-pink-200 bg-pink-50 text-pink-600 dark:border-pink-900/30 dark:bg-pink-900/20 dark:text-pink-400'
                      : 'border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  {preset === 'focus' ? '25m' : preset === 'short' ? '5m' : '15m'}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              <input
                type="time"
                value={targetTime}
                onChange={(event) => setTargetTime(event.target.value)}
                className="h-8 rounded-md border border-gray-200 bg-transparent px-2 text-xs font-semibold text-gray-800 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 focus:outline-none dark:border-gray-700 dark:text-gray-200"
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
                className="rounded-md bg-pink-50 px-3 py-1 text-[10px] font-bold tracking-wider text-pink-600 uppercase hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400"
              >
                Set
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Ring */}
      <div className="relative flex flex-1 items-center justify-center">
        <div className="relative h-44 w-44">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-gray-100 dark:text-gray-800"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="text-pink-500 transition-all duration-500 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold tracking-tight text-gray-900 tabular-nums dark:text-gray-100">
              {display}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex w-full items-center justify-center gap-4">
        <button
          type="button"
          onClick={handleReset}
          className="flex h-12 w-20 items-center justify-center rounded-full text-xs font-bold tracking-wider text-gray-400 uppercase transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          aria-label="Reset Timer"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleStartPause}
          className={`flex h-12 items-center gap-2 rounded-full px-8 text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${
            isRunning
              ? 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200'
              : 'bg-pink-500 shadow-pink-200 hover:bg-pink-600 dark:shadow-none'
          }`}
        >
          {isRunning ? (
            <>
              <PauseIcon className="h-4 w-4" /> PAUSE
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4" /> START
            </>
          )}
        </button>
        <div className="w-10" /> {/* Spacer for balance */}
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
  const [isResultView, setIsResultView] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timeoutsRef.current.forEach((timer) => clearTimeout(timer))
    timeoutsRef.current = []
  }

  useEffect(() => {
    return () => clearTimers()
  }, [])

  const handleBreakDown = async () => {
    if (!task.trim()) return
    clearTimers()
    setIsLoading(true)
    setIsResultView(true)
    setVisibleSteps([])
    setError(null)

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch steps')
      }

      const data = await response.json()
      const steps = data.steps || []

      setIsLoading(false)
      steps.forEach((step: string, index: number) => {
        const timer = setTimeout(() => {
          setVisibleSteps((prev) => [...prev, step])
        }, index * 500)
        timeoutsRef.current.push(timer)
      })
    } catch (err) {
      setIsLoading(false)
      setError('Failed to summon goblins. Please try again.')
      // Fallback to mock data if API fails (optional, but good for demo)
      const fallbackSteps = mockTaskBreakdown(task)
      fallbackSteps.forEach((step, index) => {
        const timer = setTimeout(() => {
          setVisibleSteps((prev) => [...prev, step])
        }, index * 500)
        timeoutsRef.current.push(timer)
      })
    }
  }

  const handleReset = () => {
    clearTimers()
    setTask('')
    setVisibleSteps([])
    setIsResultView(false)
    setIsLoading(false)
    setError(null)
  }

  if (isResultView) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4 rounded-2xl bg-pink-50 p-4 dark:bg-pink-900/20">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-pink-600/70 uppercase dark:text-pink-400/70">
              Current Mission
            </p>
            <p className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-gray-100">
              {task}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm hover:text-pink-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-pink-400"
          >
            New Task
          </button>
        </div>

        <div className="scrollbar-none flex-1 overflow-y-auto rounded-2xl border border-dashed border-gray-200 p-1 pr-2 dark:border-gray-700 [&::-webkit-scrollbar]:hidden">
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
              <p className="text-xs font-medium">Summoning goblins...</p>
            </div>
          ) : (
            <ul className="space-y-2 p-2">
              {visibleSteps.map((step, index) => (
                <TaskStepItem key={`${step}-${index}`} step={step} />
              ))}
              {error && <p className="p-2 text-xs text-red-500">{error}</p>}
            </ul>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
          <MagicIcon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Overwhelmed?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Type your big scary task below, and I'll break it into tiny, non-scary steps.
        </p>
      </div>

      <textarea
        value={task}
        onChange={(event) => setTask(event.target.value)}
        placeholder="e.g. Clean my entire apartment..."
        className="min-h-[100px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-pink-500 focus:bg-white focus:ring-1 focus:ring-pink-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />

      <button
        type="button"
        onClick={handleBreakDown}
        disabled={!task.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 font-bold text-white transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 dark:bg-gray-100 dark:text-gray-900"
      >
        Break it down
      </button>
    </div>
  )
}

const TaskStepItem = ({ step }: { step: string }) => {
  const [isChecked, setIsChecked] = useState(false)

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => setIsChecked(!isChecked)}
      className="group flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => {}} // Handled by parent onClick
        className="pointer-events-none h-5 w-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800"
      />
      <span
        className={`text-sm transition-all ${
          isChecked
            ? 'text-gray-400 line-through dark:text-gray-600'
            : 'text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100'
        }`}
      >
        {step}
      </span>
    </motion.li>
  )
}

type BrainDumpItem = {
  id: string
  text: string
  image?: string
}

const BrainDumpWidget = () => {
  const [leftItems, setLeftItems] = useState<BrainDumpItem[]>([])
  const [rightItems, setRightItems] = useState<BrainDumpItem[]>([])
  const [inputValue, setInputValue] = useState('')
  const [pendingImage, setPendingImage] = useState<string | null>(null)

  // Load and migrate data
  useEffect(() => {
    try {
      const storedLeft = window.localStorage.getItem('focus-lab-brain-dump-left')
      const storedRight = window.localStorage.getItem('focus-lab-brain-dump-right')

      if (storedLeft || storedRight) {
        if (storedLeft) setLeftItems(JSON.parse(storedLeft))
        if (storedRight) setRightItems(JSON.parse(storedRight))
      } else {
        // Migration from v2 (single list)
        const storedV2 = window.localStorage.getItem('focus-lab-brain-dump-list-v2')
        if (storedV2) {
          const items: BrainDumpItem[] = JSON.parse(storedV2)
          const mid = Math.ceil(items.length / 2)
          setLeftItems(items.slice(0, mid))
          setRightItems(items.slice(mid))
        } else {
          // Migration from v1 (string array)
          const storedV1 = window.localStorage.getItem('focus-lab-brain-dump-list')
          if (storedV1) {
            const oldItems: string[] = JSON.parse(storedV1)
            const migrated = oldItems.map((item) => {
              const isImage = item.startsWith('data:image')
              return {
                id: Math.random().toString(36).substring(7),
                text: isImage ? '' : item,
                image: isImage ? item : undefined,
              }
            })
            const mid = Math.ceil(migrated.length / 2)
            setLeftItems(migrated.slice(0, mid))
            setRightItems(migrated.slice(mid))
          }
        }
      }
    } catch (error) {
      // ignore persistence errors
    }
  }, [])

  // Persist data
  useEffect(() => {
    try {
      window.localStorage.setItem('focus-lab-brain-dump-left', JSON.stringify(leftItems))
      window.localStorage.setItem('focus-lab-brain-dump-right', JSON.stringify(rightItems))
    } catch (error) {
      // ignore persistence errors
    }
  }, [leftItems, rightItems])

  const handleAdd = () => {
    if (!inputValue.trim() && !pendingImage) return

    const newItem: BrainDumpItem = {
      id: Math.random().toString(36).substring(7),
      text: inputValue.trim(),
      image: pendingImage || undefined,
    }

    // Add to the shorter column
    if (leftItems.length <= rightItems.length) {
      setLeftItems((prev) => [newItem, ...prev])
    } else {
      setRightItems((prev) => [newItem, ...prev])
    }

    setInputValue('')
    setPendingImage(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()
        const blob = item.getAsFile()
        if (blob) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const base64 = event.target?.result as string
            if (base64) {
              setPendingImage(base64)
            }
          }
          reader.readAsDataURL(blob)
        }
        return
      }
    }
  }

  const handleDelete = (id: string, column: 'left' | 'right') => {
    if (column === 'left') {
      setLeftItems((prev) => prev.filter((item) => item.id !== id))
    } else {
      setRightItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const handleMoveToOtherColumn = (item: BrainDumpItem, fromColumn: 'left' | 'right') => {
    if (fromColumn === 'left') {
      setLeftItems((prev) => prev.filter((i) => i.id !== item.id))
      setRightItems((prev) => [item, ...prev])
    } else {
      setRightItems((prev) => prev.filter((i) => i.id !== item.id))
      setLeftItems((prev) => [item, ...prev])
    }
  }

  const renderCard = (item: BrainDumpItem, column: 'left' | 'right') => (
    <Reorder.Item
      key={item.id}
      value={item}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative mb-3 break-inside-avoid overflow-hidden rounded-xl shadow-sm transition-all hover:rotate-1 hover:shadow-md ${
        item.image ? 'bg-white dark:bg-gray-800' : 'bg-yellow-100 dark:bg-yellow-900/30'
      }`}
    >
      {/* Header Bar (Tape/Tag look) */}
      <div
        className={`h-3 w-full ${
          item.image ? 'bg-gray-100 dark:bg-gray-700' : 'bg-yellow-200/50 dark:bg-yellow-900/50'
        }`}
      />

      <div className="p-3 pt-2">
        {item.image && (
          <img src={item.image} alt="Brain dump" className="mb-2 w-full rounded-lg object-cover" />
        )}
        {item.text && (
          <p className="text-xs leading-relaxed font-medium whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {item.text}
          </p>
        )}

        {/* Actions */}
        <div className="mt-2 flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => handleMoveToOtherColumn(item, column)}
            className="text-gray-400 hover:text-pink-500 dark:text-gray-500 dark:hover:text-pink-400"
            title="Move to other column"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3.5 w-3.5"
            >
              <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(item.id, column)}
            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
            title="Delete note"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Reorder.Item>
  )

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      {/* Input Area */}
      <div className="relative shrink-0 space-y-2">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Catch a thought (or paste an image)..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-12 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            onClick={handleAdd}
            disabled={!inputValue.trim() && !pendingImage}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-pink-500 transition-colors hover:bg-pink-50 disabled:text-gray-300 dark:hover:bg-pink-900/20 dark:disabled:text-gray-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Pending Image Preview */}
        <AnimatePresence>
          {pendingImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              <img src={pendingImage} alt="Preview" className="h-20 w-auto object-cover p-1" />
              <button
                onClick={() => setPendingImage(null)}
                className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3 w-3"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Two-Column Masonry Grid */}
      <div className="scrollbar-none flex-1 overflow-y-auto rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-2 dark:border-gray-800 dark:bg-gray-900/20 [&::-webkit-scrollbar]:hidden">
        {leftItems.length === 0 && rightItems.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
            <p className="text-sm">Your mind is clear.</p>
            <p className="text-xs opacity-60">Type above to offload distractions.</p>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            {/* Left Column */}
            <Reorder.Group
              axis="y"
              values={leftItems}
              onReorder={setLeftItems}
              className="min-w-0 flex-1"
            >
              {leftItems.map((item) => renderCard(item, 'left'))}
            </Reorder.Group>

            {/* Right Column */}
            <Reorder.Group
              axis="y"
              values={rightItems}
              onReorder={setRightItems}
              className="min-w-0 flex-1"
            >
              {rightItems.map((item) => renderCard(item, 'right'))}
            </Reorder.Group>
          </div>
        )}
      </div>
    </div>
  )
}

const mockTaskBreakdown = (task: string) => {
  const normalized = task.trim().toLowerCase()
  if (!normalized) return []
  if (normalized.includes('clean') && normalized.includes('room')) {
    const verbs = ['Plan', 'Break down', 'Do the messy first step', 'Review', 'Celebrate']
    return verbs.map((verb) => `${verb} ${task.toLowerCase()}`)
  }
  return ['Start timer (5m)', 'Do first step', 'Take a breath', 'Keep going']
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

const InfoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const DopamineMenuWidget = ({ cols = 6 }: { cols?: number }) => {
  const [options, setOptions] = useState([
    'Drink Water 💧',
    'Stretch 🧘',
    '5 Jumping Jacks 🏃',
    'Check 1 Email 📧',
    'Deep Breath 🌬️',
    'Pet a Cat/Dog 🐶',
  ])
  const [newOption, setNewOption] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const handleSpin = () => {
    if (options.length === 0) return
    setIsSpinning(true)
    setSelected(null)

    // Simulate spinning effect
    let count = 0
    const maxCount = 20
    const interval = setInterval(() => {
      setSelected(options[Math.floor(Math.random() * options.length)])
      count++
      if (count > maxCount) {
        clearInterval(interval)
        setIsSpinning(false)
        // Final selection
        const final = options[Math.floor(Math.random() * options.length)]
        setSelected(final)
      }
    }, 100)
  }

  const addOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()])
      setNewOption('')
    }
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Result Area */}
      <div className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl bg-pink-50 p-6 text-center shadow-sm ring-1 ring-pink-100 dark:bg-pink-900/20 dark:ring-pink-900/30">
        {selected ? (
          <motion.div
            key={selected}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-black tracking-tight text-gray-900 dark:text-white"
          >
            {selected}
          </motion.div>
        ) : (
          <p className="text-sm font-bold tracking-wider text-pink-400/70 uppercase">
            {isSpinning ? 'Spinning...' : 'Ready to Spin'}
          </p>
        )}
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning || options.length === 0}
        className={`flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${
          isSpinning
            ? 'cursor-not-allowed bg-gray-900 dark:bg-gray-700'
            : 'bg-pink-500 shadow-pink-200 hover:bg-pink-600 dark:shadow-none'
        }`}
      >
        {isSpinning ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span>SPINNING...</span>
          </div>
        ) : (
          'GIVE ME DOPAMINE'
        )}
      </button>

      {/* Options List */}
      <div className="scrollbar-none flex-1 overflow-y-auto rounded-2xl border border-dashed border-gray-200 p-1 pr-2 dark:border-gray-700 [&::-webkit-scrollbar]:hidden">
        <div className="mb-2 flex gap-2 p-1">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addOption()}
            placeholder="Add option..."
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            onClick={addOption}
            className="rounded-lg bg-pink-50 px-3 py-2 text-xs font-bold text-pink-600 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:hover:bg-pink-900/40"
          >
            Add
          </button>
        </div>
        <div className={`grid gap-2 px-1 ${cols >= 5 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {options.map((opt, idx) => (
            <div
              key={idx}
              className="group flex items-center justify-between rounded-lg border border-transparent bg-white px-3 py-2 shadow-sm transition-all hover:border-pink-100 hover:shadow-md dark:bg-gray-800 dark:hover:border-pink-900/30"
            >
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{opt}</span>
              <button
                onClick={() => removeOption(idx)}
                className="text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500 dark:text-gray-600"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3.5 w-3.5"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
