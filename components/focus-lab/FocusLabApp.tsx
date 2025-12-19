'use client'

import Image from 'next/image'
import { motion, AnimatePresence, Reorder, useDragControls, DragControls } from 'framer-motion'
import {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  createContext,
  useContext,
} from 'react'
import confetti from 'canvas-confetti'
import { useTranslation } from '@/context/LanguageContext'
import { FocusStation } from '@/components/focus-lab/FocusStation'
import DataMigrationModal from '@/components/focus-lab/DataMigrationModal'
import {
  syncLocalToCloud,
  createFocusItem,
  readStationStorage,
  saveStationItems,
  fetchCloudItems,
  STATION_STORAGE_KEY,
  STATION_SYNC_EVENT,
  FocusItem,
} from '@/components/focus-lab/focusStationStorage'
import { AnalyticsModal } from '@/components/focus-lab/AnalyticsModal'
import {
  saveSession,
  syncFocusHistory,
  getHistory,
  getTodayFocusMinutes,
} from '@/components/focus-lab/focusStorage'
import { useAuth } from '@/context/AuthContext'

import AuthModal from '@/components/auth/AuthModal'
import PlanComparisonModal from '@/components/auth/PlanComparisonModal'
import { syncToDo, readToDoStorage, TODO_STORAGE_KEY } from '@/components/focus-lab/todoStorage'
import {
  BrainDumpItem,
  createBrainDumpItem,
  fetchCloudBrainDump,
  readBrainDumpStorage,
  saveBrainDump,
  syncBrainDump,
} from '@/components/focus-lab/brainDumpStorage'
import {
  fetchCloudDopamine,
  readDopamineStorage,
  saveDopamine,
  syncDopamine,
} from '@/components/focus-lab/dopamineStorage'
import { useFocusSettingsContext } from '@/components/focus-lab/FocusSettingsContext'
import { useThemeColor, ThemeColor } from '@/context/ThemeColorContext'
import { debounce, merge, cloneDeep, uniq } from 'lodash'
import isEqual from 'lodash/isEqual'

// --- Icons ---
const SmileCircleIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--smile-circle-outline] ${className}`} />
)

const MagicIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--magic-stick-3-outline] ${className}`} />
)

const HandIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--hand-shake-linear] ${className}`} />
)

const HandPalmIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--hand-shake-linear] ${className}`} />
)

const PlayIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--play-bold] ${className}`} />
)

const PauseIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--pause-bold] ${className}`} />
)

const InfoIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--info-circle-outline] ${className}`} />
)

const ArrowLaunchIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--arrow-right-up-outline] ${className}`} />
)

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--arrow-left-outline] ${className}`} />
)

const MinusIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--minus-circle-outline] ${className}`} />
)

const TrashIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--trash-bin-minimalistic-outline] ${className}`} />
)

const PlusIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--add-circle-outline] ${className}`} />
)

const MoreHorizontalIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--menu-dots-bold] ${className}`} />
)

const CloseIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--close-circle-outline] ${className}`} />
)

const XIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--close-circle-outline] ${className}`} />
)

const StatsIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--chart-2-outline] ${className}`} />
)

const ProfileIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--user-circle-outline] ${className}`} />
)

const SettingsIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--settings-outline] ${className}`} />
)

const StarIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--star-bold] ${className}`} />
)

const EditIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--pen-2-outline] ${className}`} />
)

const CheckIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--check-circle-outline] ${className}`} />
)

const TransferIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--transfer-horizontal-outline] ${className}`} />
)

const LogoutIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--logout-2-outline] ${className}`} />
)

// --- Shared Components ---
const DragHandleContext = createContext<DragControls | null>(null)

// --- Helper Functions ---

// --- Helper Functions ---

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
    <div className="bg-primary-50 dark:bg-primary-950/30 flex h-8 w-full min-w-max rounded-lg p-1">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative flex-1 rounded-md px-3 text-xs font-bold tracking-wider whitespace-nowrap uppercase transition-all ${
              isActive
                ? 'text-primary-600 dark:text-primary-400 dark:bg-primary-800/40 bg-white shadow-sm'
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

// --- Widget Card Component ---

type WidgetCardProps = {
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  onHeaderClick?: () => void
  onDelete?: () => void
  badge?: ReactNode
  customAction?: ReactNode
  customActionPosition?: 'top' | 'right'
  className?: string
  showHeader?: boolean
}

const WidgetCard = ({
  title,
  subtitle,
  children,
  onHeaderClick,
  onDelete,
  badge,
  customAction,
  customActionPosition = 'top',
  className = '',
  showHeader = true,
}: WidgetCardProps) => {
  const [showInfo, setShowInfo] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)
  const deleteRef = useRef<HTMLDivElement>(null)
  const { settings } = useFocusSettingsContext()
  const { t } = useTranslation()
  const hideHeadersSetting = settings.focus_lab?.hide_headers
  const headerHidden = hideHeadersSetting || !showHeader

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
      className={`group relative flex h-full flex-col rounded-[32px] border border-gray-200 bg-white px-5 py-4 shadow-lg shadow-gray-200/50 backdrop-blur-none transition-shadow duration-300 sm:px-6 sm:py-5 dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      {/* Invisible Drag Handle Overlay (Zen Mode) */}
      {headerHidden && (
        <div
          className="absolute top-0 right-0 left-0 z-20 h-4 cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => {
            dragStartPosition.current = { x: e.clientX, y: e.clientY }
            dragControls?.start(e)
          }}
        />
      )}

      <div
        className={`flex ${headerHidden ? 'h-0 min-h-0' : 'h-8'} cursor-grab items-center justify-between gap-2 active:cursor-grabbing`}
        onPointerDown={(e) => {
          if (headerHidden) return // Handled by overlay
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
        {!headerHidden && (
          <div className="flex items-center gap-2">
            {/* Drag Handle (only visible when not focused) */}
            <div className="flex items-center gap-2">
              {title && (
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{title}</h2>
              )}
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
                className={`flex aspect-square h-8 w-8 items-center justify-center rounded-xl opacity-0 transition-all group-hover:opacity-100 ${
                  showInfo
                    ? 'text-primary-500 dark:text-primary-400 opacity-100'
                    : 'text-gray-300 hover:bg-gray-50 hover:text-gray-500 dark:text-gray-500 dark:hover:bg-gray-800/50 dark:hover:text-gray-300'
                }`}
                aria-label="Toggle description"
              >
                <InfoIcon className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ opacity: 0, x: 8, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-1/2 left-full z-50 ml-2 w-56 origin-left -translate-y-1/2 transform"
                  >
                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-xl ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-900 dark:ring-white/10">
                      <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                        {subtitle}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Actions (Custom Action replaces Delete or floats if on top) */}
        <div
          className={`flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 ${
            customActionPosition === 'top'
              ? headerHidden
                ? 'absolute top-3 right-4 z-10'
                : ''
              : ''
          }`}
        >
          {customAction && customActionPosition === 'top' && customAction}
          {!customAction && onDelete && (
            <div className="relative" ref={deleteRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteConfirm(!showDeleteConfirm)
                }}
                className={`flex aspect-square h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all ${
                  showDeleteConfirm
                    ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'
                    : 'text-gray-300 hover:bg-gray-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-gray-800/50 dark:hover:text-red-400'
                }`}
                aria-label="Remove widget"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              {/* Delete Confirm */}
              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-full right-0 z-10 mt-2 w-32 rounded-lg border border-gray-100 bg-white p-1 text-xs shadow-xl dark:border-gray-700 dark:bg-gray-800"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
                      }}
                      className="w-full rounded-md bg-red-50 px-3 py-2 text-left font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      {t.focusLab.delete.confirmBtn}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Focus Toggle Removed for now */}
      </div>
      <div className="mt-2 flex min-h-0 flex-1 flex-col">{children}</div>

      {/* Floating Side Action (e.g. Right Center for Flipping) */}
      {customAction && customActionPosition === 'right' && (
        <div className="absolute top-1/2 -right-2 z-50 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:right-0 group-hover:opacity-100">
          <div className="flex translate-x-1/2 items-center">{customAction}</div>
        </div>
      )}
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
  { id: 'sonic', x: 0, y: 0, w: 3, h: 5, minW: 2, minH: 2 },
  { id: 'breaker', x: 0, y: 5, w: 3, h: 5, minW: 2, minH: 2 },

  // Middle Left (ToDo - 3 units)
  { id: 'todo', x: 3, y: 0, w: 3, h: 10, minW: 2, minH: 2 },

  // Middle Right (Brain Dump - 5 units)
  { id: 'brain', x: 6, y: 0, w: 5, h: 10, minW: 2, minH: 2 },

  // Right Column (3 units)
  { id: 'timer', x: 11, y: 0, w: 3, h: 5, minW: 2, minH: 2 },
  { id: 'dopamine', x: 11, y: 5, w: 3, h: 5, minW: 2, minH: 2 },
]

const TRIPLE_LAYOUT: GridItem[] = [
  { id: 'sonic', x: 0, y: 0, w: 4, h: 5, minW: 2, minH: 2 },
  { id: 'timer', x: 4, y: 0, w: 4, h: 5, minW: 2, minH: 2 },
  { id: 'dopamine', x: 8, y: 0, w: 4, h: 5, minW: 2, minH: 2 },
  { id: 'todo', x: 0, y: 5, w: 6, h: 10, minW: 2, minH: 2 },
  { id: 'brain', x: 6, y: 5, w: 6, h: 10, minW: 2, minH: 2 },
  { id: 'breaker', x: 0, y: 15, w: 6, h: 5, minW: 2, minH: 2 },
]

const DOUBLE_LAYOUT: GridItem[] = [
  { id: 'sonic', x: 0, y: 0, w: 4, h: 5, minW: 2, minH: 2 },
  { id: 'timer', x: 4, y: 0, w: 4, h: 5, minW: 2, minH: 2 },
  { id: 'todo', x: 0, y: 5, w: 4, h: 10, minW: 2, minH: 2 },
  { id: 'dopamine', x: 4, y: 5, w: 4, h: 5, minW: 2, minH: 2 },
  { id: 'breaker', x: 4, y: 10, w: 4, h: 5, minW: 2, minH: 2 },
  { id: 'brain', x: 0, y: 15, w: 8, h: 10, minW: 2, minH: 2 },
]

type LayoutPreset = 'desktop' | 'triple' | 'double'

const GRID_PRESETS: Record<LayoutPreset, { columns: number; layout: GridItem[] }> = {
  desktop: { columns: 14, layout: INITIAL_LAYOUT },
  triple: { columns: 12, layout: TRIPLE_LAYOUT },
  double: { columns: 8, layout: DOUBLE_LAYOUT },
}

const cloneLayout = (items: GridItem[]) => items.map((item) => ({ ...item }))

const getPresetForWidth = (width: number): LayoutPreset => {
  if (width >= 1200) return 'desktop'
  if (width >= 900) return 'triple'
  return 'double'
}

const getLayoutStorageKey = (preset: LayoutPreset) => `focus-lab-layout-${preset}-v1`

type FocusedTaskState = { text: string; timestamp: number; id: string } | null

const FocusLabMobileGrid = ({
  focusedTask,
  onStartFocus,
  externalCommand,
  onCommandHandled,
  onSessionLogged,
  onTimerComplete,
}: {
  focusedTask?: FocusedTaskState
  onStartFocus?: (task: string, id: string) => void
  externalCommand?: string | null
  onCommandHandled?: () => void
  onSessionLogged?: (minutes: number) => void
  onTimerComplete?: (minutes: number) => void
}) => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-5 pb-16">
      <SonicShieldCard className="h-auto" />
      <TimerCard
        className="h-auto"
        focusedTask={focusedTask}
        externalCommand={externalCommand}
        onCommandHandled={onCommandHandled}
        onSessionLogged={onSessionLogged}
        onTimerComplete={onTimerComplete}
      />
      <BrainDumpCard className="h-auto" />
      <ToDoCard className="h-auto" onStartFocus={onStartFocus} focusedTaskId={focusedTask?.id} />
      <TaskBreakerCard className="h-auto" />
      <DopamineMenuCard className="h-auto" />
    </div>
  )
}

const COL_WIDTH = 54
const ROW_HEIGHT = 54
const GAP = 22
const CONTROL_BUTTON_BASE =
  'relative flex h-12 px-5 min-w-[150px] items-center justify-center rounded-full border text-sm font-semibold transition-all text-center'

export const FocusLabApp = ({ onExit }: { onExit?: () => void }) => {
  // const [isFocusMode, setIsFocusMode] = useState(false) // Removed: Always in focus mode
  const isFocusMode = true // Hardcoded to true for layout logic preservation if needed, or just refactor.
  // Actually simpler to just keep the variable as true constant to minimize diff noise for now, or just replace usages.
  // I will just replace usage or keep it constant.
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isTipOpen, setIsTipOpen] = useState(true)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showCustomizeMenu, setShowCustomizeMenu] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const customizeButtonRef = useRef<HTMLButtonElement | null>(null)
  const customizeMenuRef = useRef<HTMLDivElement | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [focusedCardIds, setFocusedCardIds] = useState<Set<string>>(new Set())
  const [focusedTask, setFocusedTask] = useState<FocusedTaskState>(null)
  const [externalCommand, setExternalCommand] = useState<string | null>(null)
  const { t, language: lang } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [activePreset, setActivePreset] = useState<LayoutPreset>('desktop')

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authTrigger, setAuthTrigger] = useState<'generic' | 'stats'>('generic')
  const { user } = useAuth()
  const isPro = user?.user_metadata?.plan === 'pro'
  const { themeColor, setThemeColor } = useThemeColor()
  const { settings, updateSettings } = useFocusSettingsContext()

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)

  const [dailyGoalHours, setDailyGoalHours] = useState(4.5)
  const [dailyTaskGoal, setDailyTaskGoal] = useState(5)
  const [tempGoalHours, setTempGoalHours] = useState('4.5')
  const [tempTaskGoal, setTempTaskGoal] = useState('5')
  const [showGoalModal, setShowGoalModal] = useState(false)
  const hasHydratedGoals = useRef(false)
  const prevGoalRef = useRef<{ hours?: number; tasks?: number }>({})
  const [tasksCompletedToday, setTasksCompletedToday] = useState(0)

  // Real progress tracking
  const [todayMinutes, setTodayMinutes] = useState(0)
  const refreshTodayProgress = useCallback(() => {
    const minutes = getTodayFocusMinutes(user?.id)
    setTodayMinutes(minutes)
  }, [user?.id])
  const handleSessionLogged = useCallback(
    (mins: number) => {
      setTodayMinutes((prev) => prev + mins)
      refreshTodayProgress()
    },
    [refreshTodayProgress]
  )

  // Fetch today's progress on mount and interval
  useEffect(() => {
    refreshTodayProgress()
    // Poll every minute to update chart
    const interval = setInterval(refreshTodayProgress, 60000)
    return () => clearInterval(interval)
  }, [refreshTodayProgress])

  // Hydrate goals from settings
  useEffect(() => {
    const storedHours = settings.focus_lab?.stats?.goal_hours
    const storedTasks = settings.focus_lab?.stats?.goal_tasks

    if (typeof storedHours === 'number' && storedHours !== prevGoalRef.current.hours) {
      setDailyGoalHours(storedHours)
    }
    if (typeof storedTasks === 'number' && storedTasks !== prevGoalRef.current.tasks) {
      setDailyTaskGoal(storedTasks)
    }
    if (storedHours !== undefined || storedTasks !== undefined) {
      hasHydratedGoals.current = true
      prevGoalRef.current = { hours: storedHours, tasks: storedTasks }
    }
  }, [settings.focus_lab?.stats?.goal_hours, settings.focus_lab?.stats?.goal_tasks])

  // Persist goals when changed
  useEffect(() => {
    const shouldUpdateHours = prevGoalRef.current.hours !== dailyGoalHours
    const shouldUpdateTasks = prevGoalRef.current.tasks !== dailyTaskGoal
    if (shouldUpdateHours) {
      updateSettings('focus_lab.stats.goal_hours', dailyGoalHours)
      prevGoalRef.current.hours = dailyGoalHours
    }
    if (shouldUpdateTasks) {
      updateSettings('focus_lab.stats.goal_tasks', dailyTaskGoal)
      prevGoalRef.current.tasks = dailyTaskGoal
    }
  }, [dailyGoalHours, dailyTaskGoal, updateSettings])

  // Track completed tasks from Focus Station (today)
  useEffect(() => {
    const dayStart = (() => {
      const now = new Date()
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    })()

    const computeToday = (items: FocusItem[]) => {
      const done = items.filter((item) => {
        if (!item.completed) return false
        // FocusItem 没有时间戳，先按今日列表全部算；若后续扩展 updated_at 可替换
        if (item.created_at) return new Date(item.created_at).getTime() >= dayStart
        return true
      })
      setTasksCompletedToday(done.length)
    }

    const syncFromLocal = () => {
      const items = readStationStorage(user?.id)
      computeToday(items)
    }

    const syncFromCloud = async () => {
      if (!user) return
      const cloudItems = await fetchCloudItems(user)
      if (cloudItems) computeToday(cloudItems)
    }

    syncFromLocal()
    syncFromCloud()

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<FocusItem[]>).detail
      if (Array.isArray(detail)) {
        computeToday(detail)
      } else {
        syncFromLocal()
      }
    }
    window.addEventListener(STATION_SYNC_EVENT, handler as EventListener)
    return () => window.removeEventListener(STATION_SYNC_EVENT, handler as EventListener)
  }, [user?.id, user])

  const currentProgressHours = todayMinutes / 60
  const progressPercentage =
    dailyGoalHours > 0 ? Math.min((todayMinutes / (dailyGoalHours * 60)) * 100, 100) : 0
  const taskProgressPercentage =
    dailyTaskGoal > 0 ? Math.min((tasksCompletedToday / dailyTaskGoal) * 100, 100) : 0
  const isGoalReached = dailyGoalHours > 0 && currentProgressHours >= dailyGoalHours
  const isTaskGoalReached = dailyTaskGoal > 0 && tasksCompletedToday >= dailyTaskGoal
  const rewardUnlocked = isGoalReached || isTaskGoalReached

  // --- Fireworks Effect ---

  const formatDurationLabel = (minutes: number) => {
    if (minutes >= 60) return `${Math.round((minutes / 60) * 10) / 10}h`
    return `${Math.round(minutes)}m`
  }

  // Notification Logic
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  // Prefill modal inputs when opened
  useEffect(() => {
    if (showGoalModal) {
      // 拉取最新任务完成数
      if (user) {
        fetchCloudItems(user).then((items) => {
          if (!items) return
          const done = items.filter((i) => i.completed)
          setTasksCompletedToday(done.length)
        })
      }
      setTempGoalHours(dailyGoalHours.toString())
      setTempTaskGoal(dailyTaskGoal.toString())
    }
  }, [showGoalModal, dailyGoalHours, dailyTaskGoal, user])

  const handleGoalModalSave = () => {
    const hoursVal = Math.max(0.5, parseFloat(tempGoalHours) || dailyGoalHours)
    const tasksVal = Math.max(0, Math.round(parseFloat(tempTaskGoal) || dailyTaskGoal))
    setDailyGoalHours(hoursVal)
    setDailyTaskGoal(tasksVal)
    setShowGoalModal(false)
  }

  const handleToggleNotifications = () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification')
      return
    }

    if (notificationsEnabled) {
      // User wants to disable
      // We cannot revoke permission, but we can set our app state to false
      // to stop sending notifications in logic (if implemented).
      setNotificationsEnabled(false)
      // Optional: Visual confirmation? No need, toggle switch moves.
    } else {
      // User wants to enable
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true)
        new Notification('Focus Lab', { body: 'Notifications enabled!' })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            setNotificationsEnabled(true)
            new Notification('Focus Lab', { body: 'Notifications enabled!' })
          } else {
            setNotificationsEnabled(false)
          }
        })
      } else {
        // Denied
        alert('Notifications are blocked. Please enable them in your browser settings.')
      }
    }
  }

  const headerPadding = 0

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const measuredWidth = containerRef.current.clientWidth
        setContainerWidth(measuredWidth)
      }
      const width = window.innerWidth
      setIsMobile(width < 540)
      setActivePreset(getPresetForWidth(width))
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

  /* Sync / Migration Logic */
  const [showMigrationModal, setShowMigrationModal] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)

  useEffect(() => {
    if (user) {
      if (typeof window !== 'undefined' && sessionStorage.getItem('focus-lab-migration-asked'))
        return

      const station = readStationStorage()
      const todo = readToDoStorage()
      const brain = readBrainDumpStorage()
      const dopamine = readDopamineStorage(lang)
      // History is less critical to "Move", but good to check.
      // Actually history sync is safe to just run in verify.

      const hasLocal =
        station.length > 0 ||
        todo.length > 0 ||
        brain.left.length > 0 ||
        brain.right.length > 0 ||
        (dopamine && dopamine.length > 0)

      if (hasLocal) {
        setShowMigrationModal(true)
        sessionStorage.setItem('focus-lab-migration-asked', 'true')
      }
    }
  }, [user, lang])

  const handleMigrate = async () => {
    if (!user) return
    setIsMigrating(true)
    try {
      // 1. Focus Station / ToDo (Same storage)
      // Fetch cloud, merge local, save, clear local
      const cloudStation = await fetchCloudItems(user)
      const localStation = readStationStorage() // Guest
      const localLegacyTodo = readToDoStorage() // Legacy Guest key

      let merged = [...(cloudStation || [])]
      let hasChanges = false

      if (localStation.length > 0) {
        merged = [...merged, ...localStation]
        hasChanges = true
        window.localStorage.removeItem(STATION_STORAGE_KEY)
      }

      if (localLegacyTodo.length > 0) {
        // Convert legacy items
        const convertedLegacy = localLegacyTodo.map((t) => createFocusItem('text', t.text))
        // Preserve completed status if possible (createFocusItem defaults to false)
        // We might need to map manualy
        const mappedLegacy = localLegacyTodo.map((t) => ({
          id: t.id, // Keep ID if valid UUID? createFocusItem generates new one. Let's keep it if possible or gen new.
          // createFocusItem generates valid one.
          type: 'text' as const,
          content: t.text,
          completed: t.completed,
          position: Date.now(),
        }))

        merged = [...merged, ...mappedLegacy]
        hasChanges = true
        window.localStorage.removeItem(TODO_STORAGE_KEY)
      }

      if (hasChanges) {
        await saveStationItems(merged, user)
      }

      // 2. Brain Dump
      const cloudBrain = await fetchCloudBrainDump(user)
      const localBrain = readBrainDumpStorage() // Guest
      if (localBrain.left.length > 0 || localBrain.right.length > 0) {
        const mergedLeft = [...(cloudBrain?.left || []), ...localBrain.left]
        const mergedRight = [...(cloudBrain?.right || []), ...localBrain.right]
        await saveBrainDump({ left: mergedLeft, right: mergedRight }, user)
        // Clear local keys (v2 and v1)
        window.localStorage.removeItem('focus-lab-brain-dump-list-v2')
        window.localStorage.removeItem('focus-lab-brain-dump-list')
      }

      // 3. Dopamine
      const cloudDopamine = await fetchCloudDopamine(user)
      const localDopamine = readDopamineStorage(lang) // Guest
      if (localDopamine && localDopamine.length > 0) {
        // Merge unique options
        const set = new Set([...(cloudDopamine || []), ...localDopamine])
        await saveDopamine(Array.from(set), lang, user)
        window.localStorage.removeItem(`focus-lab-dopamine-menu-${lang}`)
      }

      // 4. History (Always safe to sync)
      await syncFocusHistory(user)

      // 5. Force UI to reload?
      // The components (FocusStation etc) have useEffect([user]) which loads.
      // But we just updated the cloud data. The components might have loaded "empty cloud" and sat there.
      // We need to trigger a reload or they wait for next refresh?
      // Simplest way: window.location.reload() or rely on SWR?
      // We are not using SWR.
      // We can rely on `window.location.reload()` for simplicity ensure fresh state.
      window.location.reload()
    } catch (e) {
      console.error('Migration failed:', e)
      alert(t.focusLab.errors?.migrationFailed || 'Migration failed. Please try again.')
    } finally {
      setIsMigrating(false)
      setShowMigrationModal(false)
    }
  }

  const handleCancelMigration = () => {
    setShowMigrationModal(false)
    // Optional: Clear guest data if user explicitely says "Start Fresh"?
    // Or just keep it hidden. Current behavior: Keep it hidden (User mode sees empty).
    // If they logout, it's still there. That's fine.
  }

  useEffect(() => {
    if (!showGroupModal) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowGroupModal(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
    }
  }, [showGroupModal])

  // Close Customize menu on outside click (including cards)
  useEffect(() => {
    if (!showCustomizeMenu) return
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideMenu = customizeMenuRef.current?.contains(target)
      const isButton = customizeButtonRef.current?.contains(target)
      if (!isInsideMenu && !isButton) {
        setShowCustomizeMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showCustomizeMenu])

  // Register Service Worker for external commands
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/focus-sw.js')
        .then((reg) => {
          console.log('Focus Lab SW registered', reg)
        })
        .catch((err) => {
          console.error('Focus Lab SW failed', err)
        })

      // Listen for messages
      const handler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'FOCUS_LAB_ACTION') {
          setExternalCommand(event.data.action)
        }
      }
      navigator.serviceWorker.addEventListener('message', handler)
      return () => navigator.serviceWorker.removeEventListener('message', handler)
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

  useEffect(() => {
    if (isFocusMode) {
      setIsTipOpen(true)
    } else {
      setIsTipOpen(false)
      setShowGroupModal(false)
    }
  }, [isFocusMode])

  const activePresetConfig = GRID_PRESETS[activePreset]
  const backgroundColumnWidth =
    containerWidth > 0
      ? Math.max(
          40,
          (containerWidth - (activePresetConfig.columns - 1) * GAP) / activePresetConfig.columns
        )
      : COL_WIDTH

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
      <AnimatePresence>
        {showGroupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowGroupModal(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Escape' && setShowGroupModal(false)}
          >
            {/* ... modal content ... */}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGoalModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">每日目标</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    设置专注时长与任务目标，达成后有奖励动画
                  </p>
                </div>
                {rewardUnlocked && (
                  <motion.div
                    className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <span className="icon-[solar--confetti-minimalistic-line-duotone] text-base" />
                    奖励解锁
                  </motion.div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                  <label
                    htmlFor="daily-goal-hours"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    每日专注时长目标 (小时)
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      id="daily-goal-hours"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={tempGoalHours}
                      onChange={(e) => setTempGoalHours(e.target.value)}
                      className="focus:border-primary-500 focus:ring-primary-200 w-24 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-900 focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {currentProgressHours}h / {dailyGoalHours}h
                        </span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="from-primary-400 to-primary-600 h-full rounded-full bg-gradient-to-r"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                  <label
                    htmlFor="daily-task-goal"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200"
                  >
                    每日任务数量目标 (个)
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      id="daily-task-goal"
                      type="number"
                      min="0"
                      step="1"
                      value={tempTaskGoal}
                      onChange={(e) => setTempTaskGoal(e.target.value)}
                      className="focus:border-primary-500 focus:ring-primary-200 w-24 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-gray-900 focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {tasksCompletedToday} / {dailyTaskGoal}
                        </span>
                        <span>{Math.round(taskProgressPercentage)}%</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                          style={{
                            width: `${taskProgressPercentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900 shadow-lg"
                      animate={
                        rewardUnlocked
                          ? { scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] }
                          : { scale: 1, rotate: 0 }
                      }
                      transition={{ duration: 1.4, repeat: rewardUnlocked ? Infinity : 0 }}
                    >
                      <span className="icon-[solar--medal-ribbons-star-bold-duotone] text-2xl" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        奖励进度
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        达成任一目标会触发动画奖励，保持连胜吧！
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  取消
                </button>
                <button
                  onClick={handleGoalModalSave}
                  className="bg-primary-500 shadow-primary-500/30 hover:bg-primary-600 rounded-full px-5 py-2 text-sm font-bold text-white shadow-lg transition-colors active:scale-95"
                >
                  保存目标
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAnalytics && <AnalyticsModal onClose={() => setShowAnalytics(false)} />}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGuestContinue={
          authTrigger === 'stats'
            ? undefined
            : () => {
                setShowAuthModal(false)
                setShowAnalytics(true)
              }
        }
      />

      {/* Settings Modal - Simple inline implementation for now */}
      <AnimatePresence>
        {showSettingsModal && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettingsModal(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Escape' && setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Settings Header */}
              <h2 className="mb-4 text-xl font-bold dark:text-white">
                {t.focusLab.settings?.title || 'Settings'}
              </h2>

              <div className="space-y-4">
                {/* Dark Mode */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="font-medium dark:text-gray-200">
                    {t.focusLab.settings?.darkMode || 'Dark Mode'}
                  </span>
                  <button
                    onClick={() => document.documentElement.classList.toggle('dark')}
                    className="rounded-md bg-gray-200 px-3 py-1.5 text-sm transition-colors dark:bg-gray-700"
                  >
                    {t.focusLab.settings?.on || 'Toggle'}
                  </button>
                </div>

                {/* Hide Card Headers */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="font-medium dark:text-gray-200">
                    {t.focusLab.settings?.hideHeaders || 'Hide Card Headers'}
                  </span>
                  <button
                    onClick={() =>
                      updateSettings(
                        'focus_lab.hide_headers',
                        !(settings.focus_lab?.hide_headers ?? false)
                      )
                    }
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${(settings.focus_lab?.hide_headers ?? false) ? 'bg-primary-100 text-primary-700 font-bold' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
                  >
                    {(settings.focus_lab?.hide_headers ?? false)
                      ? t.focusLab.settings?.on || 'On'
                      : t.focusLab.settings?.off || 'Off'}
                  </button>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="font-medium dark:text-gray-200">
                    {t.focusLab.settings?.notifications || 'Notifications'}
                  </span>
                  <button
                    onClick={handleToggleNotifications}
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${notificationsEnabled ? 'bg-primary-100 text-primary-700 font-bold' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
                  >
                    {notificationsEnabled
                      ? t.focusLab.settings?.on || 'On'
                      : t.focusLab.settings?.off || 'Off'}
                  </button>
                </div>

                {/* Sound Effects */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="font-medium dark:text-gray-200">
                    {t.focusLab.settings?.soundEffects || 'Sound Effects'}
                  </span>
                  <button
                    onClick={() =>
                      updateSettings(
                        'focus_lab.sound.enabled',
                        !(settings.focus_lab?.sound?.enabled ?? true)
                      )
                    }
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${(settings.focus_lab?.sound?.enabled ?? true) ? 'bg-primary-100 text-primary-700 font-bold' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
                  >
                    {(settings.focus_lab?.sound?.enabled ?? true)
                      ? t.focusLab.settings?.on || 'On'
                      : t.focusLab.settings?.off || 'Off'}
                  </button>
                </div>

                {/* Theme Color */}
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="mb-3 block font-medium dark:text-gray-200">
                    {t.focusLab.settings?.themeColor || 'Theme Color'}
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'pink', color: '#db2777', label: 'Pink' },
                      { name: 'blue', color: '#0B1F3B', label: 'Deep Navy Blue' },
                      { name: 'green', color: '#0F6B61', label: 'Cool Ink Green' },
                      { name: 'yellow', color: '#C6A15B', label: 'Champagne Gold' },
                      { name: 'violet', color: '#3B3A82', label: 'Misty Indigo' },
                      { name: 'orange', color: '#B85C4A', label: 'Terracotta Orange' },
                      { name: 'red', color: '#7A8F86', label: 'Sage Green' },
                      { name: 'slate', color: '#1F2933', label: 'Graphite Gray' },
                    ].map(({ name, color, label }) => (
                      <button
                        key={name}
                        onClick={() => {
                          setThemeColor(name as ThemeColor)
                          updateSettings('theme.color', name)
                        }}
                        className={`h-8 w-full rounded-md ring-2 ring-offset-2 ring-offset-white transition-all hover:scale-105 dark:ring-offset-gray-800 ${
                          themeColor === name
                            ? 'scale-105 ring-gray-400 dark:ring-gray-400'
                            : 'opacity-80 ring-transparent hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color }}
                        title={label}
                        aria-label={`Set theme to ${label}`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="mt-6 w-full rounded-lg bg-gray-100 py-2 font-semibold transition hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pricing Modal */}
      <AnimatePresence>
        <PlanComparisonModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />
      </AnimatePresence>

      <div className="no-scrollbar fixed inset-0 z-[100] flex h-full w-full bg-gray-50 transition-all duration-500 dark:bg-gray-950 [&::-webkit-scrollbar]:hidden">
        {/* Sidebar - Visible only in Desktop */}
        {!isMobile && (
          <motion.aside
            initial={{ width: 256, opacity: 1 }}
            animate={{
              width: isSidebarOpen ? 256 : 0,
              opacity: isSidebarOpen ? 1 : 0,
              transition: { duration: 0.3, ease: 'easeInOut' },
            }}
            className="relative z-30 flex flex-none flex-col overflow-hidden border-r border-gray-200 bg-gray-50/50 pb-6 text-gray-900 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/50 dark:text-white"
          >
            <div className="flex h-full w-[256px] flex-col">
              {/* Sidebar Header: User Profile */}
              <div className="flex h-16 items-center justify-between border-b border-gray-200/50 px-4 dark:border-gray-800/50">
                <button
                  className="ml-2 flex cursor-pointer items-center gap-3 text-left transition-opacity hover:opacity-80"
                  onClick={() => setShowAuthModal(true)}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-inner">
                    {user ? user.user_metadata?.full_name?.charAt(0) || 'U' : 'G'}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="truncate text-sm leading-tight font-semibold text-gray-900 dark:text-gray-100">
                      {user ? user.user_metadata?.full_name || 'My Workspace' : 'Guest Space'}
                    </span>
                    <span className="animate-shine inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-[length:200%_auto] px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow-sm">
                      {isPro ? t.focusLab.sidebar.proMember : t.focusLab.sidebar.freePlan}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Sidebar Nav */}
              <nav className="flex-1 space-y-2 px-4 py-8">
                {/* Focus Lab Section */}
                <div className="mb-2 px-2">
                  <span className="text-xs font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                    {t.focusLab.sidebar.focusTools}
                  </span>
                </div>

                <button
                  onClick={() => setShowAnalytics(true)}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <StatsIcon className="group-hover:text-primary-50 h-5 w-5 text-gray-400 transition-colors" />
                  {lang === 'zh' ? '统计数据' : 'Stats'}
                </button>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ProfileIcon className="group-hover:text-primary-50 h-5 w-5 text-gray-400 transition-colors" />
                  {lang === 'zh' ? '会员档案' : 'Profile'}
                </button>

                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <SettingsIcon className="group-hover:text-primary-50 h-5 w-5 text-gray-400 transition-colors" />
                  {lang === 'zh' ? '设置' : 'Settings'}
                </button>
              </nav>

              {/* Upgrade Logic in Sidebar */}
              {/* Upgrade Logic in Sidebar: Show for Guests OR Free Plan users */}
              {!isPro && (
                <div className="mb-4 px-4">
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setShowPricingModal(true)}
                    className="group relative w-full cursor-pointer rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 p-4 text-left text-white shadow-lg ring-1 ring-white/20 transition-all hover:shadow-indigo-500/20 active:scale-[0.98]"
                    onClick={() => setShowPricingModal(true)}
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <StarIcon className="h-16 w-16" />
                    </div>
                    <h3 className="relative z-10 text-sm font-bold">
                      {t.focusLab.upgradeCard?.title || 'Upgrade Plan'}
                    </h3>
                    <p className="relative z-10 mt-1 mb-3 text-xs text-indigo-100">
                      {t.focusLab.upgradeCard?.subtitle || 'Compare Free vs Pro.'}
                    </p>
                    <button className="w-full rounded bg-white py-1.5 text-xs font-bold text-indigo-600 shadow-sm transition hover:bg-gray-50">
                      {t.focusLab.upgradeCard?.button || 'View Options'}
                    </button>
                  </div>
                </div>
              )}

              {/* Sidebar Footer */}
              <div className="mt-auto space-y-6 px-6">
                {/* Daily Goal Widget */}
                <div
                  className={`group relative cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                    isGoalReached
                      ? 'border-amber-200 bg-gradient-to-br from-yellow-100 to-amber-50 dark:border-amber-700/50 dark:from-yellow-900/30 dark:to-amber-900/20'
                      : 'transaction-colors border-gray-100 bg-white hover:border-gray-200 dark:border-gray-700 dark:bg-gray-800'
                  }`}
                  onClick={() => setShowGoalModal(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setShowGoalModal(true)
                    }
                  }}
                >
                  <div className="relative z-10 mb-2 flex items-end justify-between">
                    <div className="flex flex-col">
                      <span
                        className={`text-xs font-medium ${isGoalReached ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        {isGoalReached
                          ? 'Goal Reached! 🎉'
                          : t.focusLab?.stats?.dailyGoal || 'Daily Goal'}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-sm font-bold ${isGoalReached ? 'text-amber-900 dark:text-amber-100' : 'text-gray-900 dark:text-white'}`}
                        >
                          {formatDurationLabel(todayMinutes)}
                        </span>
                        <span className="text-xs text-gray-400">/ {dailyGoalHours}h</span>
                      </div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500">
                        {`任务 ${tasksCompletedToday}/${dailyTaskGoal || '—'}`}
                      </div>
                    </div>

                    <div className="group-hover:bg-primary-50 group-hover:text-primary-600 dark:group-hover:bg-primary-900/30 dark:group-hover:text-primary-400 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500 transition-colors dark:bg-gray-700 dark:text-gray-300">
                      设置目标
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative z-10 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${isGoalReached ? 'bg-amber-500' : 'from-primary-400 to-primary-600 bg-gradient-to-r'}`}
                    />
                  </div>

                  {/* Background Glow for Success */}
                  {isGoalReached && (
                    <div className="absolute inset-0 z-0 bg-yellow-400/10 blur-xl" />
                  )}
                </div>

                {/* Exit Focus Button */}
                <button
                  onClick={onExit}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-gray-100 py-3 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <LogoutIcon className="h-4 w-4" />
                  {t.focusLab.controls.exitFocus || 'Exit Focus'}
                </button>
              </div>
            </div>
          </motion.aside>
        )}

        {/* Main Content Area */}
        <main className="relative flex h-full flex-1 flex-col">
          {/* Background Pattern - Subtle for App Mode */}
          <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
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
                backgroundSize: `${backgroundColumnWidth + GAP}px ${ROW_HEIGHT + GAP}px`,
                backgroundPosition: 'center -16px',
              }}
            />
          </div>

          {/* Inner Wide Container */}
          <div className="relative z-10 mx-auto flex h-full w-full flex-col">
            <div className="flex h-full w-full flex-col" ref={containerRef}>
              {/* Internal Header (Desktop) */}
              {!isMobile && (
                <header className="z-20 flex h-16 flex-none items-center justify-between border-b border-gray-200/50 bg-white/50 px-6 backdrop-blur dark:border-gray-800/50 dark:bg-gray-950/50">
                  <div className="flex items-center gap-4">
                    <AnimatePresence>
                      {!isSidebarOpen && (
                        <motion.button
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          onClick={() => setIsSidebarOpen(true)}
                          className="-ml-2 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        >
                          <span className="icon-[solar--hamburger-menu-linear] text-xl" />
                        </motion.button>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                        <span className="icon-[solar--layers-minimalistic-bold] text-sm" />
                      </div>
                      <h1 className="font-limelight text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Focus Lab
                      </h1>
                      <span className="flex h-5 items-center justify-center rounded border border-green-200 bg-green-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-green-700 uppercase dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Deep Work
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateSettings(
                          'focus_lab.sound.enabled',
                          !(settings.focus_lab?.sound?.enabled ?? true)
                        )
                      }
                      className="flex items-center justify-center rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                      title={t.focusLab.settings?.soundEffects || 'Sound Effects'}
                    >
                      {(settings.focus_lab?.sound?.enabled ?? true) ? (
                        <span className="icon-[solar--volume-loud-outline] text-xl" />
                      ) : (
                        <span className="icon-[solar--volume-cross-outline] text-xl text-gray-400" />
                      )}
                    </button>

                    <button
                      onClick={handleToggleNotifications}
                      className="relative flex items-center justify-center rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                      title={
                        notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'
                      }
                    >
                      {notificationsEnabled ? (
                        <span className="icon-[solar--bell-bold] text-xl" />
                      ) : (
                        <span className="icon-[solar--bell-off-outline] text-xl text-gray-400" />
                      )}
                    </button>

                    {/* Customize Layout Button & Menu */}
                    <div className="relative z-50 ml-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setShowCustomizeMenu(!showCustomizeMenu)
                        }}
                        ref={customizeButtonRef}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-lg shadow-gray-200 transition-all active:scale-95 dark:shadow-none ${
                          showCustomizeMenu
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                            : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="icon-[solar--widget-4-line-duotone] text-lg" />
                        {t.focusLab.controls.customizeLayout || 'Customize'}
                      </button>

                      <AnimatePresence>
                        {showCustomizeMenu && (
                          <motion.div
                            ref={customizeMenuRef}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900"
                          >
                            <div className="flex flex-col gap-1">
                              <h4 className="mb-1 border-b border-gray-100 px-3 py-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:border-gray-800">
                                {t.focusLab.controls.widgetVisibility || 'Show/Hide Cards'}
                              </h4>
                              {GRID_PRESETS[activePreset].layout.map((defaultItem) => {
                                const currentLayout =
                                  settings.focus_lab?.layout?.[activePreset] ||
                                  GRID_PRESETS[activePreset].layout
                                const isActive = currentLayout.some((i) => i.id === defaultItem.id)

                                const idMap: Record<string, string> = {
                                  sonic: 'sonicShield',
                                  timer: 'timer',
                                  brain: 'brainDump',
                                  todo: 'todo',
                                  breaker: 'taskBreaker',
                                  dopamine: 'dopamineMenu',
                                }
                                const translationKey = idMap[defaultItem.id] || defaultItem.id
                                // @ts-ignore
                                const widgetTitle =
                                  t.focusLab.widgets[translationKey]?.title || defaultItem.id

                                return (
                                  <button
                                    key={defaultItem.id}
                                    onClick={() => {
                                      const newLayout = isActive
                                        ? currentLayout.filter((i) => i.id !== defaultItem.id)
                                        : [...currentLayout, { ...defaultItem }]
                                      updateSettings(`focus_lab.layout.${activePreset}`, newLayout)
                                    }}
                                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                      isActive
                                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                    }`}
                                  >
                                    <span>{widgetTitle}</span>
                                    {isActive && (
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        className="text-primary-600 dark:text-primary-400 h-4 w-4"
                                      >
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </button>
                                )
                              })}

                              <div className="my-1 h-px bg-gray-100 dark:bg-gray-800" />

                              <button
                                onClick={() => {
                                  setShowCustomizeMenu(false)
                                  setShowResetConfirm(true)
                                }}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                              >
                                <span className="icon-[solar--restart-bold] text-sm" />
                                {t.focusLab.controls.resetLayout}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Click Outside Handler (Overlay) */}
                      {showCustomizeMenu && (
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowCustomizeMenu(false)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Escape' && setShowCustomizeMenu(false)}
                        />
                      )}
                    </div>
                  </div>
                </header>
              )}

              {/* Mobile Header (Simplified) */}
              {isMobile && (
                <div className="z-20 flex flex-none items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <span className="text-lg font-bold dark:text-white">Focus Lab</span>
                  <button
                    onClick={onExit}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                  >
                    Exit
                  </button>
                </div>
              )}

              {/* Grid Section */}
              <motion.div
                layout
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className={`no-scrollbar flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden ${!isMobile ? 'p-8' : 'px-2 pb-20'}`}
              >
                {isMobile ? (
                  <FocusLabMobileGrid
                    focusedTask={focusedTask}
                    onStartFocus={(task, id) => {
                      if (focusedTask?.id === id) {
                        setFocusedTask(null)
                      } else {
                        setFocusedTask({ text: task, id, timestamp: Date.now() })
                      }
                      // setExternalCommand('start-focus') // Removed auto-start
                    }}
                    externalCommand={externalCommand}
                    onCommandHandled={() => setExternalCommand(null)}
                    onSessionLogged={handleSessionLogged}
                    onTimerComplete={refreshTodayProgress}
                  />
                ) : (
                  <FocusLabGrid
                    preset={activePreset}
                    isFocusMode={true}
                    focusedCardIds={focusedCardIds}
                    onToggleFocus={toggleCardFocus}
                    // Subtract padding (p-8 = 64px) to get actual content width
                    containerWidth={Math.max(0, containerWidth - 64)}
                    focusedTask={focusedTask}
                    onStartFocus={(task, id) => {
                      if (focusedTask?.id === id) {
                        setFocusedTask(null)
                      } else {
                        setFocusedTask({ text: task, id, timestamp: Date.now() })
                      }
                      // setExternalCommand('start-focus') // Removed auto-start
                    }}
                    externalCommand={externalCommand}
                    onCommandHandled={() => setExternalCommand(null)}
                    onSessionLogged={handleSessionLogged}
                    onTimerComplete={refreshTodayProgress}
                  />
                )}
              </motion.div>
            </div>
          </div>
          {/* End of Container */}
        </main>
        {/* End of Main Area */}
      </div>
      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm dark:bg-black/40"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Escape' && setShowResetConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
            >
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                {t.focusLab.controls.resetLayout || 'Reset Layout?'}
              </h3>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                {t.focusLab.controls.resetConfirm ||
                  'This will restore the default layout arrangement. Your custom changes will be lost.'}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {t.focusLab.common?.cancel || 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    updateSettings(
                      `focus_lab.layout.${activePreset}`,
                      GRID_PRESETS[activePreset].layout
                    )
                    // 同步重置到当前界面
                    window.dispatchEvent(
                      new CustomEvent('focuslab-layout-reset', { detail: activePreset })
                    )
                    setShowResetConfirm(false)
                  }}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  {t.focusLab.controls.resetLayout || 'Reset'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

const FocusLabGrid = ({
  isFocusMode = false,
  focusedCardIds = new Set(),
  onToggleFocus = () => {},
  containerWidth,
  preset: presetProp,
  focusedTask,
  onStartFocus,
  externalCommand,
  onCommandHandled,
  onSessionLogged,
  onTimerComplete,
}: {
  isFocusMode?: boolean
  focusedCardIds?: Set<string>
  onToggleFocus?: (id: string) => void
  containerWidth: number
  preset: LayoutPreset
  focusedTask?: FocusedTaskState
  onStartFocus?: (task: string, id: string) => void
  externalCommand?: string | null
  onCommandHandled?: () => void
  onSessionLogged?: (minutes: number) => void
  onTimerComplete?: (minutes: number) => void
}) => {
  const { settings, updateSettings, isLoaded } = useFocusSettingsContext()
  const presetConfig = GRID_PRESETS[presetProp]
  const [layout, setLayout] = useState<GridItem[]>(() => cloneLayout(presetConfig.layout))
  const [activeId, setActiveId] = useState<string | null>(null)

  // 监听全局重置事件，立即回到默认布局
  useEffect(() => {
    const handler = (event: Event) => {
      const preset = (event as CustomEvent<LayoutPreset>).detail
      if (!preset || preset === presetProp) {
        setLayout(cloneLayout(presetConfig.layout))
      }
    }
    window.addEventListener('focuslab-layout-reset', handler as EventListener)
    return () => window.removeEventListener('focuslab-layout-reset', handler as EventListener)
  }, [presetConfig.layout, presetProp])

  // Sync from Settings (Cloud -> Local)
  useEffect(() => {
    if (isLoaded) {
      const savedLayout = settings.focus_lab?.layout?.[presetProp]
      if (Array.isArray(savedLayout) && savedLayout.length > 0) {
        // Force update minW/minH from current preset config to ensure new limits take effect for existing users
        const updatedLayout = savedLayout.map((item) => {
          const defaultConfig = presetConfig.layout.find((d) => d.id === item.id)
          return {
            ...item,
            minW: defaultConfig?.minW ?? 2,
            minH: defaultConfig?.minH ?? 2,
          }
        })
        setLayout(updatedLayout)
      } else {
        // Only reset to default if we have literally nothing in settings (first load)
        // or if we switched presets and that preset is empty
        // But we want to preserve local changes if cloud is empty?
        // No, if cloud is empty, we use default.
        setLayout(cloneLayout(presetConfig.layout))
      }
    }
  }, [isLoaded, presetProp, settings.focus_lab?.layout, presetConfig.layout])

  // Debounced Save
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveLayout = useCallback(
    debounce((newLayout: GridItem[], currentPreset: string) => {
      updateSettings(`focus_lab.layout.${currentPreset}`, newLayout)
    }, 1000),
    [updateSettings]
  )

  const [isDraggingOrResizing, setIsDraggingOrResizing] = useState(false)

  // Width calculation moved to parent

  // Auto-centering logic removed to ensure strict left alignment

  const columns = presetConfig.columns
  const totalGapsWidth = Math.max(0, (columns - 1) * GAP)
  const baseWidth = columns * COL_WIDTH + totalGapsWidth
  const safeContainerWidth = containerWidth > 0 ? containerWidth : baseWidth
  const availableWidth = Math.max(0, safeContainerWidth - totalGapsWidth)
  const colWidth = columns > 0 ? availableWidth / columns : COL_WIDTH
  const contentWidth = safeContainerWidth
  const gridOffset = 0

  // Helper to snap to grid
  const snapToGrid = (value: number, unitSize: number) => {
    return Math.round(value / unitSize) * unitSize
  }

  const updateLayout = (id: string, newProps: Partial<GridItem>) => {
    setLayout((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...newProps } : item))
      saveLayout(next, presetProp)
      return next
    })
  }

  const handleRemoveWidget = (id: string) => {
    setLayout((prev) => {
      const next = prev.filter((item) => item.id !== id)
      saveLayout(next, presetProp)
      return next
    })
  }

  const visibleItems =
    isFocusMode && focusedCardIds.size > 0 ? layout.filter((i) => focusedCardIds.has(i.id)) : layout

  const containerHeight =
    (layout.length > 0 ? Math.max(...layout.map((i) => i.y + i.h)) : 0) * (ROW_HEIGHT + GAP) +
    (isFocusMode ? 20 : 100)

  return (
    <div
      className={`no-scrollbar relative w-full transition-opacity duration-500 [&::-webkit-scrollbar]:hidden ${containerWidth > 0 ? 'opacity-100' : 'opacity-0'}`}
      style={{ height: containerHeight, maxWidth: '100%' }}
    >
      <div
        className="absolute top-0 h-full transition-all duration-500 ease-out"
        style={{
          left: gridOffset,
          width: contentWidth,
        }}
      >
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
                />
              )}
              {item.id === 'timer' && (
                <TimerCard
                  className="h-full w-full"
                  onToggleFocus={() => onToggleFocus(item.id)}
                  focusedTask={focusedTask}
                  externalCommand={externalCommand}
                  onCommandHandled={onCommandHandled}
                  onSessionLogged={onSessionLogged}
                  onTimerComplete={onTimerComplete}
                />
              )}
              {item.id === 'brain' && (
                <BrainDumpCard
                  className="h-full w-full"
                  onToggleFocus={() => onToggleFocus(item.id)}
                />
              )}
              {item.id === 'todo' && (
                <ToDoCard
                  className="h-full w-full"
                  cols={item.w}
                  onToggleFocus={() => onToggleFocus(item.id)}
                  onStartFocus={onStartFocus}
                  focusedTaskId={focusedTask?.id}
                />
              )}
              {item.id === 'breaker' && (
                <TaskBreakerCard
                  className="h-full w-full"
                  onToggleFocus={() => onToggleFocus(item.id)}
                />
              )}
              {item.id === 'dopamine' && (
                <DopamineMenuCard
                  className="h-full w-full"
                  cols={item.w}
                  onToggleFocus={() => onToggleFocus(item.id)}
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
      const deltaX = e.clientX - startPosRef.current.x
      const deltaY = e.clientY - startPosRef.current.y

      const newWidth = startSizeRef.current.w + deltaX
      const newHeight = startSizeRef.current.h + deltaY

      const gridW = Math.max(item.minW || 2, Math.round(newWidth / (colWidth + GAP)))
      const gridH = Math.max(item.minH || 2, Math.round(newHeight / (ROW_HEIGHT + GAP)))

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
          className="group/resize absolute right-0 bottom-0 z-50 flex h-8 w-8 cursor-grab items-end justify-end p-1.5"
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
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm ring-1 ring-black/5 backdrop-blur-md transition-all group-hover/resize:opacity-100 dark:bg-gray-800/90 dark:ring-white/10">
            <HandPalmIcon className="h-3 w-3 text-gray-500" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SonicShieldCard({
  onToggleFocus,
  onDelete,
  className,
}: {
  onToggleFocus?: () => void
  onDelete?: () => void
  className?: string
}) {
  const { t } = useTranslation()
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <WidgetCard
      title={t.focusLab.widgets.sonicShield.title}
      subtitle={t.focusLab.widgets.sonicShield.subtitle}
      onHeaderClick={onToggleFocus}
      onDelete={onDelete}
      className={className}
      customActionPosition="right"
      customAction={
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsFlipped(!isFlipped)
          }}
          className={`flex aspect-square h-8 w-8 shrink-0 items-center justify-center rounded-2xl shadow-lg ring-1 transition-all ${
            isFlipped
              ? 'bg-gray-100 text-gray-900 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700'
              : 'bg-white text-gray-400 ring-gray-100 hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-900 dark:text-gray-500 dark:ring-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-300'
          }`}
          aria-label={t.focusLab.widgets.sonicShield.settings?.title || 'Settings'}
        >
          <MoreHorizontalIcon className="h-5 w-5" />
        </button>
      }
    >
      <SonicShieldWidget isFlipped={isFlipped} onFlip={setIsFlipped} />
    </WidgetCard>
  )
}

function TimerCard({
  onToggleFocus,
  onDelete,
  className,
  focusedTask,
  externalCommand,
  onCommandHandled,
  onSessionLogged,
  onTimerComplete,
}: {
  onToggleFocus?: () => void
  onDelete?: () => void
  className?: string
  focusedTask?: FocusedTaskState
  externalCommand?: string | null
  onCommandHandled?: () => void
  onSessionLogged?: (minutes: number) => void
  onTimerComplete?: (minutes: number) => void
}) {
  const { t } = useTranslation()
  const [isFlipped, setIsFlipped] = useState(false)
  const [showTaskTitle, setShowTaskTitle] = useState(true)

  useEffect(() => {
    if (focusedTask) {
      setShowTaskTitle(true)
    }
  }, [focusedTask])

  return (
    <WidgetCard
      title={
        focusedTask ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowTaskTitle(!showTaskTitle)
            }}
            className={`block max-w-[200px] truncate text-left transition-colors ${
              showTaskTitle
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-900 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-300'
            }`}
            title={showTaskTitle && focusedTask ? focusedTask.text : t.focusLab.widgets.timer.title}
          >
            {showTaskTitle && focusedTask ? focusedTask.text : t.focusLab.widgets.timer.title}
          </button>
        ) : (
          t.focusLab.widgets.timer.title
        )
      }
      subtitle={t.focusLab.widgets.timer.subtitle}
      onHeaderClick={onToggleFocus}
      onDelete={onDelete}
      customActionPosition="right"
      customAction={
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsFlipped(!isFlipped)
          }}
          className={`relative z-10 rounded-lg p-1 transition-all ${
            isFlipped
              ? 'bg-gray-100 text-gray-900 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700'
              : 'bg-white text-gray-400 ring-gray-100 hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-900 dark:text-gray-500 dark:ring-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-300'
          }`}
          aria-label={t.focusLab.widgets.timer.switchMode || 'Switch Mode'}
        >
          <MoreHorizontalIcon className="h-5 w-5" />
        </button>
      }
      className={className}
    >
      <TimerWidget
        focusedTask={focusedTask}
        externalCommand={externalCommand}
        onCommandHandled={onCommandHandled}
        isFlipped={isFlipped}
        onFlip={setIsFlipped}
        onTimerComplete={onTimerComplete}
        onSessionLogged={onSessionLogged}
      />
    </WidgetCard>
  )
}

function TaskBreakerCard({
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

function BrainDumpCard({
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

function ToDoCard({
  cols,
  onToggleFocus,
  onDelete,
  className,
  onStartFocus,
  focusedTaskId,
}: {
  cols?: number
  onToggleFocus?: () => void
  onDelete?: () => void
  className?: string
  onStartFocus?: (task: string, id: string) => void
  focusedTaskId?: string | null
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
      <FocusStation cols={cols} onStartFocus={onStartFocus} focusedTaskId={focusedTaskId} />
    </WidgetCard>
  )
}

function DopamineMenuCard({
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
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <WidgetCard
      title={t.focusLab.widgets.dopamineMenu.title}
      subtitle={t.focusLab.widgets.dopamineMenu.subtitle}
      onHeaderClick={onToggleFocus}
      onDelete={onDelete}
      className={className}
      customActionPosition="right"
      showHeader={false}
      customAction={
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsFlipped(!isFlipped)
          }}
          className={`flex aspect-square h-8 w-8 shrink-0 items-center justify-center rounded-2xl shadow-lg ring-1 transition-all ${
            isFlipped
              ? 'bg-gray-100 text-gray-900 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700'
              : 'bg-white text-gray-400 ring-gray-100 hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-900 dark:text-gray-500 dark:ring-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-300'
          }`}
          aria-label={t.focusLab.widgets.dopamineMenu.edit || 'Edit Options'}
        >
          <MoreHorizontalIcon className="h-5 w-5" />
        </button>
      }
    >
      <DopamineMenuWidget cols={cols} isFlipped={isFlipped} onFlip={setIsFlipped} />
    </WidgetCard>
  )
}

type TimerState =
  | 'idle'
  | 'focusing'
  | 'paused-focusing'
  | 'focus-completed'
  | 'break'
  | 'paused-break'
  | 'break-completed'

type TimerPreset = 'focus' | 'short' | 'long'

const timerPresets: Record<TimerPreset, { label: string; duration: number }> = {
  focus: { label: 'Focus · 25m', duration: 25 * 60 },
  short: { label: 'Short Break · 5m', duration: 5 * 60 },
  long: { label: 'Long Break · 15m', duration: 15 * 60 },
}

const SonicShieldWidget = ({
  isFlipped,
  onFlip,
}: {
  isFlipped: boolean
  onFlip: (v: boolean) => void
}) => {
  const { t } = useTranslation()
  const { settings, updateSettings, isLoaded: isSettingsLoaded } = useFocusSettingsContext()
  const isSoundEnabled = settings.focus_lab?.sound?.enabled ?? true
  const tSounds = t.sounds
  const [customSounds, setCustomSounds] = useState<SoundOption[]>([])
  const [activeTracks, setActiveTracks] = useState<Record<string, ActiveTrack>>({})
  const [masterVolume, setMasterVolume] = useState(0.8)
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const prevSoundSettingsRef = useRef<{
    active_tracks?: Record<string, ActiveTrack>
    master_volume?: number
  }>({})
  const prevGoalRef = useRef<{ hours?: number; tasks?: number }>({})

  // Ref to prevent saving immediately after loading from context
  const isRemoteUpdate = useRef(false)

  // Load settings from Context
  useEffect(() => {
    if (!isSettingsLoaded) return
    const soundSettings = settings.focus_lab?.sound
    const nextTracks = soundSettings?.active_tracks
    const nextVolume = soundSettings?.master_volume
    const prev = prevSoundSettingsRef.current

    const tracksEqual = isEqual(nextTracks || {}, prev.active_tracks || {})
    const volumeEqual =
      typeof nextVolume === 'number' && typeof prev.master_volume === 'number'
        ? nextVolume === prev.master_volume
        : nextVolume === prev.master_volume

    if (tracksEqual && volumeEqual && isLoaded) return

    isRemoteUpdate.current = true
    if (nextTracks) setActiveTracks(nextTracks)
    if (typeof nextVolume === 'number') setMasterVolume(nextVolume)
    prevSoundSettingsRef.current = { active_tracks: nextTracks, master_volume: nextVolume }

    setTimeout(() => {
      isRemoteUpdate.current = false
      setIsLoaded(true)
    }, 50)
  }, [
    isSettingsLoaded,
    settings.focus_lab?.sound,
    settings.focus_lab?.sound?.active_tracks,
    settings.focus_lab?.sound?.master_volume,
    isLoaded,
  ])

  // Debounced Save
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveSoundSettings = useCallback(
    debounce((tracks: Record<string, ActiveTrack>, volume: number) => {
      updateSettings('focus_lab.sound', {
        active_tracks: tracks,
        master_volume: volume,
      })
    }, 1000),
    [updateSettings]
  )

  // Auto-save on change (explicitly called in handlers normally, but for volume/tracks we can use useEffect here
  // because the update frequency is lower than resize, AND we want to capture all logic paths)
  // BUT we must avoid the loop.
  // The loop happens if updateSettings -> settings change -> useEffect loads -> setState -> useEffect saves.
  // To avoid loop: Only save if state differs from settings?
  // Or just use handlers.
  // Let's use handlers wrapper.

  const updateActiveTracks = (
    callback: (prev: Record<string, ActiveTrack>) => Record<string, ActiveTrack>
  ) => {
    setActiveTracks((prev) => {
      const next = callback(prev)
      saveSoundSettings(next, masterVolume)
      return next
    })
  }

  const updateMasterVolume = (vol: number) => {
    setMasterVolume(vol)
    saveSoundSettings(activeTracks, vol)
  }

  // Save settings to context when activeTracks or masterVolume change, but not if it was a remote update
  useEffect(() => {
    if (isLoaded && !isRemoteUpdate.current && isSettingsLoaded) {
      saveSoundSettings(activeTracks, masterVolume)
    }
  }, [activeTracks, masterVolume, isLoaded, saveSoundSettings, isSettingsLoaded])

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
    <div className="@container relative flex h-full flex-col">
      <AnimatePresence mode="wait">
        {isFlipped ? (
          // BACK: Sound Grid
          <motion.div
            key="back"
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -180 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-col gap-3"
          >
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pt-2 pr-1 [&::-webkit-scrollbar]:hidden">
              <div className="grid grid-cols-1 gap-2 @[180px]:grid-cols-2 @[300px]:grid-cols-3">
                {allSounds.map((sound) => {
                  const isActive = !!activeTracks[sound.id]
                  const track = activeTracks[sound.id]

                  return (
                    <div
                      key={sound.id}
                      className={`group relative flex items-center justify-between gap-2 rounded-xl border p-2 transition-all ${
                        isActive
                          ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                          : 'hover:border-primary-200 dark:hover:border-primary-900 border-gray-100 bg-white hover:shadow-sm dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <button
                        onClick={() => toggleTrack(sound.id)}
                        className="flex flex-1 items-center text-left"
                      >
                        <span
                          className={`text-xs font-bold ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                          {tSounds[sound.name as keyof typeof tSounds] || sound.name}
                        </span>
                      </button>

                      {isActive && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 flex items-center">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={track.volume}
                            onChange={(e) =>
                              updateTrackVolume(sound.id, parseFloat(e.target.value))
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="bg-primary-200 accent-primary-600 dark:bg-primary-900 dark:accent-primary-400 h-1 w-14 cursor-pointer rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          // FRONT: Visualizer & Master Volume
          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex h-full flex-col justify-center"
          >
            <div className="relative flex h-full w-full flex-col justify-between">
              {/* Center: Visualizer */}
              <div className="flex flex-1 flex-col items-center justify-center">
                <SoundVisualizer
                  activeCount={isGlobalPlaying && isSoundEnabled ? activeCount : 0}
                />
              </div>

              {/* Bottom: Controls */}
              <div className="flex w-full items-center gap-4 pt-4">
                {/* Play/Pause Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    updateSettings('focus_lab.sound.enabled', !isSoundEnabled)
                  }}
                  className="flex h-12 w-12 items-center justify-center text-gray-900 transition-colors hover:opacity-80 dark:text-white"
                  title={isSoundEnabled ? 'Pause' : 'Play'}
                >
                  {isSoundEnabled ? (
                    <span className="icon-[solar--pause-bold] text-2xl" />
                  ) : (
                    <span className="icon-[solar--play-bold] ml-1 text-2xl" />
                  )}
                </button>

                {/* Horizontal Volume Slider */}
                <div className="group flex flex-1 justify-end">
                  <div
                    className="relative h-2 w-full max-w-[120px] cursor-pointer rounded-full bg-gray-100 dark:bg-gray-800"
                    onPointerDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const handleMove = (moveEvent: PointerEvent) => {
                        const width = rect.width
                        const left = rect.left
                        const clientX = moveEvent.clientX
                        const percentage = Math.max(0, Math.min(1, (clientX - left) / width))
                        updateMasterVolume(percentage)
                      }

                      handleMove(e.nativeEvent)

                      const handleUp = () => {
                        window.removeEventListener('pointermove', handleMove)
                        window.removeEventListener('pointerup', handleUp)
                      }

                      window.addEventListener('pointermove', handleMove)
                      window.addEventListener('pointerup', handleUp)
                    }}
                  >
                    <div
                      className="group-hover:bg-primary-500 dark:group-hover:bg-primary-400 absolute left-0 h-full rounded-full bg-gray-300 transition-all dark:bg-gray-600"
                      style={{ width: `${masterVolume * 100}%` }}
                    />
                    <div
                      className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:bg-gray-200"
                      style={{ left: `calc(${masterVolume * 100}% - 7px)` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Audio Elements (Hidden) */}
      <div className="hidden">
        {allSounds.map((sound) => {
          const isActive = !!activeTracks[sound.id]
          if (!isActive) return null
          return (
            <audio
              key={sound.id}
              ref={(el) => {
                if (el) audioRefs.current[sound.id] = el
                else delete audioRefs.current[sound.id]
              }}
              loop
              preload="auto"
              src={sound.path}
              muted={!isSoundEnabled}
            >
              <track kind="captions" src="data:text/vtt;base64,V0VCVlRVCg==" label="English" />
            </audio>
          )
        })}
      </div>
    </div>
  )
}

const TimerWidget = ({
  onTimerComplete,
  onSessionLogged,
  focusedTask,
  externalCommand,
  onCommandHandled,
  isFlipped,
  onFlip,
}: {
  onTimerComplete?: (minutes: number) => void
  onSessionLogged?: (minutes: number) => void
  focusedTask?: FocusedTaskState
  externalCommand?: string | null
  onCommandHandled?: () => void
  isFlipped: boolean
  onFlip: (flipped: boolean) => void
}) => {
  const { t, language: lang } = useTranslation()
  const { user } = useAuth()
  const { settings, updateSettings, isLoaded: isSettingsLoaded } = useFocusSettingsContext()
  const [activePreset, setActivePreset] = useState<TimerPreset>('focus')
  const [customMinutes, setCustomMinutes] = useState(15)
  const [isEditingCustom, setIsEditingCustom] = useState(false)
  const [isCustomChanged, setIsCustomChanged] = useState(false)
  const hasHydratedCustom = useRef(false)
  const prevCustomDurationRef = useRef<number | null>(null)
  // Internal isFlipped removed in favor of prop

  // Timer Core State
  const [timeLeft, setTimeLeft] = useState(timerPresets.focus.duration) // Seconds. Countdown: remaining. Stopwatch: elapsed.
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [timerMode, setTimerMode] = useState<'countdown' | 'stopwatch'>('countdown')
  const [totalAllocatedDuration, setTotalAllocatedDuration] = useState(timerPresets.focus.duration) // For accurate countdown accounting

  const [permission, setPermission] = useState<NotificationPermission>('default')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null) // Timestamp when current session started (for storage)
  const hasLoggedRef = useRef(false)

  // -- Helpers --
  const isRunning = timerState === 'focusing' || timerState === 'break'
  const isPaused = timerState === 'paused-focusing' || timerState === 'paused-break'
  const isCompleted = timerState === 'focus-completed' || timerState === 'break-completed'

  // Derive mode from flip state (front = countdown, back = stopwatch)
  const derivedMode = isFlipped ? 'stopwatch' : 'countdown'

  // Initialize Audio & Permissions
  useEffect(() => {
    audioRef.current = new Audio('/static/sounds/alarm.mp3')
    audioRef.current.load()
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission)
    }
  }, [])

  // Hydrate custom duration from settings (seconds -> minutes)
  useEffect(() => {
    if (!isSettingsLoaded) return
    const storedSeconds = settings.focus_lab?.timer?.custom_duration
    // 仅在第一次或云端数值变化时同步，避免 setState 循环
    if (storedSeconds === prevCustomDurationRef.current && hasHydratedCustom.current) return
    prevCustomDurationRef.current = storedSeconds ?? null

    if (typeof storedSeconds === 'number') {
      const minutes = Math.max(1, Math.round(storedSeconds / 60))
      if (minutes !== customMinutes) {
        hasHydratedCustom.current = true
        setCustomMinutes(minutes)
        return
      }
    }
    if (!hasHydratedCustom.current) hasHydratedCustom.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSettingsLoaded, settings.focus_lab?.timer?.custom_duration])

  // Persist custom duration to settings/Supabase when user changes it
  useEffect(() => {
    if (!hasHydratedCustom.current) return
    const currentStored = settings.focus_lab?.timer?.custom_duration
    const nextSeconds = customMinutes * 60
    if (currentStored === nextSeconds) return
    prevCustomDurationRef.current = nextSeconds
    updateSettings('focus_lab.timer.custom_duration', nextSeconds)
  }, [customMinutes, settings.focus_lab?.timer?.custom_duration, updateSettings])

  const playAlarmSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((e) => console.error('Play alarm failed:', e))
    }
  }, [])

  const finalizeSession = useCallback(
    async ({ completed, elapsedSeconds }: { completed: boolean; elapsedSeconds?: number }) => {
      try {
        // Prevent double logging on the same completion
        if (completed && hasLoggedRef.current) return

        const now = Date.now()
        const resolvedElapsedSeconds =
          typeof elapsedSeconds === 'number'
            ? elapsedSeconds
            : derivedMode === 'countdown'
              ? Math.max(0, totalAllocatedDuration - timeLeft)
              : timeLeft

        const durationMinutes = resolvedElapsedSeconds / 60
        if (!completed && durationMinutes < 0.1) return

        const id =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `session-${now}-${Math.random()}`
        const finalStartTime = startTime ? startTime : now - resolvedElapsedSeconds * 1000

        await saveSession(
          {
            id,
            taskName: focusedTask?.text || null,
            startTime: finalStartTime,
            durationMinutes,
            completed,
          },
          user
        )
        if (user) syncFocusHistory(user)
        if (completed) hasLoggedRef.current = true
        if (onSessionLogged) onSessionLogged(durationMinutes)
      } catch (e) {
        console.error('Error recording session:', e)
      }
    },
    [
      derivedMode,
      focusedTask?.text,
      onSessionLogged,
      startTime,
      timeLeft,
      totalAllocatedDuration,
      user,
    ]
  )

  // -- Timer Logic --

  // Reset/Init when mode/preset changes (Only if Idle)
  // useEffect(() => {
  //   if (timerState !== 'idle') return

  // Reset timer when flipping (changing modes)
  useEffect(() => {
    if (timerState !== 'idle') return
    setTimerState('idle')
    setStartTime(null)
    hasLoggedRef.current = false
    if (isFlipped) {
      // Stopwatch: start at 0
      setTimeLeft(0)
      setTotalAllocatedDuration(0)
    } else {
      // Countdown: load active preset
      const d = activePreset === 'long' ? customMinutes * 60 : timerPresets[activePreset].duration
      setTimeLeft(d)
      setTotalAllocatedDuration(d)
    }
  }, [isFlipped, activePreset, customMinutes, timerState]) // Re-run when preset changes too

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerState === 'focusing' || timerState === 'break') {
      interval = setInterval(() => {
        const now = Date.now()
        // If we strictly track start time, we might need drift correction.
        // For simplicity now:
        if (derivedMode === 'countdown') {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              // Complete
              playAlarmSound()
              setTimerState(timerState === 'focusing' ? 'focus-completed' : 'break-completed')
              return 0
            }
            return prev - 1
          })
        } else {
          // Stopwatch (Count Up)
          setTimeLeft((prev) => prev + 1)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [
    timerState,
    derivedMode,
    totalAllocatedDuration,
    startTime,
    focusedTask,
    playAlarmSound,
    user,
  ])

  // Log completion when entering completed state
  useEffect(() => {
    if (timerState === 'focus-completed') {
      finalizeSession({ completed: true, elapsedSeconds: totalAllocatedDuration })
      const minutes = Math.floor((totalAllocatedDuration - 0) / 60)
      if (onTimerComplete) onTimerComplete(minutes)
    }
  }, [finalizeSession, onTimerComplete, timerState, totalAllocatedDuration])

  // -- Actions --
  const startTimer = () => {
    hasLoggedRef.current = false
    setStartTime(Date.now())
    // 倒计时与秒表一律进入专注态，避免短/长休息预设被当作 break 而不记录
    if (timerState === 'idle') {
      setTimerState('focusing')
    } else if (isPaused) {
      setTimerState('focusing')
    }
  }

  const pauseTimer = () => {
    if (timerState === 'focusing') setTimerState('paused-focusing')
    if (timerState === 'break') setTimerState('paused-break')
  }

  const endSession = () => {
    // Avoid double logging after auto-complete
    if (timerState === 'focus-completed') {
      setTimerState('idle')
      setStartTime(null)
      const d = activePreset === 'long' ? customMinutes * 60 : timerPresets[activePreset].duration
      setTimeLeft(derivedMode === 'countdown' ? d : 0)
      setTotalAllocatedDuration(derivedMode === 'countdown' ? d : 0)
      return
    }

    if (timerState === 'focusing' || timerState === 'paused-focusing') {
      const elapsedSeconds =
        derivedMode === 'countdown' ? Math.max(0, totalAllocatedDuration - timeLeft) : timeLeft
      finalizeSession({ elapsedSeconds, completed: false })
    }

    setTimerState('idle')
    setStartTime(null)
    if (derivedMode === 'countdown') {
      const d = activePreset === 'long' ? customMinutes * 60 : timerPresets[activePreset].duration
      setTimeLeft(d)
      setTotalAllocatedDuration(d)
    } else {
      setTimeLeft(0)
      setTotalAllocatedDuration(0)
    }
  }

  const extendSession = () => {
    // +5 Min
    if (isCompleted) {
      // Post-completion extension
      hasLoggedRef.current = false
      setTimerState('focusing')
      setTimeLeft(5 * 60)
      setTotalAllocatedDuration(5 * 60)
      setStartTime(Date.now())
    } else {
      // Mid-session extension
      setTimeLeft((prev) => prev + 300)
      if (timerMode === 'countdown') {
        setTotalAllocatedDuration((prev) => prev + 300)
      }
    }
  }

  const continueNewSession = () => {
    // Start fresh loop
    hasLoggedRef.current = false
    setTimerState('focusing')
    const d = activePreset === 'long' ? customMinutes * 60 : timerPresets[activePreset].duration
    setTimeLeft(d)
    setTotalAllocatedDuration(d)
    setStartTime(Date.now())
  }

  // -- UI Helpers --
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const progress =
    derivedMode === 'stopwatch'
      ? 1
      : Math.min(Math.max(timeLeft / (totalAllocatedDuration || 1), 0), 1)

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  const circleTextClass = isCompleted
    ? timerState === 'focus-completed'
      ? 'text-center text-xl font-bold text-primary-600 dark:text-primary-400'
      : 'text-center text-xl font-bold text-primary-500'
    : 'focuslab-numeric text-3xl font-bold tracking-tight text-gray-800 dark:text-white'

  // -- Render --
  return (
    <div className="relative flex h-full flex-col">
      <AnimatePresence mode="wait">
        {isFlipped ? (
          // BACK: Settings
          // BACK: Stopwatch Mode
          <motion.div
            key="back"
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -180 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-col"
          >
            {/* Stopwatch Display */}
            <div className="flex flex-1 flex-col items-center justify-center">
              <div
                className="flex w-full items-center justify-center"
                style={{ containerType: 'inline-size' }}
              >
                <div
                  className="focuslab-numeric text-primary-600 dark:text-primary-400 leading-none font-black tracking-tight"
                  style={{ fontSize: 'clamp(2.5rem, 26cqw, 7rem)' }}
                >
                  {display}
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-400">
                {isRunning
                  ? t.focusLab.widgets.timer.recording || 'Recording time...'
                  : t.focusLab.widgets.timer.ready || 'Ready to start'}
              </p>
            </div>

            {/* Stopwatch Controls */}
            <div className="w-full">
              {timerState === 'idle' && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      playClickSound()
                      startTimer()
                    }}
                    className="bg-primary-500 shadow-primary-500/30 hover:bg-primary-600 flex w-auto min-w-[140px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-bold text-white shadow-lg transition-all active:scale-95"
                  >
                    <PlayIcon className="h-4 w-4" />
                    {t.focusLab.widgets.timer.start}
                  </button>
                </div>
              )}

              {isRunning && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      playClickSound()
                      pauseTimer()
                    }}
                    className="bg-primary-500 shadow-primary-500/30 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500 flex w-auto min-w-[140px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-bold text-white shadow-lg transition-all active:scale-95"
                  >
                    <PauseIcon className="h-4 w-4" />
                    {t.focusLab.widgets.timer.pause}
                  </button>
                </div>
              )}

              {(isPaused || isCompleted) && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      playClickSound()
                      endSession()
                    }}
                    className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm font-bold text-gray-500 transition-all hover:bg-red-50 hover:text-red-500 active:scale-95 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    {t.focusLab.widgets.timer.endSession || 'End'}
                  </button>
                  <button
                    onClick={() => {
                      playClickSound()
                      startTimer()
                    }}
                    className="bg-primary-500 hover:bg-primary-600 shadow-primary-500/30 flex flex-[2] items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-bold text-white shadow-lg transition-all active:scale-95"
                  >
                    <PlayIcon className="h-5 w-5" />
                    {t.focusLab.widgets.timer.resume || 'Resume'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // FRONT: Timer Display

          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col justify-between"
          >
            {/* Presets (Visible Only When Idle) */}
            <div className="flex h-10 items-center justify-center">
              <AnimatePresence>
                {timerState === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 rounded-xl bg-gray-50 p-1 dark:bg-gray-800"
                  >
                    {(['focus', 'short', 'long'] as TimerPreset[]).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setActivePreset(preset)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                          activePreset === preset
                            ? 'text-primary-600 dark:text-primary-400 dark:bg-primary-800/40 bg-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        {preset === 'focus' && '25m'}
                        {preset === 'short' && '5m'}
                        {preset === 'long' && (
                          <span className="flex items-center gap-1">
                            {isEditingCustom ? (
                              <input
                                type="number"
                                min="1"
                                max="120"
                                ref={(input) => input?.focus()}
                                value={customMinutes}
                                onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 0)}
                                onBlur={() => {
                                  setCustomMinutes(Math.max(1, Math.min(120, customMinutes)))
                                  setIsEditingCustom(false)
                                  setIsCustomChanged(true)
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && setIsEditingCustom(false)}
                                className="w-8 rounded bg-transparent p-0 text-center outline-none"
                              />
                            ) : (
                              <span onDoubleClick={() => setIsEditingCustom(true)}>
                                {customMinutes}m
                              </span>
                            )}
                          </span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center">
              <div
                className="flex w-full items-center justify-center"
                style={{ containerType: 'inline-size' }}
              >
                <div
                  className={`focuslab-numeric leading-none font-black tracking-tight ${isCompleted ? 'text-primary-600 dark:text-primary-400' : 'text-primary-600 dark:text-primary-400'}`}
                  style={{
                    fontSize: isCompleted
                      ? 'clamp(2rem, 15cqw, 4.5rem)'
                      : 'clamp(2.5rem, 26cqw, 7rem)',
                  }}
                >
                  {isCompleted
                    ? t.focusLab.widgets.timer.congratulations || 'Congratulations'
                    : display}
                </div>
              </div>
              {!isCompleted && timerState !== 'idle' && (
                <p className="mt-2 animate-pulse text-sm font-medium text-gray-400">
                  {timerState === 'focusing'
                    ? 'Stay focused'
                    : timerState === 'break'
                      ? 'Take a break'
                      : 'Paused'}
                </p>
              )}
            </div>

            {/* Bottom Action Button */}
            <div className="w-full">
              {timerState === 'idle' && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      playClickSound()
                      startTimer()
                    }}
                    className="bg-primary-500 shadow-primary-500/30 hover:bg-primary-600 flex w-auto min-w-[140px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-bold text-white shadow-lg transition-all active:scale-95"
                  >
                    {/* Play Icon */}
                    <span className="icon-[solar--play-bold] text-lg" />
                    {t.focusLab.widgets.timer.start}
                  </button>
                </div>
              )}

              {isRunning && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      playClickSound()
                      pauseTimer()
                    }}
                    className="bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500 flex w-auto min-w-[140px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-bold text-white shadow-lg transition-all active:scale-95"
                  >
                    {/* Pause Icon */}
                    <span className="icon-[solar--pause-bold] text-lg" />
                    {t.focusLab.widgets.timer.pause}
                  </button>
                </div>
              )}

              {isPaused && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      playClickSound()
                      endSession()
                    }}
                    className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm font-bold text-gray-500 transition-all hover:bg-red-50 hover:text-red-500 active:scale-95 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    {t.focusLab.widgets.timer.endSession || 'End'}
                  </button>
                  <button
                    onClick={() => {
                      playClickSound()
                      startTimer()
                    }}
                    className="bg-primary-500 hover:bg-primary-600 shadow-primary-500/30 flex flex-[2] items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-bold text-white shadow-lg transition-all active:scale-95"
                  >
                    <span className="icon-[solar--play-bold] text-xl" />
                    {t.focusLab.widgets.timer.resume || 'Resume'}
                  </button>
                </div>
              )}

              {isCompleted && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={() => {
                      playClickSound()
                      endSession()
                    }}
                    className="w-full rounded-full bg-gray-100 px-6 py-3 text-base font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-200 active:scale-95 sm:flex-1 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {t.focusLab.widgets.timer.endFocus || 'End Focus'}
                  </button>
                  <button
                    onClick={() => {
                      playClickSound()
                      continueNewSession()
                    }}
                    className="bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 w-full rounded-full px-6 py-3 text-base font-extrabold text-white shadow-lg transition-all active:scale-95 sm:flex-1"
                  >
                    {t.focusLab.widgets.timer.continueFocus || 'One more round'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const TaskBreakerWidget = () => {
  const { t, language: lang } = useTranslation()
  const { user } = useAuth()
  const [task, setTask] = useState('')
  const [visibleSteps, setVisibleSteps] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isResultView, setIsResultView] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTransferring, setIsTransferring] = useState(false)
  const [hasTransferred, setHasTransferred] = useState(false)
  const [transferStatus, setTransferStatus] = useState<'idle' | 'success' | 'error'>('idle')
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
    setHasTransferred(false)
    setTransferStatus('idle')

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

  const handleTransferToTodo = () => {
    if (visibleSteps.length === 0 || isLoading || isTransferring || hasTransferred) return
    setIsTransferring(true)
    try {
      const existingItems = readStationStorage()
      const newItems = visibleSteps.map((step) => createFocusItem('text', step))
      // Combine and save. 'user' is available in component scope.
      saveStationItems([...newItems, ...existingItems], user)
      setTransferStatus('success')
      setHasTransferred(true)
    } catch (err) {
      console.error('Failed to transfer AI steps to Focus Station:', err)
      setTransferStatus('error')
    } finally {
      setIsTransferring(false)
    }
  }

  const handleReset = () => {
    clearTimers()
    setTask('')
    setVisibleSteps([])
    setIsResultView(false)
    setIsLoading(false)
    setError(null)
    setHasTransferred(false)
    setTransferStatus('idle')
    setIsTransferring(false)
  }

  if (isResultView) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-stretch gap-4">
          {/* Left: Task Content Area */}
          <div className="bg-primary-50 dark:bg-primary-900/20 relative flex flex-1 items-center justify-center rounded-[24px] p-6">
            <p className="text-center text-sm leading-relaxed font-bold text-gray-900 dark:text-gray-100">
              {task}
            </p>
          </div>

          {/* Right: Iconic Actions */}
          <div className="flex shrink-0 flex-col gap-2">
            <button
              onClick={handleTransferToTodo}
              disabled={visibleSteps.length === 0 || isLoading || isTransferring || hasTransferred}
              className="bg-primary-100 text-primary-600 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 flex h-[48px] w-[48px] items-center justify-center rounded-2xl shadow-sm transition-all disabled:opacity-30"
              title={t.focusLab.widgets.taskBreaker.transferButton}
            >
              {isTransferring ? (
                <span className="border-primary-500/60 border-t-primary-500 h-4 w-4 animate-spin rounded-full border-2" />
              ) : (
                <ArrowLaunchIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={handleReset}
              className="flex h-[48px] w-[48px] items-center justify-center rounded-2xl bg-gray-50 text-gray-400 shadow-sm transition-all hover:bg-gray-100 hover:text-gray-600 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              title={t.focusLab.widgets.taskBreaker.newTask}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        {transferStatus !== 'idle' && (
          <p
            className={`text-xs font-semibold ${
              transferStatus === 'success'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-500 dark:text-red-400'
            }`}
          >
            {transferStatus === 'success'
              ? t.focusLab.widgets.taskBreaker.transferSuccess
              : t.focusLab.widgets.taskBreaker.transferError}
          </p>
        )}

        <div className="no-scrollbar flex-1 overflow-y-auto rounded-2xl border border-dashed border-gray-200 p-1 pr-2 dark:border-gray-700 [&::-webkit-scrollbar]:hidden">
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
    <div className="flex h-full flex-col pb-0">
      <div className="flex flex-1 items-center justify-center">
        <div className="flex w-full max-w-xl flex-col items-center gap-2">
          <div className="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 flex h-12 w-12 items-center justify-center rounded-2xl">
            <MagicIcon className="h-6 w-6" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t.focusLab.widgets.taskBreaker.overwhelmed}
          </h3>

          <textarea
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder={
              lang === 'zh'
                ? '输入任务，AI帮你拆解步骤...\n\n例如： 打扫整个公寓...'
                : 'Enter a task, AI breaks it down...\n\ne.g., Clean the entire apartment...'
            }
            className="focus:border-primary-500 focus:ring-primary-500 no-scrollbar mt-1 h-24 w-full resize-none rounded-2xl border border-gray-100 bg-gray-100 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:bg-gray-800"
          />
        </div>
      </div>

      <div className="mt-auto flex justify-center pt-2 pb-0">
        <button
          type="button"
          onClick={handleBreakDown}
          disabled={!task.trim()}
          className="bg-primary-500 shadow-primary-500/30 hover:bg-primary-600 flex w-auto min-w-[140px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 dark:text-white dark:shadow-none"
        >
          {t.focusLab.widgets.taskBreaker.button}
        </button>
      </div>
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
            ? 'text-gray-400 line-through dark:text-gray-500'
            : 'text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100'
        } `}
      >
        {step}
      </span>
    </motion.li>
  )
}

const BrainDumpWidget = () => {
  const { t, language: lang } = useTranslation()
  const { user } = useAuth()
  const [leftItems, setLeftItems] = useState<BrainDumpItem[]>([])
  const [rightItems, setRightItems] = useState<BrainDumpItem[]>([])
  const [inputValue, setInputValue] = useState('')
  const [pendingImage, setPendingImage] = useState<string | null>(null)

  const [isLoaded, setIsLoaded] = useState(false)

  // Safety Ref to prevent leak
  const dataOwnerId = useRef<string | undefined>(undefined)

  // Load and migrate data
  useEffect(() => {
    const init = async () => {
      const left: BrainDumpItem[] = []
      const right: BrainDumpItem[] = []

      // 1. Try Cloud First if User
      if (user) {
        const cloud = await fetchCloudBrainDump(user)
        if (cloud && (cloud.left.length > 0 || cloud.right.length > 0)) {
          setLeftItems(cloud.left)
          setRightItems(cloud.right)
          setIsLoaded(true)
          dataOwnerId.current = user.id
          return
        }
      }

      // 2. Fallback to Local
      const local = readBrainDumpStorage(user?.id)
      if (local.left.length > 0 || local.right.length > 0) {
        // ... (existing logic) ...
        // We need to keep the existing sanitization logic here...
        // Actually, to keep chunk size small, maybe I shouldn't rewrite the whole init function?
        // But I need to set dataOwnerId.current!

        // Let's use a smaller targeted replace if possible, or rewrite carefully.
        // The existing code has a lot of logic inside local block.
        // I will rewrite the whole `useEffect` for Init to be safe.

        // Robust UUID Generator
        const generateUUID = () => {
          if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0,
              v = c == 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
          })
        }

        // Sanitize IDs
        const sanitize = (list: BrainDumpItem[]) =>
          list.map((item) => {
            const isValidUUID =
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)
            return isValidUUID ? item : { ...item, id: generateUUID() }
          })

        setLeftItems(sanitize(local.left))
        setRightItems(sanitize(local.right))
      } else {
        // Migration Logic
        try {
          const storedV2 = window.localStorage.getItem('focus-lab-brain-dump-list-v2')
          if (storedV2) {
            const items: BrainDumpItem[] = JSON.parse(storedV2)
            const fixedItems = items.map((i) => ({ ...i, id: crypto.randomUUID() }))
            const mid = Math.ceil(fixedItems.length / 2)
            setLeftItems(fixedItems.slice(0, mid))
            setRightItems(fixedItems.slice(mid))
          } else {
            const storedV1 = window.localStorage.getItem('focus-lab-brain-dump-list')
            if (storedV1) {
              const oldItems: string[] = JSON.parse(storedV1)
              const migrated = oldItems.map((item) => {
                const isImage = item.startsWith('data:image')
                return {
                  id: crypto.randomUUID(),
                  text: isImage ? '' : item,
                  image: isImage ? item : undefined,
                }
              })
              const mid = Math.ceil(migrated.length / 2)
              setLeftItems(migrated.slice(0, mid))
              setRightItems(migrated.slice(mid))
            }
          }
        } catch (e) {
          console.error(e)
        }
      }

      dataOwnerId.current = user?.id
      setIsLoaded(true)
    }

    init()
  }, [user])

  // Persist data
  useEffect(() => {
    if (!isLoaded) return

    // Safety Guard
    if (user?.id !== dataOwnerId.current) {
      if (!user && dataOwnerId.current === undefined) {
        // OK
      } else {
        return // Mismatch
      }
    }

    const save = async () => {
      await saveBrainDump({ left: leftItems, right: rightItems }, user)
    }
    const timeout = setTimeout(save, 1000) // Debounce save
    return () => clearTimeout(timeout)
  }, [leftItems, rightItems, isLoaded, user])

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

    // Use helper to ensure valid UUID
    const newItem = createBrainDumpItem(inputValue.trim(), pendingImage || undefined)

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
      className={`group ring-primary-100/50 dark:ring-primary-900/40 relative mb-3 break-inside-avoid rounded-xl shadow-sm ring-1 transition-all hover:rotate-1 hover:shadow-md ${
        item.image ? 'bg-white dark:bg-gray-800' : 'bg-yellow-100 dark:bg-yellow-900/30'
      } `}
    >
      {/* Header Bar (Tape/Tag look) */}
      <div
        className={`h-3 w-full ${
          item.image
            ? 'bg-primary-100 dark:bg-primary-900/40'
            : 'bg-yellow-200/50 dark:bg-yellow-900/50'
        } `}
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
            <TransferIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDelete(item.id, column)}
            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
            title={t.focusLab.widgets.brainDump.accessibility.deleteNote}
            aria-label={t.focusLab.widgets.brainDump.accessibility.deleteNote}
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Reorder.Item>
  )

  return (
    <div className="flex h-full flex-col gap-4">
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
              className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pr-12 pl-4 text-sm text-gray-900 placeholder:text-gray-500 focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!inputValue.trim() && !pendingImage}
              className="text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1.5 transition-colors disabled:text-gray-300 dark:disabled:text-gray-600"
              aria-label={t.focusLab.widgets.brainDump.accessibility.addThought}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={leftItems.length === 0 && rightItems.length === 0}
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 disabled:hover:bg-gray-100 disabled:hover:text-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            title={t.focusLab.widgets.brainDump.accessibility.clearBoard}
            aria-label={t.focusLab.widgets.brainDump.accessibility.clearBoard}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Pending Image Preview */}
        <AnimatePresence>
          {pendingImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingImage} alt="Preview" className="h-20 w-auto object-cover p-1" />
              <button
                type="button"
                onClick={() => setPendingImage(null)}
                className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                aria-label={t.focusLab.widgets.brainDump.accessibility.removeImage}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Two-Column Masonry Grid */}
      <div className="no-scrollbar flex-1 overflow-y-auto rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-1.5 dark:border-gray-700 dark:bg-gray-800/20 [&::-webkit-scrollbar]:hidden">
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

const DopamineMenuWidget = ({
  cols = 6,
  isFlipped,
  onFlip,
}: {
  cols?: number
  isFlipped: boolean
  onFlip: (v: boolean) => void
}) => {
  const { t, language: lang } = useTranslation()
  const { user } = useAuth()
  const defaultOptions = useMemo(() => [...t.focusLab.widgets.dopamineMenu.defaultOptions], [t])
  const [options, setOptions] = useState<string[]>(defaultOptions)
  const [newOption, setNewOption] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const [showResult, setShowResult] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Safety Ref to prevent leak
  const dataOwnerId = useRef<string | undefined>(undefined)

  // Load options
  useEffect(() => {
    const init = async () => {
      // 1. Cloud
      if (user) {
        const cloud = await fetchCloudDopamine(user)
        if (cloud && cloud.length > 0) {
          setOptions(uniq(cloud))
          setIsLoaded(true)
          dataOwnerId.current = user.id
          return
        }
      }

      // 2. Local
      const local = readDopamineStorage(lang, user?.id)
      if (local) {
        setOptions(uniq(local))
      } else {
        setOptions(defaultOptions)
      }
      dataOwnerId.current = user?.id
      setIsLoaded(true)
    }
    init()
  }, [lang, defaultOptions, user])

  // Save options
  useEffect(() => {
    if (!isLoaded) return

    // Safety Guard
    if (user?.id !== dataOwnerId.current) {
      if (!user && dataOwnerId.current === undefined) {
        // OK
      } else {
        return // Mismatch
      }
    }

    const save = async () => {
      await saveDopamine(options, lang, user)
    }
    const timeout = setTimeout(save, 1000)
    return () => clearTimeout(timeout)
  }, [options, lang, isLoaded, user])

  const handleSpin = () => {
    if (options.length === 0) return
    setIsSpinning(true)
    setShowResult(false)
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
        setShowResult(true)
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
    <div className="relative flex h-full flex-col">
      <AnimatePresence mode="wait">
        {isFlipped ? (
          // BACK: Settings / Options List
          <motion.div
            key="back"
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -180 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-col gap-2.5"
          >
            {/* Inner Header Removed as per request */}

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addOption()}
                placeholder={t.focusLab.widgets.dopamineMenu.addPlaceholder}
                className="focus:border-primary-500 focus:ring-primary-500 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
              <button
                onClick={addOption}
                className="bg-primary-500 hover:bg-primary-600 rounded-lg px-4 py-2 text-sm font-bold text-white shadow-sm transition-all active:scale-95"
              >
                {t.focusLab.widgets.dopamineMenu.add}
              </button>
            </div>

            {/* List */}
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto rounded-xl border border-dashed border-gray-200 p-2 dark:border-gray-700 [&::-webkit-scrollbar]:hidden">
              <div className={`gap - 2 grid ${cols >= 3 ? 'grid-cols-2' : 'grid-cols-1'} `}>
                {options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="group hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center justify-between rounded-lg bg-white p-2 text-sm shadow-sm transition-all dark:bg-gray-800 dark:text-gray-200"
                  >
                    <span className="truncate pr-2">{opt}</span>
                    <button
                      onClick={() => removeOption(idx)}
                      className="p-1 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
                      aria-label={t.focusLab.widgets.dopamineMenu.accessibility.removeOption}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : showResult ? (
          // RESULT VIEW
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex h-full flex-col items-center justify-center gap-6 text-center"
            style={{ containerType: 'inline-size' }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="text-4xl">🎉</div>
              <h3 className="max-w-full px-4 text-2xl font-black break-words text-gray-900 dark:text-white">
                {selected}
              </h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResult(false)}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <CheckIcon className="h-5 w-5" />
                <span className="hidden @[220px]:inline">
                  {t.focusLab.widgets.dopamineMenu.done || 'Done'}
                </span>
              </button>
              <button
                onClick={() => {
                  playClickSound()
                  handleSpin()
                }}
                className="bg-primary-500 shadow-primary-200 hover:bg-primary-600 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-white shadow-lg transition-transform active:scale-95"
              >
                <MagicIcon className="h-5 w-5" />
                <span className="hidden @[240px]:inline">
                  {t.focusLab.widgets.dopamineMenu.spinAgain || 'Spin Again'}
                </span>
              </button>
            </div>
          </motion.div>
        ) : (
          // FRONT: Simple Card + Spinner Overlay
          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex h-full flex-col"
          >
            {/* Edit Button moved to Header */}

            {isSpinning ? (
              // Spinning State
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="border-primary-200 border-t-primary-500 h-12 w-12 animate-spin rounded-full border-4" />
                <p className="text-primary-600 dark:text-primary-400 animate-pulse text-lg font-bold">
                  {selected || t.focusLab.widgets.dopamineMenu.spinning || 'Spinning...'}
                </p>
              </div>
            ) : (
              // Initial Simple State
              <div className="flex h-full flex-col justify-between">
                <div className="flex flex-1 flex-col items-center justify-center gap-2 pt-0 text-center">
                  <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mt-2 flex h-14 w-14 items-center justify-center rounded-full">
                    <SmileCircleIcon className="h-9 w-9" />
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex justify-center">
                    <button
                      onClick={handleSpin}
                      disabled={options.length === 0}
                      className="bg-primary-500 shadow-primary-500/30 hover:bg-primary-600 flex w-auto min-w-[140px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-base font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 dark:text-white dark:shadow-none"
                    >
                      {t.focusLab.widgets.dopamineMenu.spinButton || 'Get Dopamine'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
