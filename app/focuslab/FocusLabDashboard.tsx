'use client'

import { motion, AnimatePresence, Reorder, useDragControls, DragControls } from 'framer-motion'
import { ReactNode, useEffect, useRef, useState, createContext, useContext } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { ToDoWidget } from '@/components/focus-lab/ToDoWidget'
import { dictionary } from '@/data/locale/dictionary'

// Context for passing drag controls to children
const DragHandleContext = createContext<DragControls | null>(null)

// --- Helper Functions ---

const playClickSound = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // High pitch beep
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1) // Drop pitch

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.1)
}

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
                ? 'text-primary-600 dark:text-primary-400 bg-white shadow-sm dark:bg-gray-700'
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
      {Array.from({ length: 10 }).map((_, index) => (
        <motion.div
          key={index}
          className="bg-primary-500/80 w-1.5 rounded-full"
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
  const { t } = useTranslation()

  return (
    <header className="space-y-4 text-center lg:text-left">
      <p className="text-primary-500 text-xs font-semibold tracking-[0.4em] uppercase">
        {t.focusLab.header.eyebrow}
      </p>
      <div className="space-y-3">
        <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100">
          {t.focusLab.header.title}
        </h1>
        <p className="max-w-2xl text-lg whitespace-pre-line text-gray-600 dark:text-gray-300">
          {t.focusLab.header.description}
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
  onHeaderClick?: () => void
  onDelete?: () => void
  className?: string
}

const WidgetCard = ({
  title,
  subtitle,
  children,
  onHeaderClick,
  onDelete,
  badge,
  className = '',
}: WidgetCardProps & { badge?: ReactNode }) => {
  const [showInfo, setShowInfo] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)
  const deleteRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setShowInfo(false)
      }
      if (deleteRef.current && !deleteRef.current.contains(event.target as Node)) {
        setShowDeleteConfirm(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const dragControls = useContext(DragHandleContext)

  const dragStartPosition = useRef({ x: 0, y: 0 })

  return (
    <motion.section
      layout
      className={`group flex h-full flex-col rounded-[32px] border border-gray-200/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-shadow duration-300 sm:p-6 dark:border-gray-800/80 dark:bg-gray-950/85 ${className}`}
    >
      <div
        className="flex cursor-grab items-center justify-between gap-2 active:cursor-grabbing"
        onPointerDown={(e) => {
          dragStartPosition.current = { x: e.clientX, y: e.clientY }
          dragControls?.start(e)
        }}
        onClick={(e) => {
          const dist = Math.sqrt(
            Math.pow(e.clientX - dragStartPosition.current.x, 2) +
              Math.pow(e.clientY - dragStartPosition.current.y, 2)
          )
          if (dist < 5) {
            onHeaderClick?.()
          }
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onHeaderClick?.()
          }
        }}
      >
        <div className="flex items-center gap-2">
          {/* Drag Handle (only visible when not focused) */}
          {/* <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-2 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm8-14a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-2 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm2 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8-14a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-2 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm2 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            </svg>
          </div> */}
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
            {badge && <div>{badge}</div>}
          </div>
          {/* Info Button */}
          <div className="relative" ref={infoRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowInfo(!showInfo)
              }}
              className={`transition-colors ${
                showInfo
                  ? 'text-primary-500 dark:text-primary-400'
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

        {/* Delete Button - Moved to Right */}
        {onDelete && (
          <div className="relative" ref={deleteRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteConfirm(!showDeleteConfirm)
              }}
              className={`transition-colors ${
                showDeleteConfirm
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400'
              }`}
              aria-label="Remove widget"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 z-50 mt-2 w-64 origin-top-right"
                >
                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xl ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-900 dark:ring-white/10">
                    <h4 className="mb-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                      {t.focusLab.controls.delete.confirm}
                    </h4>
                    <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {t.focusLab.controls.delete.desc}
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteConfirm(false)
                        }}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      >
                        {t.focusLab.controls.delete.cancel}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteConfirm(false)
                          onDelete()
                        }}
                        className="rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white hover:bg-red-600"
                      >
                        {t.focusLab.controls.delete.confirmBtn}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

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
  // Left Column (3 units)
  { id: 'sonic', x: 0, y: 0, w: 3, h: 5, minW: 2, minH: 5 },
  { id: 'breaker', x: 0, y: 5, w: 3, h: 5, minW: 2, minH: 5 },

  // Middle Left (ToDo - 3 units)
  { id: 'todo', x: 3, y: 0, w: 3, h: 10, minW: 2, minH: 5 },

  // Middle Right (Brain Dump - 5 units)
  { id: 'brain', x: 6, y: 0, w: 5, h: 10, minW: 4, minH: 5 },

  // Right Column (3 units)
  { id: 'timer', x: 11, y: 0, w: 3, h: 5, minW: 2, minH: 5 },
  { id: 'dopamine', x: 11, y: 5, w: 3, h: 5, minW: 2, minH: 5 },
]

const FocusLabMobileGrid = () => {
  return (
    <div className="flex flex-col gap-5 pb-16">
      <SonicShieldCard className="h-auto" />
      <TimerCard className="h-auto" />
      <BrainDumpCard className="h-auto" />
      <ToDoCard className="h-auto" />
      <TaskBreakerCard className="h-auto" />
      <DopamineMenuCard className="h-auto" />
    </div>
  )
}

const FocusLabTabletGrid = () => {
  return (
    <div className="grid grid-cols-2 gap-6 pb-20">
      <SonicShieldCard className="h-full" />
      <TimerCard className="h-full" />
      <BrainDumpCard className="col-span-2 h-full" />
      <ToDoCard className="col-span-2 h-full" />
      <TaskBreakerCard className="h-full" />
      <DopamineMenuCard className="h-full" />
    </div>
  )
}

const COL_WIDTH = 54
const ROW_HEIGHT = 54
const GAP = 22

export const FocusLabDashboard = () => {
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [showTip, setShowTip] = useState(true)
  const [focusedCardIds, setFocusedCardIds] = useState<Set<string>>(new Set())
  const { t, language: lang, setLanguage } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // Calculate dynamic padding to align with grid (x=0)
  const totalGapsWidth = (14 - 1) * GAP
  const availableWidth = containerWidth - totalGapsWidth
  const colWidth = containerWidth > 0 ? availableWidth / 14 : COL_WIDTH
  const headerPadding = 0

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener('resize', updateDimensions)

    return () => {
      window.removeEventListener('resize', updateDimensions)
      resizeObserver.disconnect()
    }
  }, [])

  // Lock scroll in Focus Mode
  useEffect(() => {
    if (isFocusMode) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFocusMode])

  // Calculate Grid Offset for background alignment
  // For the wide layout, we want the grid to cover the container
  // We'll calculate this inside FocusLabGrid for the desktop view
  const gridOffset = 0

  const toggleCardFocus = (id: string) => {
    setFocusedCardIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <>
      <div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] min-h-screen w-screen">
        <motion.div
          layout
          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          className={`${
            isFocusMode
              ? 'fixed inset-0 z-[100] h-screen w-screen overflow-y-scroll bg-white/95 backdrop-blur-sm dark:bg-gray-950/95'
              : 'relative h-full w-full'
          }`}
        >
          {/* Global Grid Background - Only visible on Desktop and not in Focus Mode */}
          {!isMobile && !isFocusMode && (
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
              <div
                className="h-full w-full"
                style={{
                  position: 'absolute',
                  top: 0,
                  height: '100%',
                  backgroundImage: `
                linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
              `,
                  backgroundSize: `${containerWidth > 0 ? (containerWidth - (14 - 1) * GAP) / 14 + GAP : COL_WIDTH + GAP}px ${ROW_HEIGHT + GAP}px`,
                  backgroundPosition: 'center -16px',
                }}
              />
            </div>
          )}

          {/* Inner Wide Container */}
          <div className="mx-auto h-full max-w-[1800px] px-4 sm:px-6 lg:px-8">
            <div className="h-full w-full" ref={containerRef}>
              {/* Intro Section - Fades out cleanly in Focus Mode */}
              <AnimatePresence initial={false}>
                {!isFocusMode && (
                  <motion.div
                    key="focuslab-intro"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 48 }}
                    exit={{ opacity: 0, y: -30, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="py-12" style={{ paddingLeft: headerPadding }}>
                      <FocusLabIntro />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dashboard Controls Header */}
              <div
                className={`relative z-[100] flex flex-col gap-4 transition-all duration-500 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start ${isFocusMode ? 'mt-6 mb-12' : 'mb-8 pt-0'}`}
                style={{ paddingLeft: headerPadding }}
              >
                <AnimatePresence mode="popLayout">
                  {isFocusMode && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 border-gray-200 pr-0 sm:border-r sm:pr-4 dark:border-gray-800"
                    >
                      <div className="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-lg text-white">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="h-5 w-5"
                        >
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Focus Lab
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex w-full flex-col gap-3 sm:ml-6 sm:w-auto sm:min-w-[260px] sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <button
                      onClick={() => setIsFocusMode(!isFocusMode)}
                      className={`group flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all sm:w-auto ${
                        isFocusMode
                          ? 'border-primary-200 bg-primary-50 text-primary-600 hover:bg-primary-100 dark:border-primary-900/30 dark:bg-primary-900/20 dark:text-primary-400'
                          : 'hover:border-primary-200 hover:text-primary-600 dark:hover:text-primary-400 border-gray-200 bg-white text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400'
                      }`}
                    >
                      {isFocusMode ? (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-4 w-4"
                          >
                            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                          </svg>
                          {t.focusLab.controls.exitFocus}
                        </>
                      ) : (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-4 w-4"
                          >
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                          </svg>
                          {t.focusLab.controls.focusMode}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        if (
                          window.confirm(
                            lang === 'en'
                              ? 'Reset dashboard layout? Your data (tasks, notes, etc.) will be preserved.'
                              : '重置卡片布局？您的数据（任务、便签等）将被保留。'
                          )
                        ) {
                          const keys = ['focus-lab-layout-v1']
                          keys.forEach((key) => window.localStorage.removeItem(key))
                          window.location.reload()
                        }
                      }}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 sm:w-auto dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-red-900/30 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 transition-transform group-hover:-rotate-180"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                      {t.focusLab.controls.resetLayout}
                    </button>
                  </div>
                  {/* Focus Mode Tip */}
                  <AnimatePresence>
                    {isFocusMode && showTip && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex w-full items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 sm:w-auto sm:items-center dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        <span className="text-left leading-relaxed">{t.focusLab.controls.tip}</span>
                        <button
                          onClick={() => setShowTip(false)}
                          className="rounded-full p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                          aria-label={t.focusLab.controls.dismissTip}
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Grid Section */}
              <motion.div
                layout
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className={`transition-all duration-500 ${isFocusMode ? 'relative z-[95]' : 'mt-10'}`}
              >
                {isMobile ? (
                  <FocusLabMobileGrid />
                ) : isTablet ? (
                  <FocusLabTabletGrid />
                ) : (
                  <FocusLabGrid
                    isFocusMode={isFocusMode}
                    focusedCardIds={focusedCardIds}
                    onToggleFocus={toggleCardFocus}
                    containerWidth={containerWidth}
                  />
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export const FocusLabGrid = ({
  isFocusMode = false,
  focusedCardIds = new Set(),
  onToggleFocus = () => {},
  containerWidth,
}: {
  isFocusMode?: boolean
  focusedCardIds?: Set<string>
  onToggleFocus?: (id: string) => void
  containerWidth: number
}) => {
  const [layout, setLayout] = useState<GridItem[]>(INITIAL_LAYOUT)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  // containerRef removed as width is passed down

  // Load layout from localStorage
  useEffect(() => {
    try {
      const savedLayout = window.localStorage.getItem('focus-lab-layout-v1')
      if (savedLayout) {
        const parsed = JSON.parse(savedLayout)
        // Enforce new minimums for existing layouts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updated = parsed.map((item: any) => {
          if (item.id === 'timer' || item.id === 'dopamine') {
            return { ...item, minH: 5, h: Math.max(item.h, 5) }
          }
          return item
        })
        setLayout(updated)
      }
    } catch (error) {
      console.error('Failed to load layout:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save layout to localStorage
  useEffect(() => {
    if (!isLoaded) return
    try {
      window.localStorage.setItem('focus-lab-layout-v1', JSON.stringify(layout))
    } catch (error) {
      console.error('Failed to save layout:', error)
    }
  }, [layout, isLoaded])

  const [isDraggingOrResizing, setIsDraggingOrResizing] = useState(false)

  // Width calculation moved to parent

  // Auto-centering logic removed to ensure strict left alignment

  // Calculate dynamic column width to fit container (14 columns)
  const totalGapsWidth = (14 - 1) * GAP
  const availableWidth = containerWidth - totalGapsWidth
  const calculatedColWidth = containerWidth > 0 ? availableWidth / 14 : COL_WIDTH
  const colWidth = Math.max(20, calculatedColWidth)

  // Grid is now full width of the container
  const contentWidth = containerWidth
  const gridOffset = 0

  // Helper to snap to grid
  const snapToGrid = (value: number, unitSize: number) => {
    return Math.round(value / unitSize) * unitSize
  }

  const updateLayout = (id: string, newProps: Partial<GridItem>) => {
    setLayout((prev) => prev.map((item) => (item.id === id ? { ...item, ...newProps } : item)))
  }

  const handleRemoveWidget = (id: string) => {
    setLayout((prev) => prev.filter((item) => item.id !== id))
  }

  const visibleItems =
    isFocusMode && focusedCardIds.size > 0 ? layout.filter((i) => focusedCardIds.has(i.id)) : layout

  return (
    <div
      className={`relative w-full transition-opacity duration-500 ${containerWidth > 0 ? 'opacity-100' : 'opacity-0'}`}
      style={{
        height:
          (layout.length > 0 ? Math.max(...layout.map((i) => i.y + i.h)) : 0) * (ROW_HEIGHT + GAP) +
          (isFocusMode ? 20 : 100),
      }}
    >
      {/* Centered Grid Container */}
      <div
        className="absolute top-0 h-full transition-all duration-500 ease-out"
        style={{
          left: gridOffset,
          width: contentWidth, // Optional, but helps debug
        }}
      >
        {/* Visible Grid Background - Moved to Parent */}

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
              isFocusMode={isFocusMode}
              isFocused={focusedCardIds.has(item.id)}
              hasFocusedCards={focusedCardIds.size > 0}
            >
              {item.id === 'sonic' && (
                <SonicShieldCard
                  className="h-full w-full"
                  onToggleFocus={() => onToggleFocus(item.id)}
                  onDelete={() => handleRemoveWidget(item.id)}
                />
              )}
              {item.id === 'timer' && (
                <TimerCard
                  className="h-full w-full"
                  onToggleFocus={() => onToggleFocus(item.id)}
                  onDelete={() => handleRemoveWidget(item.id)}
                />
              )}
              {item.id === 'brain' && (
                <BrainDumpCard
                  className="h-full w-full"
                  onToggleFocus={() => onToggleFocus(item.id)}
                  onDelete={() => handleRemoveWidget(item.id)}
                />
              )}
              {item.id === 'todo' && (
                <ToDoCard
                  className="h-full w-full"
                  cols={item.w}
                  onToggleFocus={() => onToggleFocus(item.id)}
                  onDelete={() => handleRemoveWidget(item.id)}
                />
              )}
              {item.id === 'breaker' && (
                <TaskBreakerCard
                  className="h-full w-full"
                  onToggleFocus={() => onToggleFocus(item.id)}
                  onDelete={() => handleRemoveWidget(item.id)}
                />
              )}
              {item.id === 'dopamine' && (
                <DopamineMenuCard
                  className="h-full w-full"
                  cols={item.w}
                  onToggleFocus={() => onToggleFocus(item.id)}
                  onDelete={() => handleRemoveWidget(item.id)}
                />
              )}
            </DraggableResizableItem>
          ))}
      </div>
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
  isFocusMode,
  isFocused,
  hasFocusedCards,
}: {
  item: GridItem
  colWidth: number
  onUpdate: (props: Partial<GridItem>) => void
  children: ReactNode
  isActive: boolean
  onActivate: () => void
  onInteractionStart: () => void
  onInteractionEnd: () => void
  isFocusMode?: boolean
  isFocused?: boolean
  hasFocusedCards?: boolean
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
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => {
        onInteractionStart()
        setIsDragging(true)
      }}
      onDragEnd={(e, info) => {
        setIsDragging(false)
        onInteractionEnd()
        const endX = x + info.offset.x
        const endY = y + info.offset.y
        const gridX = Math.round(endX / (colWidth + GAP)) // Allow negative X for centered grid
        const gridY = Math.max(0, Math.round(endY / (ROW_HEIGHT + GAP)))
        onUpdate({ x: gridX, y: gridY })
      }}
      initial={false}
      animate={{
        x,
        y,
        width,
        height,
        zIndex: isActive ? 50 : 10,
        filter:
          isFocusMode && hasFocusedCards && !isFocused
            ? 'blur(4px) grayscale(0.5)'
            : 'blur(0px) grayscale(0)',
        opacity: isFocusMode && hasFocusedCards && !isFocused ? 0.4 : 1,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onPointerDown={onActivate}
      className="absolute rounded-[32px] shadow-sm"
    >
      <div className="relative h-full w-full">
        <DragHandleContext.Provider value={dragControls}>{children}</DragHandleContext.Provider>

        {/* Resize Handle (Diagonal Arrow) */}
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

export function SonicShieldCard({
  onToggleFocus,
  onDelete,
  className,
}: {
  onToggleFocus?: () => void
  onDelete?: () => void
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <WidgetCard
      title={t.focusLab.widgets.sonicShield.title}
      subtitle={t.focusLab.widgets.sonicShield.subtitle}
      onHeaderClick={onToggleFocus}
      onDelete={onDelete}
      className={className}
    >
      <SonicShieldWidget />
    </WidgetCard>
  )
}

export function TimerCard({
  onToggleFocus,
  onDelete,
  className,
}: {
  onToggleFocus?: () => void
  onDelete?: () => void
  className?: string
}) {
  const { t } = useTranslation()
  const [dailyFocusMinutes, setDailyFocusMinutes] = useState(0)

  useEffect(() => {
    const stored = window.localStorage.getItem('focus-lab-daily-focus')
    if (stored) {
      try {
        const { date, minutes } = JSON.parse(stored)
        const today = new Date().toDateString()
        if (date === today) {
          setDailyFocusMinutes(minutes)
        } else {
          // Reset for new day
          setDailyFocusMinutes(0)
          window.localStorage.setItem(
            'focus-lab-daily-focus',
            JSON.stringify({ date: today, minutes: 0 })
          )
        }
      } catch (e) {
        console.error('Failed to parse daily focus', e)
      }
    }
  }, [])

  const handleTimerComplete = (minutes: number) => {
    setDailyFocusMinutes((prev) => {
      const newMinutes = prev + minutes
      const today = new Date().toDateString()
      window.localStorage.setItem(
        'focus-lab-daily-focus',
        JSON.stringify({ date: today, minutes: newMinutes })
      )
      return newMinutes
    })
  }

  return (
    <WidgetCard
      title={t.focusLab.widgets.timer.title}
      subtitle={t.focusLab.widgets.timer.subtitle}
      onHeaderClick={onToggleFocus}
      onDelete={onDelete}
      className={className}
    >
      <TimerWidget dailyFocusMinutes={dailyFocusMinutes} onTimerComplete={handleTimerComplete} />
    </WidgetCard>
  )
}

export function TaskBreakerCard({
  onToggleFocus,
  onDelete,
  className,
}: {
  onToggleFocus?: () => void
  onDelete?: () => void
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <WidgetCard
      title={t.focusLab.widgets.taskBreaker.title}
      subtitle={t.focusLab.widgets.taskBreaker.subtitle}
      onHeaderClick={onToggleFocus}
      onDelete={onDelete}
      className={className}
    >
      <TaskBreakerWidget />
    </WidgetCard>
  )
}

export function BrainDumpCard({
  onToggleFocus,
  onDelete,
  className,
}: {
  onToggleFocus?: () => void
  onDelete?: () => void
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <WidgetCard
      title={t.focusLab.widgets.brainDump.title}
      subtitle={t.focusLab.widgets.brainDump.subtitle}
      onHeaderClick={onToggleFocus}
      onDelete={onDelete}
      className={className}
    >
      <BrainDumpWidget />
    </WidgetCard>
  )
}

export function ToDoCard({
  cols,
  onToggleFocus,
  onDelete,
  className,
}: {
  cols?: number
  onToggleFocus?: () => void
  onDelete?: () => void
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <WidgetCard
      title={t.focusLab.widgets.todo.title}
      subtitle={t.focusLab.widgets.todo.subtitle}
      onHeaderClick={onToggleFocus}
      onDelete={onDelete}
      className={className}
    >
      <ToDoWidget cols={cols} />
    </WidgetCard>
  )
}

export function DopamineMenuCard({
  cols,
  onToggleFocus,
  onDelete,
  className,
}: {
  cols?: number
  onToggleFocus?: () => void
  onDelete?: () => void
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <WidgetCard
      title={t.focusLab.widgets.dopamineMenu.title}
      subtitle={t.focusLab.widgets.dopamineMenu.subtitle}
      onHeaderClick={onToggleFocus}
      onDelete={onDelete}
      className={className}
    >
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
  const { t } = useTranslation()
  const tSounds = t.focusLab.sounds
  const [customSounds, setCustomSounds] = useState<SoundOption[]>([])
  const [activeTracks, setActiveTracks] = useState<Record<string, ActiveTrack>>({})
  const [masterVolume, setMasterVolume] = useState(0.8)
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedTracks = window.localStorage.getItem('focus-lab-sonic-tracks')
      const savedVolume = window.localStorage.getItem('focus-lab-sonic-volume')

      if (savedTracks) {
        setActiveTracks(JSON.parse(savedTracks))
      }
      if (savedVolume) {
        setMasterVolume(parseFloat(savedVolume))
      }
    } catch (error) {
      console.error('Failed to load sonic settings:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    if (!isLoaded) return
    try {
      window.localStorage.setItem('focus-lab-sonic-tracks', JSON.stringify(activeTracks))
      window.localStorage.setItem('focus-lab-sonic-volume', masterVolume.toString())
    } catch (error) {
      console.error('Failed to save sonic settings:', error)
    }
  }, [activeTracks, masterVolume, isLoaded])

  useEffect(() => {
    const fetchCustomSounds = async () => {
      try {
        const response = await fetch('/api/sounds')
        if (response.ok) {
          const data = await response.json()
          const BRAINWAVE_SOUNDS = new Set(['alpha', 'beta', 'delta', 'gamma', 'theta'])
          const NOISE_SOUNDS = ['white-noise', 'pink', 'brown']

          const newSounds = data.sounds
            .map((file: string) => ({
              id: `custom-${file}`,
              name: file.replace(/\.[^/.]+$/, ''),
              path: `/static/sounds/custom/${file}`,
              detail: 'Custom sound',
            }))
            .sort((a: { name: string }, b: { name: string }) => {
              // 1. Brainwaves always last
              const isABrainwave = BRAINWAVE_SOUNDS.has(a.name)
              const isBBrainwave = BRAINWAVE_SOUNDS.has(b.name)
              if (isABrainwave && !isBBrainwave) return 1
              if (!isABrainwave && isBBrainwave) return -1
              if (isABrainwave && isBBrainwave) return a.name.localeCompare(b.name)

              // 2. Noises (White, Pink, Brown) come after Nature sounds
              const aNoiseIndex = NOISE_SOUNDS.indexOf(a.name)
              const bNoiseIndex = NOISE_SOUNDS.indexOf(b.name)

              // If both are noises, sort by specific order
              if (aNoiseIndex !== -1 && bNoiseIndex !== -1) {
                return aNoiseIndex - bNoiseIndex
              }

              // If one is noise and other is nature, Noise comes last (after nature)
              if (aNoiseIndex !== -1 && bNoiseIndex === -1) return 1
              if (aNoiseIndex === -1 && bNoiseIndex !== -1) return -1

              // 3. Nature sounds sorted alphabetically
              return a.name.localeCompare(b.name)
            })

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
      <div className="relative flex min-h-[80px] shrink-0 items-center justify-between rounded-2xl bg-white px-5 py-3 text-gray-900 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800">
        {/* Visualizer Area */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <SoundVisualizer activeCount={isGlobalPlaying ? activeCount : 0} />
          <div className="text-xs font-medium opacity-60">
            {activeCount === 0
              ? t.focusLab.widgets.sonicShield.selectSounds
              : `${activeCount} ${t.focusLab.widgets.sonicShield.active}`}
          </div>
        </div>

        {/* Vertical Master Volume */}
        <div className="group flex h-full flex-col items-center justify-center gap-2 border-l border-gray-100 pl-4 dark:border-gray-800">
          <div
            className="relative h-14 w-1.5 cursor-pointer rounded-full bg-gray-100 py-1 transition-all hover:w-2 dark:bg-gray-800"
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
              className="group-hover:bg-primary-500 dark:group-hover:bg-primary-400 absolute bottom-0 w-full rounded-full bg-gray-300 transition-all dark:bg-gray-600"
              style={{ height: `${masterVolume * 100}%` }}
            />
            {/* Thumb indicator on hover */}
            <div
              className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:bg-gray-200"
              style={{ bottom: `calc(${masterVolume * 100}% - 6px)` }}
            />
          </div>
          <span className="text-[9px] font-bold tracking-widest uppercase opacity-40">
            {t.focusLab.widgets.sonicShield.volume}
          </span>
        </div>
      </div>

      {/* Sound Grid */}
      <div className="scrollbar-none flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {allSounds.map((sound) => {
            const isActive = !!activeTracks[sound.id]
            const track = activeTracks[sound.id]

            return (
              <div
                key={sound.id}
                className={`group relative flex flex-col justify-between rounded-xl border p-2.5 transition-all ${
                  isActive
                    ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                    : 'hover:border-primary-200 dark:hover:border-primary-900 border-gray-100 bg-white hover:shadow-sm dark:border-gray-800 dark:bg-gray-900/40'
                }`}
              >
                <button
                  onClick={() => toggleTrack(sound.id)}
                  className="flex flex-1 flex-col items-start text-left"
                >
                  <span
                    className={`text-xs font-bold ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {tSounds[sound.name as keyof typeof tSounds] || sound.name}
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
                      className="bg-primary-200 accent-primary-600 dark:bg-primary-900 dark:accent-primary-400 h-1 w-full cursor-pointer rounded-full"
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

const TimerWidget = ({
  onTimerComplete,
  dailyFocusMinutes = 0,
}: {
  onTimerComplete?: (minutes: number) => void
  dailyFocusMinutes?: number
}) => {
  const { t } = useTranslation()
  const [activePreset, setActivePreset] = useState<TimerPreset>('focus')
  const [timeLeft, setTimeLeft] = useState(timerPresets.focus.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [timerMode, setTimerMode] = useState<'countdown' | 'target'>('countdown')
  const [targetTime, setTargetTime] = useState('')
  const [targetDuration, setTargetDuration] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showDailyFocus, setShowDailyFocus] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio('/static/sounds/alarm.mp3')
    audioRef.current.load()
  }, [])

  // Check permission on mount
  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = () => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission().then((p) => {
        setPermission(p)
      })
    }
  }

  useEffect(() => {
    if (timerMode === 'countdown') {
      setTimeLeft(timerPresets[activePreset].duration)
      setTargetDuration(0)
      setIsRunning(false)
      setIsDone(false)
    }
  }, [activePreset, timerMode])

  useEffect(() => {
    if (timerMode === 'target' && targetTime) {
      const diff = getSecondsUntilTarget(targetTime)
      setTimeLeft(diff)
      setTargetDuration(diff)
      setIsRunning(false)
      setIsDone(false)
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
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      setIsDone(true)

      // Play Alarm
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((e) => console.error('Failed to play alarm:', e))
      }

      // Notification
      if (typeof Notification !== 'undefined') {
        const options = {
          icon: '/static/images/logo.png',
        }
        if (Notification.permission === 'granted') {
          new Notification(t.focusLab.widgets.timer.done, options)
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              new Notification(t.focusLab.widgets.timer.done, options)
            }
          })
        }
      }

      // Update Daily Focus
      const durationSeconds =
        timerMode === 'countdown' ? timerPresets[activePreset].duration : targetDuration
      const minutes = Math.floor(durationSeconds / 60)
      if (minutes > 0) {
        onTimerComplete?.(minutes)
      }
    } else if (timeLeft === 0) {
      setIsRunning(false)
    }
  }, [timeLeft, isRunning, timerMode, activePreset, targetDuration, onTimerComplete, t])

  const handleStartPause = () => {
    if (isDone) {
      // Reset if done
      setIsDone(false)
      if (timerMode === 'countdown') {
        setTimeLeft(timerPresets[activePreset].duration)
      } else if (timerMode === 'target' && targetTime) {
        const next = getSecondsUntilTarget(targetTime)
        setTargetDuration(next)
        setTimeLeft(next)
      }
      setIsRunning(true)
      return
    }

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
    setIsDone(false)
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
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)
  const todayFocusText = t.focusLab.widgets.timer.todayFocus.replace(
    '{minutes}',
    dailyFocusMinutes.toString()
  )
  const circleDisplay = showDailyFocus
    ? todayFocusText
    : isDone
      ? t.focusLab.widgets.timer.done
      : display
  const circleTextClass = showDailyFocus
    ? 'px-3 text-center text-sm font-semibold leading-tight text-gray-700 dark:text-gray-100'
    : isDone
      ? 'text-center text-xl font-bold text-green-500'
      : 'font-mono text-3xl font-bold tracking-tighter text-gray-800 dark:text-white'

  return (
    <div className="relative flex h-full flex-col items-center justify-between py-0.5">
      {/* Top Controls */}
      <div className="flex w-full flex-col items-center gap-1">
        <div className="flex w-full max-w-[240px] rounded-lg bg-gray-100 p-1">
          {(['countdown', 'target'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTimerMode(mode)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                timerMode === mode
                  ? 'text-primary-600 bg-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {mode === 'countdown'
                ? t.focusLab.widgets.timer.countdown
                : t.focusLab.widgets.timer.targetTime}
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
                  className={`rounded-full px-4 py-1 text-sm font-bold transition-all ${
                    activePreset === preset
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
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
                className="focus:border-primary-300 focus:ring-primary-100 h-8 rounded-md border border-gray-200 bg-transparent px-2 text-xs font-semibold text-gray-800 focus:ring-2 focus:outline-none dark:border-gray-700 dark:text-gray-200"
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
                className="bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 rounded-md px-3 py-1 text-[10px] font-bold tracking-wider uppercase"
              >
                {t.focusLab.widgets.timer.set}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Ring */}
      <div className="relative flex flex-1 items-center justify-center">
        <div className="relative h-38 w-38">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-100 dark:text-gray-800"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className={`${isDone ? 'text-green-500' : 'text-primary-500'} transition-all duration-500 ease-in-out`}
            />
          </svg>
          <button
            type="button"
            onClick={() => setShowDailyFocus((prev) => !prev)}
            className="focus-visible:ring-primary-400 absolute inset-0 flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2"
            aria-label={
              showDailyFocus
                ? t.focusLab.widgets.timer.accessibility.showTimer
                : t.focusLab.widgets.timer.accessibility.showDailyFocus
            }
          >
            <span className={circleTextClass}>{circleDisplay}</span>
          </button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex w-full items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => {
            playClickSound()
            handleReset()
          }}
          className="flex h-10 w-20 items-center justify-center rounded-full text-xs font-bold tracking-wider text-gray-400 uppercase transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          aria-label="Reset Timer"
        >
          {t.focusLab.widgets.timer.reset}
        </button>
        <button
          type="button"
          onClick={() => {
            playClickSound()
            handleStartPause()
          }}
          className={`flex h-10 items-center justify-center gap-2 rounded-full px-6 text-xs font-bold whitespace-nowrap text-white shadow-lg transition-all active:scale-95 ${
            isRunning
              ? 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200'
              : isDone
                ? 'bg-green-500 shadow-green-200 hover:bg-green-600 dark:shadow-none'
                : 'bg-primary-500 shadow-primary-200 hover:bg-primary-600 dark:shadow-none'
          }`}
        >
          {isRunning ? (
            <>
              <PauseIcon className="h-4 w-4" /> {t.focusLab.widgets.timer.pause}
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4" /> {t.focusLab.widgets.timer.start}
            </>
          )}
        </button>
        <div className="w-20" /> {/* Spacer for balance (matches Reset button width) */}
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
  const { t } = useTranslation()
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
      setError(t.focusLab.widgets.taskBreaker.failed)
      // Fallback to mock data if API fails (optional, but good for demo)
      const fallbackSteps = t.focusLab.widgets.taskBreaker.mockSteps
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
        <div className="bg-primary-50 dark:bg-primary-900/20 flex items-start justify-between gap-4 rounded-2xl p-3">
          <div>
            <p className="text-primary-600/70 dark:text-primary-400/70 text-[10px] font-bold tracking-wider uppercase">
              {t.focusLab.widgets.taskBreaker.currentMission}
            </p>
            <p className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-gray-100">
              {task}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="hover:text-primary-600 dark:hover:text-primary-400 shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300"
          >
            {t.focusLab.widgets.taskBreaker.newTask}
          </button>
        </div>

        <div className="scrollbar-none flex-1 overflow-y-auto rounded-2xl border border-dashed border-gray-200 p-1 pr-2 dark:border-gray-700 [&::-webkit-scrollbar]:hidden">
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
              <div className="border-primary-200 border-t-primary-500 h-8 w-8 animate-spin rounded-full border-4" />
              <p className="text-xs font-medium">{t.focusLab.widgets.taskBreaker.summoning}</p>
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
        <div className="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 mx-auto flex h-10 w-10 items-center justify-center rounded-2xl">
          <MagicIcon className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
          {t.focusLab.widgets.taskBreaker.overwhelmed}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t.focusLab.widgets.taskBreaker.description}
        </p>
      </div>

      <textarea
        value={task}
        onChange={(event) => setTask(event.target.value)}
        placeholder={t.focusLab.widgets.taskBreaker.placeholder}
        className="focus:border-primary-500 focus:ring-primary-500 min-h-[80px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />

      <button
        type="button"
        onClick={handleBreakDown}
        disabled={!task.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 font-bold text-white transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 dark:bg-gray-100 dark:text-gray-900"
      >
        {t.focusLab.widgets.taskBreaker.button}
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
        className="text-primary-500 focus:ring-primary-500 pointer-events-none h-5 w-5 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800"
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
  const { t, language: lang } = useTranslation()
  const [leftItems, setLeftItems] = useState<BrainDumpItem[]>([])
  const [rightItems, setRightItems] = useState<BrainDumpItem[]>([])
  const [inputValue, setInputValue] = useState('')
  const [pendingImage, setPendingImage] = useState<string | null>(null)

  const [isLoaded, setIsLoaded] = useState(false)

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
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Persist data
  useEffect(() => {
    if (!isLoaded) return
    try {
      window.localStorage.setItem('focus-lab-brain-dump-left', JSON.stringify(leftItems))
      window.localStorage.setItem('focus-lab-brain-dump-right', JSON.stringify(rightItems))
    } catch (error) {
      // ignore persistence errors
    }
  }, [leftItems, rightItems, isLoaded])

  const handleClearAll = () => {
    if (
      window.confirm(
        lang === 'en' ? 'Clear all notes? This cannot be undone.' : '清空所有便签？此操作无法撤销。'
      )
    ) {
      setLeftItems([])
      setRightItems([])
    }
  }

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

      <div className="p-2.5 pt-2">
        {item.image && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt="Brain dump"
              className="mb-2 w-full rounded-lg object-cover"
            />
          </>
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
            className="hover:text-primary-500 dark:hover:text-primary-400 text-gray-400 dark:text-gray-500"
            title={t.focusLab.widgets.brainDump.accessibility.moveToOtherColumn}
            aria-label={t.focusLab.widgets.brainDump.accessibility.moveToOtherColumn}
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
            title={t.focusLab.widgets.brainDump.accessibility.deleteNote}
            aria-label={t.focusLab.widgets.brainDump.accessibility.deleteNote}
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
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={t.focusLab.widgets.brainDump.placeholder}
              className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-xl border border-gray-200 bg-white py-2 pr-12 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!inputValue.trim() && !pendingImage}
              className="text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 transition-colors disabled:text-gray-300 dark:disabled:text-gray-600"
              aria-label={t.focusLab.widgets.brainDump.accessibility.addThought}
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
          <button
            type="button"
            onClick={handleClearAll}
            disabled={leftItems.length === 0 && rightItems.length === 0}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 disabled:hover:bg-gray-100 disabled:hover:text-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            title={t.focusLab.widgets.brainDump.accessibility.clearBoard}
            aria-label={t.focusLab.widgets.brainDump.accessibility.clearBoard}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingImage} alt="Preview" className="h-20 w-auto object-cover p-1" />
              <button
                type="button"
                onClick={() => setPendingImage(null)}
                className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                aria-label={t.focusLab.widgets.brainDump.accessibility.removeImage}
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
      <div className="scrollbar-none flex-1 overflow-y-auto rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-1.5 dark:border-gray-800 dark:bg-gray-900/20 [&::-webkit-scrollbar]:hidden">
        {leftItems.length === 0 && rightItems.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
            <p className="text-sm">{t.focusLab.widgets.brainDump.emptyTitle}</p>
            <p className="text-xs opacity-60">{t.focusLab.widgets.brainDump.emptySubtitle}</p>
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
  const { t } = useTranslation()
  const [options, setOptions] = useState(t.focusLab.widgets.dopamineMenu.defaultOptions)
  const [newOption, setNewOption] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load options from localStorage
  useEffect(() => {
    try {
      const savedOptions = window.localStorage.getItem('focus-lab-dopamine-options')
      if (savedOptions) {
        setOptions(JSON.parse(savedOptions))
      }
    } catch (error) {
      console.error('Failed to load dopamine options:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save options to localStorage
  useEffect(() => {
    if (!isLoaded) return
    try {
      window.localStorage.setItem('focus-lab-dopamine-options', JSON.stringify(options))
    } catch (error) {
      console.error('Failed to save dopamine options:', error)
    }
  }, [options, isLoaded])

  // Handle language switch for default options
  const { language: lang } = useTranslation()
  useEffect(() => {
    if (!isLoaded) return

    const enDefaults = dictionary.en.focusLab.widgets.dopamineMenu.defaultOptions
    const zhDefaults = dictionary.cn.focusLab.widgets.dopamineMenu.defaultOptions

    const isEnDefaults =
      options.length === enDefaults.length && options.every((o, i) => o === enDefaults[i])
    const isZhDefaults =
      options.length === zhDefaults.length && options.every((o, i) => o === zhDefaults[i])

    if (lang === 'cn' && isEnDefaults) {
      setOptions(zhDefaults)
    } else if (lang === 'en' && isZhDefaults) {
      setOptions(enDefaults)
    }
  }, [lang, isLoaded, options])

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
      <div className="flex gap-2">
        {/* Result Area */}
        <div className="bg-primary-50 ring-primary-100 dark:bg-primary-900/20 dark:ring-primary-900/30 flex min-h-[80px] flex-1 flex-col items-center justify-center rounded-2xl p-2 text-center shadow-sm ring-1">
          {selected ? (
            <motion.div
              key={selected}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xl font-black tracking-tight text-gray-900 dark:text-white"
            >
              {selected}
            </motion.div>
          ) : (
            <p className="text-primary-400/70 text-xs font-bold tracking-wider uppercase">
              {isSpinning
                ? t.focusLab.widgets.dopamineMenu.spinning
                : t.focusLab.widgets.dopamineMenu.ready}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            playClickSound()
            handleSpin()
          }}
          disabled={isSpinning || options.length === 0}
          className="group/btn from-primary-400 to-primary-600 shadow-primary-500/30 hover:shadow-primary-500/50 dark:from-primary-500 dark:to-primary-700 relative flex w-20 shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl bg-gradient-to-br p-2 text-xs font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover/btn:opacity-100" />
          {isSpinning ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10 h-5 w-5 drop-shadow-sm"
              >
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
              </svg>
              <span className="relative z-10 drop-shadow-sm">
                {t.focusLab.widgets.dopamineMenu.button}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Options List */}
      <div className="scrollbar-none flex-1 overflow-y-auto rounded-2xl border border-dashed border-gray-200 p-1 pr-2 dark:border-gray-700 [&::-webkit-scrollbar]:hidden">
        <div className="mb-2 flex gap-2 p-1">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addOption()}
            placeholder={t.focusLab.widgets.dopamineMenu.addPlaceholder}
            className="focus:border-primary-500 focus:ring-primary-500 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            onClick={addOption}
            className="bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/40 rounded-lg px-3 py-2 text-xs font-bold"
          >
            {t.focusLab.widgets.dopamineMenu.add}
          </button>
        </div>
        <div className={`grid gap-2 px-1 ${cols >= 3 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {options.map((opt, idx) => (
            <div
              key={idx}
              className="group hover:border-primary-100 dark:hover:border-primary-900/30 flex items-center justify-between rounded-lg border border-transparent bg-white px-2 py-1.5 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
            >
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{opt}</span>
              <button
                onClick={() => removeOption(idx)}
                className="text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500 dark:text-gray-600"
                aria-label={t.focusLab.widgets.dopamineMenu.accessibility.removeOption}
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
