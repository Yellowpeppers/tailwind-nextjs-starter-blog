'use client'

import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

import Image from 'next/image'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, useCallback, type ReactNode } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useTheme } from 'next-themes'
import { FocusStation } from '@/components/focus-lab/FocusStation'
import DataMigrationModal from '@/components/focus-lab/DataMigrationModal'
import { FocusGridLayout } from '@/components/focus-lab/FocusGridLayout'
import { CardShell } from '@/components/focus-lab/CardShell'
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
import { useThemeColor, ThemeColor, UIStyle } from '@/context/ThemeColorContext'
import { useCelebration } from '@/components/focus-lab/useCelebration'
import { debounce, uniq } from 'lodash'
import isEqual from 'lodash/isEqual'
import { Sidebar, SidebarBody, useSidebar } from '@/components/ui/sidebar'

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

const ArrowLaunchIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--arrow-right-up-outline] ${className}`} />
)

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--arrow-left-outline] ${className}`} />
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

const CrownIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--crown-bold] ${className}`} />
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

type GreetingInfo = {
  title: string
  subtitle: string
  iconClass: string
  emoji: string
}

const computeGreeting = (lang: string): GreetingInfo => {
  const hour = new Date().getHours()
  const isMorning = hour >= 5 && hour < 12
  const isAfternoon = hour >= 12 && hour < 17
  const isEvening = hour >= 17 && hour < 21

  if (isMorning) {
    return {
      title: lang === 'zh' ? '早上好' : 'Good Morning',
      subtitle: lang === 'zh' ? '开启今天的专注旅程吧' : "Let's start fresh today",
      iconClass: 'icon-[solar--sunrise-bold-duotone]',
      emoji: '☀️',
    }
  }
  if (isAfternoon) {
    return {
      title: lang === 'zh' ? '下午好' : 'Good Afternoon',
      subtitle: lang === 'zh' ? '保持节奏，继续推进' : 'Keep the momentum going',
      iconClass: 'icon-[solar--sun-2-bold-duotone]',
      emoji: '🌤️',
    }
  }
  if (isEvening) {
    return {
      title: lang === 'zh' ? '傍晚好' : 'Good Evening',
      subtitle: lang === 'zh' ? '收个尾，轻松结束今天' : 'Wrap up and wind down',
      iconClass: 'icon-[solar--sunset-bold-duotone]',
      emoji: '🌇',
    }
  }
  return {
    title: lang === 'zh' ? '晚安' : 'Good Night',
    subtitle: lang === 'zh' ? '好好休息，明天见' : 'Rest well and recharge',
    iconClass: 'icon-[solar--moon-stars-bold-duotone]',
    emoji: '🌙',
  }
}

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
  // 第一行：白噪音（3x3）、多巴胺（3x3）、任务拆解（4x5）、右侧 Attention Hub（6x9）
  { id: 'sonic', x: 0, y: 0, w: 3, h: 3, minW: 3, minH: 3 },
  { id: 'dopamine', x: 3, y: 0, w: 3, h: 3, minW: 3, minH: 3 },
  { id: 'breaker', x: 6, y: 0, w: 4, h: 5, minW: 3, minH: 5 },
  { id: 'brain', x: 10, y: 0, w: 6, h: 9, minW: 3, minH: 3 },

  // 第二行：Today’s Tasks（6x6）、Focus Timer（4x4）
  { id: 'todo', x: 0, y: 3, w: 6, h: 6, minW: 3, minH: 3 },
  { id: 'timer', x: 6, y: 5, w: 4, h: 4, minW: 3, minH: 3 },
]

const TRIPLE_LAYOUT: GridItem[] = [
  { id: 'sonic', x: 0, y: 0, w: 3, h: 3, minW: 3, minH: 3 },
  { id: 'dopamine', x: 3, y: 0, w: 3, h: 3, minW: 3, minH: 3 },
  { id: 'breaker', x: 6, y: 0, w: 3, h: 5, minW: 3, minH: 5 },
  { id: 'brain', x: 9, y: 0, w: 3, h: 9, minW: 3, minH: 3 },
  { id: 'todo', x: 0, y: 3, w: 6, h: 6, minW: 3, minH: 3 },
  { id: 'timer', x: 6, y: 5, w: 3, h: 4, minW: 3, minH: 3 },
]

const DOUBLE_LAYOUT: GridItem[] = [
  { id: 'sonic', x: 0, y: 0, w: 4, h: 3, minW: 3, minH: 3 },
  { id: 'dopamine', x: 4, y: 0, w: 4, h: 3, minW: 3, minH: 3 },
  { id: 'breaker', x: 0, y: 3, w: 4, h: 5, minW: 3, minH: 5 },
  { id: 'brain', x: 4, y: 3, w: 4, h: 9, minW: 3, minH: 3 },
  { id: 'todo', x: 0, y: 8, w: 4, h: 6, minW: 3, minH: 3 },
  { id: 'timer', x: 4, y: 12, w: 4, h: 4, minW: 3, minH: 3 },
]

type LayoutPreset = 'desktop' | 'triple' | 'double'

const GRID_PRESETS: Record<LayoutPreset, { columns: number; layout: GridItem[] }> = {
  desktop: { columns: 16, layout: INITIAL_LAYOUT },
  triple: { columns: 12, layout: TRIPLE_LAYOUT },
  double: { columns: 8, layout: DOUBLE_LAYOUT },
}
const LAYOUT_VERSION = 'focuslab-layout-v10'

const mergeLayoutWithDefaults = (preset: LayoutPreset, incoming: GridItem[] | null | undefined) => {
  const defaults = GRID_PRESETS[preset].layout
  const map = new Map<string, GridItem>()
  defaults.forEach((d) => map.set(d.id, { ...d }))
  if (Array.isArray(incoming)) {
    incoming.forEach((item) => {
      if (!item || !item.id) return
      const target = map.get(item.id)
      if (!target) return
      const defMinW = target.minW
      const defMinH = target.minH
      map.set(item.id, {
        ...target,
        x: Number.isFinite(item.x) ? item.x : target.x,
        y: Number.isFinite(item.y) ? item.y : target.y,
        w: Number.isFinite(item.w) ? item.w : target.w,
        h: Number.isFinite(item.h) ? item.h : target.h,
        // 统一使用最新默认最小值，避免旧缓存把 minH/minW 锁大
        minW: defMinW ?? item.minW ?? target.minW,
        minH: defMinH ?? item.minH ?? target.minH,
      })
    })
  }
  return Array.from(map.values())
}

const isCollapsedLayout = (items: GridItem[] | null | undefined) => {
  if (!Array.isArray(items) || items.length === 0) return true
  return items.every((i) => (i?.x ?? 0) === 0 && (i?.y ?? 0) === 0)
}

const isLayoutValid = (preset: LayoutPreset, items: GridItem[] | null | undefined) => {
  if (!Array.isArray(items)) return false
  const defaults = GRID_PRESETS[preset].layout
  const maxCols = GRID_PRESETS[preset].columns
  const maxY = 40 // 防止异常极大位移导致回到原点或全部重叠
  if (items.length !== defaults.length) return false

  const allowedIds = new Set(defaults.map((d) => d.id))
  return items.every((item) => {
    if (!item || !allowedIds.has(item.id)) return false
    const { x, y, w, h } = item
    if (![x, y, w, h].every(Number.isFinite)) return false
    if (x < 0 || y < 0 || w <= 0 || h <= 0) return false
    if (x + w > maxCols) return false
    if (y > maxY) return false
    return true
  })
}

const cloneLayout = (items: GridItem[]) => items.map((item) => ({ ...item }))

const getLayoutStorageKey = (preset: LayoutPreset) => `focus-lab-layout-${preset}-v1`
const SIDEBAR_BTN_BASE =
  'group flex w-full min-h-[44px] items-center gap-3 rounded-2xl px-3 py-2.5 text-base font-semibold text-gray-700 transition-all hover:bg-white/90 hover:shadow-sm dark:text-gray-200 dark:hover:bg-white/5'

type FocusedTaskState = { text: string; timestamp: number; id: string } | null

const SidebarLabel = ({
  show,
  children,
  delay = 0,
}: {
  show: boolean
  children: ReactNode
  delay?: number
}) => (
  <AnimatePresence initial={false}>
    {show ? (
      <motion.span
        key="sidebar-label"
        initial={{ opacity: 0, x: -6, width: 0 }}
        animate={{ opacity: 1, x: 0, width: 'auto' }}
        exit={{ opacity: 0, x: -6, width: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut', delay }}
        className="inline-flex min-w-0 flex-1 items-center overflow-hidden whitespace-nowrap"
      >
        {children}
      </motion.span>
    ) : null}
  </AnimatePresence>
)

const FocusSidebarAction = ({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) => {
  const { open, animate } = useSidebar()
  return (
    <button
      onClick={onClick}
      className="group/sidebar flex w-full items-center justify-start gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-white/80 dark:hover:bg-white/10"
    >
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-gray-600 transition-colors group-hover:text-gray-900 dark:text-gray-300">
        {icon}
      </span>
      <motion.span
        animate={{
          display: animate ? (open ? 'inline-block' : 'none') : 'inline-block',
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="inline-block text-sm whitespace-pre text-gray-800 transition duration-150 group-hover/sidebar:translate-x-1 dark:text-gray-100"
      >
        {label}
      </motion.span>
    </button>
  )
}

const FocusSidebarBrand = () => {
  const { open, animate } = useSidebar()
  return (
    <div className="group/sidebar flex h-12 items-center justify-start gap-3 rounded-xl px-3 py-1">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white shadow-sm dark:bg-white dark:text-gray-900">
        <span className="icon-[solar--layers-minimalistic-bold] text-lg" />
      </div>
      <motion.div
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
          display: animate ? (open ? 'flex' : 'none') : 'flex',
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="min-w-0 flex-col"
      >
        <span className="font-limelight truncate text-lg leading-tight font-bold text-gray-900 dark:text-gray-100">
          Focus Lab
        </span>
        <span className="text-xs font-medium text-gray-400">Dashboard</span>
      </motion.div>
    </div>
  )
}

const FocusSidebarProfile = ({
  userName,
  planLabel,
  avatarUrl,
  avatarColor,
  isPro,
  onClick,
}: {
  userName: string
  planLabel: string
  avatarUrl?: string
  avatarColor?: string
  isPro?: boolean
  onClick?: () => void
}) => {
  const { open, animate } = useSidebar()
  const initial = (userName.trim().charAt(0) || 'G').toUpperCase()
  return (
    <div className="border-t border-white/70 pt-3 pb-6 dark:border-white/10">
      <button
        type="button"
        onClick={onClick}
        className="group/sidebar flex h-12 w-full items-center justify-start gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/80 dark:hover:bg-white/10"
      >
        <div className="relative">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white shadow-inner ring-1 ring-black/5 dark:ring-white/10 ${
              avatarUrl
                ? 'bg-transparent'
                : avatarColor === 'pink'
                  ? 'bg-gradient-to-tr from-pink-500 to-rose-500'
                  : avatarColor === 'emerald'
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-tr from-indigo-500 to-purple-500'
            }`}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="User"
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <span className="leading-none">{initial}</span>
            )}
          </div>
          {isPro ? (
            <span className="absolute -right-1 -bottom-1 flex h-4 items-center gap-1 rounded-full bg-amber-400 px-1 text-[10px] font-extrabold text-amber-950 uppercase shadow ring-1 ring-amber-500/60">
              <span className="icon-[solar--crown-bold] text-[11px]" aria-hidden="true" />
              PRO
            </span>
          ) : null}
        </div>
        <motion.div
          animate={{
            opacity: animate ? (open ? 1 : 0) : 1,
            display: animate ? (open ? 'flex' : 'none') : 'flex',
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="min-w-0 flex-col text-left"
        >
          <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
            {userName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{planLabel}</span>
        </motion.div>
      </button>
    </div>
  )
}

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
const GRID_WIDTH_DESKTOP = 16 * ROW_HEIGHT + (16 - 1) * GAP
const CONTROL_BUTTON_BASE =
  'relative flex h-12 px-5 min-w-[150px] items-center justify-center rounded-full border text-sm font-semibold transition-all text-center'

const normalizeLayout = (
  preset: LayoutPreset,
  layout: GridItem[] | null | undefined,
  options: { fillMissing?: boolean } = {}
) => {
  const fillMissing = options.fillMissing ?? true
  const defaults = GRID_PRESETS[preset].layout
  const safeList = Array.isArray(layout) ? layout : []

  const byId = new Map<string, GridItem>()

  safeList.forEach((item) => {
    if (!item || !item.id) return
    const def = defaults.find((d) => d.id === item.id)
    const normalized: GridItem = {
      ...def,
      ...item,
      x: Number.isFinite(item.x) ? item.x : (def?.x ?? 0),
      y: Number.isFinite(item.y) ? item.y : (def?.y ?? 0),
      w: Number.isFinite(item.w) ? item.w : (def?.w ?? 2),
      h: Number.isFinite(item.h) ? item.h : (def?.h ?? 2),
      minW: item.minW ?? def?.minW ?? 1,
      minH: item.minH ?? def?.minH ?? 1,
    }
    byId.set(item.id, normalized)
  })

  if (fillMissing) {
    defaults.forEach((def) => {
      if (!byId.has(def.id)) {
        byId.set(def.id, { ...def })
      }
    })
  }

  return Array.from(byId.values())
}

const DEFAULT_LAYOUTS: Record<LayoutPreset, GridItem[]> = {
  desktop: cloneLayout(GRID_PRESETS.desktop.layout),
  triple: cloneLayout(GRID_PRESETS.triple.layout),
  double: cloneLayout(GRID_PRESETS.double.layout),
}
const EMPTY_HIDDEN: Record<LayoutPreset, Set<string>> = {
  desktop: new Set(),
  triple: new Set(),
  double: new Set(),
}

export const FocusLabApp = ({ onExit }: { onExit?: () => void }) => {
  const { theme, setTheme } = useTheme()
  const { themeColor, setThemeColor, uiStyle, setUiStyle } = useThemeColor()

  // Enforce Light Mode for Warm/Green Style
  useEffect(() => {
    if ((uiStyle === 'warm' || uiStyle === 'green') && theme !== 'light') {
      setTheme('light')
    }
  }, [uiStyle, theme, setTheme])
  const isFocusMode = false
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isTipOpen, setIsTipOpen] = useState(true)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showCustomizeMenu, setShowCustomizeMenu] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const customizeButtonRef = useRef<HTMLButtonElement | null>(null)
  const customizeMenuRef = useRef<HTMLDivElement | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [focusedTask, setFocusedTask] = useState<FocusedTaskState>(null)
  const [externalCommand, setExternalCommand] = useState<string | null>(null)
  const { t, language: lang } = useTranslation()
  const [greeting, setGreeting] = useState<GreetingInfo>(() => computeGreeting(lang))
  const [viewportWidth, setViewportWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [activePreset, setActivePreset] = useState<LayoutPreset>('desktop')
  const [layoutsByPreset, setLayoutsByPreset] =
    useState<Record<LayoutPreset, GridItem[]>>(DEFAULT_LAYOUTS)
  const [hiddenByPreset, setHiddenByPreset] =
    useState<Record<LayoutPreset, Set<string>>>(EMPTY_HIDDEN)
  const [layoutKey, setLayoutKey] = useState(0)

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authTrigger, setAuthTrigger] = useState<'generic' | 'stats'>('generic')
  const { user } = useAuth()
  const isPro = user?.user_metadata?.plan === 'pro'
  const upgradeLabel = isPro
    ? lang === 'zh'
      ? '会员权益'
      : 'Member Perks'
    : lang === 'zh'
      ? '升级会员'
      : 'Upgrade'

  const { settings, updateSettings, isLoaded: isSettingsLoaded } = useFocusSettingsContext()

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
  const hasHydratedLayout = useRef(false)
  const skipLayoutEvent = useRef(false)
  const lastResetTime = useRef(0) // 追踪最后一次重置的时间戳
  const pendingImmediateSave = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debouncePersistLayout = useMemo(
    () =>
      debounce((nextLayouts: Record<LayoutPreset, GridItem[]>) => {
        updateSettings('focus_lab.layout', {
          desktop: nextLayouts.desktop,
          triple: nextLayouts.triple,
          double: nextLayouts.double,
        })
        updateSettings('focus_lab.layout_version', LAYOUT_VERSION)
        updateSettings('focus_lab.layout_saved_at', Date.now())
      }, 300),
    [updateSettings]
  )

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

  useEffect(() => {
    setGreeting(computeGreeting(lang))
    const interval = setInterval(() => setGreeting(computeGreeting(lang)), 60000)
    return () => clearInterval(interval)
  }, [lang])

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
  const { burst: triggerCelebration, preload: preloadCelebration } = useCelebration()
  const formatHours = (value: number) => (Math.round(value * 10) / 10).toFixed(1)
  const renderGreetingText = (size: 'mobile' | 'desktop' = 'desktop') => (
    <div className={`flex items-center gap-2 ${size === 'desktop' ? 'px-1 pb-3' : 'px-1 pb-2'}`}>
      <h1
        className={`${size === 'desktop' ? 'text-2xl' : 'text-xl'} font-extrabold text-gray-900 dark:text-white`}
      >
        {greeting.title}!
      </h1>
      <span className={`${size === 'desktop' ? 'text-2xl' : 'text-xl'}`} aria-hidden="true">
        {greeting.emoji}
      </span>
    </div>
  )

  useEffect(() => {
    if (rewardUnlocked) {
      triggerCelebration({ variant: 'fireworks', spread: 110, particleCount: 140 })
    }
  }, [rewardUnlocked, triggerCelebration])

  // 统计功能仅对登录用户开放
  const handleOpenStats = useCallback(() => {
    if (!user) {
      setAuthTrigger('stats')
      setShowAuthModal(true)
      return
    }
    setShowAnalytics(true)
  }, [user])

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
      preloadCelebration()
    }
  }, [showGoalModal, dailyGoalHours, dailyTaskGoal, user, preloadCelebration])

  const handleGoalModalSave = () => {
    const hoursVal = Math.max(0.5, parseFloat(tempGoalHours) || dailyGoalHours)
    const tasksVal = Math.max(0, Math.round(parseFloat(tempTaskGoal) || dailyTaskGoal))
    setDailyGoalHours(hoursVal)
    setDailyTaskGoal(tasksVal)
    setShowGoalModal(false)
    if (
      (hoursVal > 0 && currentProgressHours >= hoursVal) ||
      (tasksVal > 0 && tasksCompletedToday >= tasksVal)
    ) {
      triggerCelebration({ variant: 'fireworks', spread: 110, particleCount: 140 })
    }
  }

  const handlePreviewCelebration = () => {
    triggerCelebration({ variant: 'fireworks', spread: 120, particleCount: 160, startVelocity: 42 })
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
      const width = window.innerWidth
      setViewportWidth(width)
      const nextIsMobile = width < 540
      setIsMobile(nextIsMobile)
      setActivePreset('desktop')
      if (width < 900) {
        setIsSidebarOpen(false)
      }
    }

    updateDimensions()

    window.addEventListener('resize', updateDimensions)

    return () => {
      window.removeEventListener('resize', updateDimensions)
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

  useEffect(() => {
    if (!showSettingsModal) {
      setShowCustomizeMenu(false)
    }
  }, [showSettingsModal])

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

  useEffect(() => {
    // 布局设置同步：从 settings 加载各断点布局，未保存或损坏/版本不匹配时回退默认并写回
    if (!isSettingsLoaded || !settings || !settings.focus_lab || hasHydratedLayout.current === true)
      return

    const defaults: Record<LayoutPreset, GridItem[]> = {
      desktop: cloneLayout(GRID_PRESETS.desktop.layout),
      triple: cloneLayout(GRID_PRESETS.triple.layout),
      double: cloneLayout(GRID_PRESETS.double.layout),
    }

    const emptyHidden: Record<LayoutPreset, Set<string>> = {
      desktop: new Set(),
      triple: new Set(),
      double: new Set(),
    }

    const storedVersion = settings.focus_lab.layout_version
    const forceDefaults = storedVersion !== LAYOUT_VERSION

    const nextLayouts: Record<LayoutPreset, GridItem[]> = { ...defaults }
    let shouldPersistLayout = false

    ;(['desktop', 'triple', 'double'] as LayoutPreset[]).forEach((preset) => {
      const saved = settings.focus_lab?.layout?.[preset]
      const collapsed = isCollapsedLayout(saved)
      const invalid = !isLayoutValid(preset, saved)
      if (forceDefaults || collapsed || invalid) {
        nextLayouts[preset] = defaults[preset]
        shouldPersistLayout = true
      } else {
        nextLayouts[preset] = mergeLayoutWithDefaults(preset, saved)
      }
    })

    setLayoutsByPreset(nextLayouts)

    const nextHidden: Record<LayoutPreset, Set<string>> = { ...emptyHidden }
    ;(['desktop', 'triple', 'double'] as LayoutPreset[]).forEach((preset) => {
      const hiddenArr = settings.focus_lab?.hidden_cards?.[preset]
      if (Array.isArray(hiddenArr)) {
        nextHidden[preset] = new Set(hiddenArr.filter(Boolean))
      }
    })
    setHiddenByPreset(nextHidden)

    if (shouldPersistLayout || forceDefaults) {
      updateSettings('focus_lab.layout', {
        desktop: nextLayouts.desktop,
        triple: nextLayouts.triple,
        double: nextLayouts.double,
      })
      updateSettings('focus_lab.hidden_cards', {
        desktop: [],
        triple: [],
        double: [],
      })
      updateSettings('focus_lab.layout_version', LAYOUT_VERSION)
      updateSettings('focus_lab.layout_saved_at', Date.now())
    }

    hasHydratedLayout.current = true
  }, [isSettingsLoaded, settings, updateSettings])

  useEffect(() => {
    if (!hasHydratedLayout.current) return
    debouncePersistLayout(layoutsByPreset)
    return () => {
      debouncePersistLayout.cancel()
    }
  }, [layoutsByPreset, debouncePersistLayout])

  // 持久化隐藏卡片状态（避免在 render 阶段直接调用 updateSettings）
  useEffect(() => {
    if (!hasHydratedLayout.current) return
    const toArray = (set: Set<string>) => Array.from(set || [])
    updateSettings('focus_lab.hidden_cards', {
      desktop: toArray(hiddenByPreset.desktop),
      triple: toArray(hiddenByPreset.triple),
      double: toArray(hiddenByPreset.double),
    })
    updateSettings('focus_lab.layout_saved_at', Date.now())
  }, [hiddenByPreset, updateSettings])

  const handleLayoutChange = useCallback(
    (preset: LayoutPreset, newLayout: GridItem[]) => {
      // 在重置后 500ms 内忽略所有布局变化回调，防止 RGL 的初始化回调覆盖默认布局
      const timeSinceReset = Date.now() - lastResetTime.current
      if (timeSinceReset < 500) {
        return
      }
      if (skipLayoutEvent.current) {
        skipLayoutEvent.current = false
        return
      }
      // 取消之前的持久化，避免旧布局在重置后覆盖新值
      debouncePersistLayout.cancel()
      setLayoutsByPreset((prev) => {
        const merged = mergeLayoutWithDefaults(preset, newLayout)
        const next = { ...prev, [preset]: merged }
        if (hasHydratedLayout.current) {
          // 统一通过节流函数持久化，避免在 render 阶段触发 setState 警告
          debouncePersistLayout(next)
          // 同步写一份立即保存，避免用户快速刷新导致丢失（异步执行规避 render 警告）
          if (pendingImmediateSave.current) clearTimeout(pendingImmediateSave.current)
          pendingImmediateSave.current = setTimeout(() => {
            updateSettings('focus_lab.layout', next)
            updateSettings('focus_lab.layout_version', LAYOUT_VERSION)
            updateSettings('focus_lab.layout_saved_at', Date.now())
            pendingImmediateSave.current = null
          }, 0)
        }
        return next
      })
    },
    [debouncePersistLayout, updateSettings]
  )

  const handleRemoveItem = useCallback((preset: LayoutPreset, id: string) => {
    setLayoutsByPreset((prev) => {
      const nextLayout = prev[preset]?.filter((item) => item.id !== id) || []
      const next = { ...prev, [preset]: nextLayout }
      return next
    })
  }, [])

  const handleResetLayout = useCallback(() => {
    // 先取消未决的保存，避免旧布局反写
    debouncePersistLayout.cancel()
    if (pendingImmediateSave.current) {
      clearTimeout(pendingImmediateSave.current)
      pendingImmediateSave.current = null
    }
    skipLayoutEvent.current = true
    const nextLayouts: Record<LayoutPreset, GridItem[]> = {
      desktop: cloneLayout(GRID_PRESETS.desktop.layout),
      triple: cloneLayout(GRID_PRESETS.triple.layout),
      double: cloneLayout(GRID_PRESETS.double.layout),
    }
    setLayoutsByPreset(nextLayouts)
    const nextHidden: Record<LayoutPreset, Set<string>> = {
      desktop: new Set(),
      triple: new Set(),
      double: new Set(),
    }
    setHiddenByPreset(nextHidden)
    // 记录重置时间，防止 RGL 的回调覆盖默认布局
    lastResetTime.current = Date.now()
    // 增加 layoutKey 强制 ResponsiveGridLayout 重新挂载，使其采用新布局
    setLayoutKey((k) => k + 1)
    // 立即持久化新的默认布局，确保刷新后也是最新
    updateSettings('focus_lab.layout', nextLayouts)
    updateSettings('focus_lab.hidden_cards', {
      desktop: [],
      triple: [],
      double: [],
    })
    updateSettings('focus_lab.layout_version', LAYOUT_VERSION)
    updateSettings('focus_lab.layout_saved_at', Date.now())
  }, [debouncePersistLayout, updateSettings])

  const handleToggleHidden = (preset: LayoutPreset, id: string) => {
    setHiddenByPreset((prev) => {
      const current = new Set(prev[preset] || [])
      if (current.has(id)) {
        current.delete(id)
      } else {
        current.add(id)
      }
      const next = { ...prev, [preset]: current }
      return next
    })
  }

  const activePresetConfig = GRID_PRESETS[activePreset]
  const backgroundColumnWidth = Math.max(
    40,
    viewportWidth > 0
      ? (viewportWidth - (activePresetConfig.columns - 1) * GAP) / activePresetConfig.columns
      : COL_WIDTH
  )

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
                          {formatHours(currentProgressHours)}h / {formatHours(dailyGoalHours)}h
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

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  onClick={handlePreviewCelebration}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-amber-500 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:text-amber-300 dark:hover:bg-amber-500/10"
                >
                  预览烟花
                </button>
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
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Settings Header */}
              <h2 className="mb-4 text-xl font-bold dark:text-white">
                {t.focusLab.settings?.title || 'Settings'}
              </h2>

              <div className="space-y-4">
                {/* Dark Mode */}
                <div
                  className={`flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800 ${uiStyle === 'warm' || uiStyle === 'green' ? 'opacity-50' : ''}`}
                >
                  <span className="font-medium dark:text-gray-200">
                    {t.focusLab.settings?.darkMode || 'Dark Mode'}
                  </span>
                  <button
                    disabled={uiStyle === 'warm' || uiStyle === 'green'}
                    onClick={() => {
                      if (uiStyle !== 'warm' && uiStyle !== 'green') {
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                      }
                    }}
                    className={`rounded-md bg-gray-200 px-3 py-1.5 text-sm transition-colors dark:bg-gray-700 ${uiStyle === 'warm' || uiStyle === 'green' ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {uiStyle === 'warm' || uiStyle === 'green'
                      ? 'Light Only'
                      : theme === 'dark'
                        ? t.focusLab.settings?.on || 'On'
                        : t.focusLab.settings?.off || 'Off'}
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

                {/* Layout Customization */}
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium dark:text-gray-200">
                        {t.focusLab.controls.customizeLayout || 'Customize Layout'}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t.focusLab.controls.widgetVisibility || 'Show/Hide Cards'}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setShowCustomizeMenu(!showCustomizeMenu)
                        }}
                        ref={customizeButtonRef}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold shadow-sm transition-all active:scale-95 ${
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
                                const hiddenSet = hiddenByPreset[activePreset] || new Set()
                                const isActive = !hiddenSet.has(defaultItem.id)

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
                                      handleToggleHidden(activePreset, defaultItem.id)
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
                    </div>
                  </div>
                </div>

                {/* Visual Style */}
                <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="mb-3 block font-medium dark:text-gray-200">Visual Style</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setUiStyle('modern')
                        updateSettings('theme.style', 'modern')
                      }}
                      className={cn(
                        'flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        uiStyle === 'modern'
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      Modern
                    </button>
                    <button
                      onClick={() => {
                        setUiStyle('warm')
                        updateSettings('theme.style', 'warm')
                      }}
                      className={cn(
                        'flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        uiStyle === 'warm'
                          ? 'border-amber-500 bg-[#FDFBF7] text-[#8C502B]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      Warm
                    </button>
                    <button
                      onClick={() => {
                        setUiStyle('green')
                        updateSettings('theme.style', 'green')
                      }}
                      className={cn(
                        'flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        uiStyle === 'green'
                          ? 'border-[#7A9F7A] bg-[#F8F9F7] text-[#7A9F7A]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      Green
                    </button>
                  </div>
                </div>

                {/* Theme Color (Only visible in Modern style) */}
                <AnimatePresence>
                  {uiStyle === 'modern' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
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

      <div
        className={cn(
          'fixed inset-0 z-[100] flex h-full w-full overflow-hidden transition-all duration-500',
          uiStyle === 'warm'
            ? 'bg-[#FDFBF7] text-gray-900'
            : uiStyle === 'green'
              ? 'bg-[#F8F9F7] text-gray-900'
              : 'bg-gray-50 dark:bg-gray-950'
        )}
      >
        {/* Sidebar - Visible only in Desktop */}
        {!isMobile && viewportWidth >= 540 && (
          <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} animate>
            <SidebarBody
              showMobile={false}
              className="h-full flex-col justify-between gap-10 px-2 py-4"
            >
              <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                <FocusSidebarBrand />

                <div className="mt-8 flex flex-col gap-2 px-1">
                  <FocusSidebarAction
                    icon={<StarIcon className="h-6 w-6" />}
                    label={t.focusLab.sidebar.dailyGoal || 'Daily Goal'}
                    onClick={() => setShowGoalModal(true)}
                  />
                  <FocusSidebarAction
                    icon={<StatsIcon className="h-6 w-6" />}
                    label={lang === 'zh' ? '统计数据' : 'Stats'}
                    onClick={handleOpenStats}
                  />
                  <FocusSidebarAction
                    icon={<SettingsIcon className="h-6 w-6" />}
                    label={lang === 'zh' ? '设置' : 'Settings'}
                    onClick={() => setShowSettingsModal(true)}
                  />
                  <div className="my-1 h-2" aria-hidden />
                  <FocusSidebarAction
                    icon={<CrownIcon className="h-6 w-6 text-amber-500" />}
                    label={upgradeLabel}
                    onClick={() => setShowPricingModal(true)}
                  />
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-2 px-1">
                <FocusSidebarAction
                  icon={<LogoutIcon className="h-6 w-6" />}
                  label={t.focusLab.controls.exitFocus || 'Exit Focus'}
                  onClick={onExit}
                />
                <FocusSidebarProfile
                  userName={user ? user.user_metadata?.full_name || 'Guest Space' : 'Guest Space'}
                  planLabel={isPro ? t.focusLab.sidebar.proMember : t.focusLab.sidebar.freePlan}
                  avatarUrl={user?.user_metadata?.avatar_url}
                  avatarColor={user?.user_metadata?.avatar_color}
                  isPro={isPro}
                  onClick={() => setShowAuthModal(true)}
                />
              </div>
            </SidebarBody>
          </Sidebar>
        )}

        {/* Main Content Area */}
        <main className="relative flex h-full flex-1 flex-col overflow-x-auto overflow-y-hidden">
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
            <div className="flex h-full w-full flex-col">
              {/* Mobile Header (Simplified) */}
              {isMobile && (
                <div
                  className={cn(
                    'z-20 flex flex-none items-center justify-between border-b p-4',
                    uiStyle === 'warm'
                      ? 'border-[#ECE8E0] bg-white'
                      : uiStyle === 'green'
                        ? 'border-[#CCFBF1] bg-white'
                        : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
                  )}
                >
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
              <div
                className={`show-scrollbar flex-1 overflow-y-auto ${!isMobile ? 'px-4 py-4' : 'px-2 pb-20'}`}
              >
                {isMobile ? (
                  <div className="flex flex-col gap-3">
                    {renderGreetingText('mobile')}
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
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className="mx-auto"
                      style={{ width: GRID_WIDTH_DESKTOP, minWidth: GRID_WIDTH_DESKTOP }}
                    >
                      {renderGreetingText('desktop')}
                    </div>
                    <FocusGridLayout
                      activePreset={activePreset}
                      forcePreset="desktop"
                      containerPadding={[0, 0]}
                      layouts={{
                        desktop: layoutsByPreset.desktop.filter(
                          (i) => !(hiddenByPreset.desktop || new Set()).has(i.id)
                        ),
                        triple: layoutsByPreset.triple.filter(
                          (i) => !(hiddenByPreset.triple || new Set()).has(i.id)
                        ),
                        double: layoutsByPreset.double.filter(
                          (i) => !(hiddenByPreset.double || new Set()).has(i.id)
                        ),
                      }}
                      onLayoutChange={handleLayoutChange}
                      onRemoveItem={handleRemoveItem}
                      isFocusMode={false}
                      focusedCardIds={new Set()}
                      layoutKey={layoutKey}
                      renderItem={({ item, isFocused }) => {
                        if (item.id === 'sonic') {
                          return <SonicShieldCard className="h-full w-full" isFocused={isFocused} />
                        }
                        if (item.id === 'timer') {
                          return (
                            <TimerCard
                              className="h-full w-full"
                              isFocused={isFocused}
                              focusedTask={focusedTask}
                              externalCommand={externalCommand}
                              onCommandHandled={() => setExternalCommand(null)}
                              onSessionLogged={handleSessionLogged}
                              onTimerComplete={refreshTodayProgress}
                            />
                          )
                        }
                        if (item.id === 'brain') {
                          return <BrainDumpCard className="h-full w-full" isFocused={isFocused} />
                        }
                        if (item.id === 'todo') {
                          return (
                            <ToDoCard
                              className="h-full w-full"
                              cols={item.w}
                              isFocused={isFocused}
                              onStartFocus={(task, id) => {
                                if (focusedTask?.id === id) {
                                  setFocusedTask(null)
                                } else {
                                  setFocusedTask({ text: task, id, timestamp: Date.now() })
                                }
                              }}
                              focusedTaskId={focusedTask?.id}
                            />
                          )
                        }
                        if (item.id === 'breaker') {
                          return <TaskBreakerCard className="h-full w-full" isFocused={isFocused} />
                        }
                        if (item.id === 'dopamine') {
                          return (
                            <DopamineMenuCard
                              className="h-full w-full"
                              cols={item.w}
                              isFocused={isFocused}
                            />
                          )
                        }
                        return null
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* End of Container */}
        </main>
        {/* End of Main Area */}
      </div>
      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
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
                    handleResetLayout()
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

const SonicShieldCard = ({
  onDelete,
  className,
  isFocused,
}: {
  onDelete?: () => void
  className?: string
  isFocused?: boolean
}) => {
  const { t } = useTranslation()
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <CardShell
      title={t.focusLab.widgets.sonicShield.title}
      onDelete={onDelete}
      className={className}
      isFocused={isFocused}
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
    </CardShell>
  )
}

const TimerCard = ({
  onDelete,
  className,
  focusedTask,
  externalCommand,
  onCommandHandled,
  onSessionLogged,
  onTimerComplete,
  isFocused,
}: {
  onDelete?: () => void
  className?: string
  focusedTask?: FocusedTaskState
  externalCommand?: string | null
  onCommandHandled?: () => void
  onSessionLogged?: (minutes: number) => void
  onTimerComplete?: (minutes: number) => void
  isFocused?: boolean
}) => {
  const { t } = useTranslation()
  const [isFlipped, setIsFlipped] = useState(false)
  const [showTaskTitle, setShowTaskTitle] = useState(true)
  const { uiStyle } = useThemeColor()

  useEffect(() => {
    if (focusedTask) {
      setShowTaskTitle(true)
    }
  }, [focusedTask])

  return (
    <CardShell
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
      onDelete={onDelete}
      isFocused={isFocused}
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
        uiStyle={uiStyle}
      />
    </CardShell>
  )
}

const TaskBreakerCard = ({
  onDelete,
  className,
  isFocused,
}: {
  onDelete?: () => void
  className?: string
  isFocused?: boolean
}) => {
  const { t } = useTranslation()
  const { uiStyle } = useThemeColor()
  return (
    <CardShell
      title={t.focusLab.widgets.taskBreaker.title}
      onDelete={onDelete}
      className={className}
      isFocused={isFocused}
      variant="ai-assistant"
    >
      <TaskBreakerWidget uiStyle={uiStyle} />
    </CardShell>
  )
}

const BrainDumpCard = ({
  onDelete,
  className,
  isFocused,
}: {
  onDelete?: () => void
  className?: string
  isFocused?: boolean
}) => {
  const { t } = useTranslation()
  const { uiStyle } = useThemeColor()
  return (
    <CardShell
      title={t.focusLab.widgets.brainDump.title}
      onDelete={onDelete}
      className={className}
      isFocused={isFocused}
    >
      <BrainDumpWidget uiStyle={uiStyle} />
    </CardShell>
  )
}

const ToDoCard = ({
  cols,
  onDelete,
  className,
  onStartFocus,
  focusedTaskId,
  isFocused,
}: {
  cols?: number
  onDelete?: () => void
  className?: string
  onStartFocus?: (task: string, id: string) => void
  focusedTaskId?: string | null
  isFocused?: boolean
}) => {
  const { t } = useTranslation()
  const { uiStyle } = useThemeColor()
  return (
    <CardShell
      title={t.focusLab.widgets.todo.title}
      onDelete={onDelete}
      className={className}
      isFocused={isFocused}
    >
      <FocusStation
        cols={cols}
        onStartFocus={onStartFocus}
        focusedTaskId={focusedTaskId}
        uiStyle={uiStyle}
      />
    </CardShell>
  )
}

const DopamineMenuCard = ({
  cols,
  onDelete,
  className,
  isFocused,
}: {
  cols?: number
  onDelete?: () => void
  className?: string
  isFocused?: boolean
}) => {
  const { t } = useTranslation()
  const { uiStyle } = useThemeColor()
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <CardShell
      title={t.focusLab.widgets.dopamineMenu.title}
      onDelete={onDelete}
      className={className}
      isFocused={isFocused}
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
      <DopamineMenuWidget
        cols={cols}
        isFlipped={isFlipped}
        onFlip={setIsFlipped}
        uiStyle={uiStyle}
      />
    </CardShell>
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
  uiStyle,
}: {
  onTimerComplete?: (minutes: number) => void
  onSessionLogged?: (minutes: number) => void
  focusedTask?: FocusedTaskState
  externalCommand?: string | null
  onCommandHandled?: () => void
  isFlipped: boolean
  onFlip: (flipped: boolean) => void
  uiStyle?: UIStyle
}) => {
  const isWarm = uiStyle === 'warm'
  const isGreen = uiStyle === 'green'
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
  const prevModeRef = useRef<'countdown' | 'stopwatch'>('countdown')

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
  // 追踪模式切换，用于在运行中切换时妥善结算并重置
  useEffect(() => {
    if (prevModeRef.current === derivedMode) return
    const previousMode = prevModeRef.current
    prevModeRef.current = derivedMode

    const isFocusActive =
      timerState === 'focusing' ||
      timerState === 'paused-focusing' ||
      timerState === 'focus-completed'
    if (isFocusActive) {
      const elapsedSeconds =
        previousMode === 'countdown' ? Math.max(0, totalAllocatedDuration - timeLeft) : timeLeft
      finalizeSession({ elapsedSeconds, completed: false })
    }

    // 切换后从头开始
    hasLoggedRef.current = false
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedMode])

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
                    className={`${
                      isWarm
                        ? 'rounded-lg bg-[#C27B4A] text-white shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
                        : isGreen
                          ? 'h-10 flex-1 rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 focus:ring-primary-500 h-10 flex-1 rounded-xl text-white shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-2'
                    } flex w-auto min-w-[100px] items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-all active:scale-95`}
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
                    className={`${
                      isWarm
                        ? 'bg-primary-500 shadow-primary-500/30 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500 rounded-lg text-white'
                        : isGreen
                          ? 'h-10 flex-1 rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 focus:ring-primary-500 h-10 flex-1 rounded-xl text-white shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-2'
                    } flex w-auto min-w-[100px] items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-all active:scale-95`}
                  >
                    <PauseIcon className="h-4 w-4" />
                    {t.focusLab.widgets.timer.pause}
                  </button>
                </div>
              )}

              {(isPaused || isCompleted) && (
                <div className="flex gap-3">
                  <button
                    onClick={endSession}
                    className={`flex-1 px-6 py-2 text-sm font-medium transition-colors ${
                      isWarm
                        ? 'rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:bg-gray-800 dark:hover:bg-gray-700'
                        : isGreen
                          ? 'h-10 rounded-xl bg-[#E2E8E2] text-[#7A9F7A] hover:bg-[#D1DAD1]'
                          : 'h-10 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                    }`}
                  >
                    {t.focusLab.widgets.timer.endSession || 'End'}
                  </button>
                  <button
                    onClick={() => {
                      playClickSound()
                      startTimer()
                    }}
                    className={`${
                      isWarm
                        ? 'rounded-lg bg-[#C27B4A] text-white shadow-lg shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
                        : isGreen
                          ? 'h-10 flex-[2] rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 focus:ring-primary-500 h-10 flex-[2] rounded-xl text-white shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-2'
                    } flex flex-[2] items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-all active:scale-95`}
                  >
                    {t.focusLab.widgets.timer.resume}
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
                    className={`${
                      isWarm
                        ? 'rounded-lg bg-[#C27B4A] text-white shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
                        : isGreen
                          ? 'h-10 flex-1 rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 focus:ring-primary-500 h-10 flex-1 rounded-xl text-white shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-2'
                    } flex w-auto min-w-[100px] items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-all active:scale-95`}
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
                    className={`${
                      isWarm
                        ? 'bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500 rounded-lg' // Note: Warm pause used primary blue originally? Or C27B4A? Original trace showed primary for pause in one view, C27B4A for Start. Let's assume Play=C27B4A, Pause=Primary(Blue/Gray)? Actually Pause was Primary-500.
                        : isGreen
                          ? 'h-10 flex-1 rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 focus:ring-primary-500 h-10 flex-1 rounded-xl text-white shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-2'
                    } flex w-auto min-w-[100px] items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-all active:scale-95`}
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
                    className={`flex-1 px-6 py-2 text-sm font-medium transition-colors ${
                      isWarm
                        ? 'rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:bg-gray-800 dark:hover:bg-gray-700'
                        : isGreen
                          ? 'h-10 rounded-xl bg-[#E2E8E2] text-[#7A9F7A] hover:bg-[#D1DAD1]'
                          : 'h-10 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                    }`}
                  >
                    {t.focusLab.widgets.timer.endSession || 'End'}
                  </button>
                  <button
                    onClick={() => {
                      playClickSound()
                      startTimer()
                    }}
                    className={`${
                      isWarm
                        ? 'rounded-lg bg-[#C27B4A] text-white shadow-lg shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
                        : isGreen
                          ? 'h-10 flex-[2] rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 focus:ring-primary-500 h-10 flex-[2] rounded-xl text-white shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-2'
                    } flex flex-[2] items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-all active:scale-95`}
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
                    className={`w-full ${isWarm ? 'rounded-lg' : 'rounded-full'} bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-200 active:scale-95 sm:flex-1 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700`}
                  >
                    {t.focusLab.widgets.timer.endFocus || 'End Focus'}
                  </button>
                  <button
                    onClick={() => {
                      playClickSound()
                      continueNewSession()
                    }}
                    className={`${
                      isWarm
                        ? 'rounded-lg bg-[#C27B4A] shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
                        : isGreen
                          ? 'rounded-lg bg-[#7A9F7A] shadow-[#7A9F7A]/30 hover:bg-[#688868]'
                          : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/25 rounded-full'
                    } w-full px-4 py-2 text-sm font-extrabold text-white shadow-lg transition-all active:scale-95 sm:flex-1`}
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

const TaskBreakerWidget = ({ uiStyle }: { uiStyle?: UIStyle }) => {
  const isWarm = uiStyle === 'warm'
  const isGreen = uiStyle === 'green'
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
            <div
              className={`flex h-full flex-col items-center justify-center gap-3 ${isWarm || isGreen ? 'text-white/70' : 'text-gray-400'}`}
            >
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
          <div
            className={`${isWarm ? 'bg-white/10 text-[#C27B4A]' : isGreen ? 'bg-[#F8F9F7] text-[#7A9F7A]' : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'} flex h-12 w-12 items-center justify-center rounded-2xl`}
          >
            <MagicIcon className="h-6 w-6" />
          </div>

          <h3
            className={`text-lg font-bold ${isWarm || isGreen ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}
          >
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
            className={`${
              isWarm || isGreen
                ? 'focus:ring-accent border-white/10 bg-white/10 text-white placeholder:text-white/50'
                : 'focus:border-primary-500 focus:ring-primary-500 border-gray-100 bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:bg-gray-800'
            } no-scrollbar mt-1 h-24 w-full resize-none rounded-2xl border px-4 py-3 text-sm focus:ring-2 focus:outline-none`}
          />
        </div>
      </div>

      <div className="mt-auto flex justify-center pt-2 pb-0">
        <button
          type="button"
          onClick={handleBreakDown}
          disabled={!task.trim()}
          className={`flex w-auto min-w-[100px] items-center justify-center gap-2 px-4 py-2 text-sm font-bold shadow-lg transition-all active:scale-95 disabled:active:scale-100 dark:shadow-none ${
            isWarm
              ? 'rounded-lg bg-[#C27B4A] text-white shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
              : isGreen
                ? 'rounded-lg bg-[#7A9F7A] text-white shadow-[#7A9F7A]/30 hover:bg-[#688868]'
                : 'bg-primary-500 shadow-primary-500/30 hover:bg-primary-600 rounded-full text-white dark:text-white'
          }`}
        >
          {t.focusLab.widgets.taskBreaker.button}
        </button>
      </div>
    </div>
  )
}

const TaskStepItem = ({ step }: { step: string }) => {
  const [isChecked, setIsChecked] = useState(false)
  const { uiStyle } = useThemeColor()
  const isCustomAi = uiStyle === 'warm' || uiStyle === 'green'

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => setIsChecked(!isChecked)}
      className={`group flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors ${
        isCustomAi
          ? 'hover:bg-white/10 dark:hover:bg-white/10'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => {}} // Handled by parent onClick
        className={`pointer-events-none h-5 w-5 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 ${
          isCustomAi ? 'text-white focus:ring-white' : 'text-primary-500 focus:ring-primary-500'
        }`}
      />
      <span
        className={`text-sm transition-all ${
          isChecked
            ? isCustomAi
              ? 'text-white/50 line-through'
              : 'text-gray-400 line-through dark:text-gray-500'
            : isCustomAi
              ? 'text-white group-hover:text-white'
              : 'text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100'
        } `}
      >
        {step}
      </span>
    </motion.li>
  )
}

const BrainDumpWidget = ({ uiStyle }: { uiStyle?: UIStyle }) => {
  const isWarm = uiStyle === 'warm'
  const isGreen = uiStyle === 'green'
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

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()
        const blob = item.getAsFile()
        if (blob && user) {
          try {
            // Show some loading state? For now, we just wait.
            // Or set a temp placeholder?
            // Let's just upload.
            const supabase = createClient()
            const fileExt = blob.type.split('/')[1] || 'png'
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

            const { error: uploadError } = await supabase.storage
              .from('brain-dump')
              .upload(fileName, blob, { upsert: true, contentType: blob.type })

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('brain-dump').getPublicUrl(fileName)
            if (data.publicUrl) {
              setPendingImage(data.publicUrl)
            }
          } catch (error) {
            console.error('Paste upload failed:', error)
            alert('Failed to upload image. Please try again.')
          }
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
    <div className="flex h-full flex-col gap-3">
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
              className={`focus:border-primary-500 focus:ring-primary-500 w-full rounded-xl border py-2 pr-12 pl-4 text-sm text-gray-900 placeholder:text-gray-500 focus:ring-1 focus:outline-none dark:text-gray-100 ${
                isWarm
                  ? 'border-[#ECE8E0] bg-[#F5F2EC] dark:border-gray-700 dark:bg-gray-800'
                  : isGreen
                    ? 'border-[#E2E8E2] bg-[#F8F9F7] dark:border-gray-700 dark:bg-gray-800'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
              }`}
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
            className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 disabled:hover:text-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 ${
              isWarm
                ? 'border border-[#ECE8E0] bg-[#F5F2EC] text-gray-600'
                : isGreen
                  ? 'border border-[#E2E8E2] bg-[#F8F9F7] text-[#7A9F7A]'
                  : 'bg-gray-100 text-gray-500 disabled:hover:bg-gray-100'
            }`}
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
      <div className="no-scrollbar flex-1 overflow-y-auto rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-2 pt-1.5 pb-2 dark:border-gray-700 dark:bg-gray-800/20 [&::-webkit-scrollbar]:hidden">
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
  uiStyle,
}: {
  cols?: number
  isFlipped: boolean
  onFlip: (v: boolean) => void
  uiStyle?: UIStyle
}) => {
  const isWarm = uiStyle === 'warm'
  const isGreen = uiStyle === 'green'
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
    <div className="relative flex h-full min-w-0 flex-col" style={{ containerType: 'inline-size' }}>
      <AnimatePresence mode="wait">
        {isFlipped ? (
          // BACK: Settings / Options List
          <motion.div
            key="back"
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -180 }}
            transition={{ duration: 0.3 }}
            className="flex h-full min-w-0 flex-col gap-2.5"
          >
            {/* Inner Header Removed as per request */}

            {/* Input */}
            <div className="flex flex-wrap items-stretch gap-2 @[420px]:flex-nowrap">
              <div className="relative min-w-0 flex-1">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addOption()}
                  placeholder={t.focusLab.widgets.dopamineMenu.addPlaceholder}
                  className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <button
                onClick={addOption}
                aria-label={t.focusLab.widgets.dopamineMenu.add}
                className="text-primary-600 hover:border-primary-400 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-900/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all active:scale-95 dark:border-gray-700 dark:bg-gray-900"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="sr-only">{t.focusLab.widgets.dopamineMenu.add}</span>
              </button>
            </div>

            {/* List */}
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto rounded-xl border border-dashed border-gray-200 p-2 dark:border-gray-700 [&::-webkit-scrollbar]:hidden">
              <div
                className={`grid gap-2 ${cols >= 3 ? 'grid-cols-1 @[420px]:grid-cols-2' : 'grid-cols-1'}`}
              >
                {options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="group hover:bg-primary-50 dark:hover:bg-primary-900/20 flex min-w-0 items-center justify-between rounded-lg bg-white p-2 text-sm shadow-sm transition-all dark:bg-gray-800 dark:text-gray-200"
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
                className={`${
                  isWarm
                    ? 'rounded-lg bg-[#C27B4A] shadow-[#C27B4A]/20 hover:bg-[#A6663E]'
                    : isGreen
                      ? 'rounded-lg bg-[#7A9F7A] shadow-[#7A9F7A]/20 hover:bg-[#688868]'
                      : 'bg-primary-500 hover:bg-primary-600 shadow-primary-200 rounded-full'
                } flex items-center gap-2 px-5 py-2 text-sm font-bold text-white shadow-lg transition-transform active:scale-95`}
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
                      className={`${
                        isWarm
                          ? 'rounded-lg bg-[#C27B4A] text-white shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
                          : isGreen
                            ? 'h-10 flex-1 rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                            : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 focus:ring-primary-500 h-10 flex-1 rounded-xl text-white shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-2'
                      } flex w-auto min-w-[100px] items-center justify-center gap-2 px-4 py-2 text-sm font-bold shadow-lg transition-all active:scale-95 disabled:active:scale-100 dark:shadow-none`}
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
