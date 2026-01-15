'use client'

import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// FormKit Drag and Drop
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { animations } from '@formkit/drag-and-drop'
import { useEffect, useMemo, useRef, useState, useCallback, memo, type ReactNode } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useTheme } from 'next-themes'
import { FocusStation, FocusTaskCard } from '@/components/focus-lab/FocusStation'
import DataMigrationModal from '@/components/focus-lab/DataMigrationModal'
import { FocusGridLayout } from '@/components/focus-lab/FocusGridLayout'
import { CardShell } from '@/components/focus-lab/CardShell'
import { EncouragementToast } from '@/components/focus-lab/EncouragementToast'
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
  getStreak,
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
import { useFocusTour } from '@/components/focus-lab/useFocusTour'
import dynamic from 'next/dynamic'
// Dynamic import for BuBu to reduce initial bundle size
const BuBu = dynamic(() => import('@/components/focus-lab/BuBu').then((mod) => mod.BuBu), {
  ssr: false,
})

import {
  SmileCircleIcon,
  MagicIcon,
  HandIcon,
  HandPalmIcon,
  PlayIcon,
  PauseIcon,
  ArrowLaunchIcon,
  ArrowLeftIcon,
  TrashIcon,
  PlusIcon,
  MoreHorizontalIcon,
  CloseIcon,
  XIcon,
  StatsIcon,
  CrownIcon,
  SettingsIcon,
  StarIcon,
  EditIcon,
  CheckIcon,
  TransferIcon,
  LogoutIcon,
  HelpIcon,
} from '@/components/focus-lab/icons'
import {
  GreetingInfo,
  SoundOption,
  ActiveTrack,
  GridItem,
  LayoutPreset,
  FocusedTaskState,
} from '@/components/focus-lab/types'
import {
  getSecondsUntilTarget,
  playClickSound,
  computeGreeting,
  mergeLayoutWithDefaults,
  isCollapsedLayout,
  isLayoutValid,
  cloneLayout,
  getLayoutStorageKey,
  normalizeLayout,
} from '@/components/focus-lab/utils'
import {
  SOUND_LIBRARY,
  INITIAL_LAYOUT,
  TRIPLE_LAYOUT,
  DOUBLE_LAYOUT,
  GRID_PRESETS,
  LAYOUT_VERSION,
  SIDEBAR_BTN_BASE,
  COL_WIDTH,
  ROW_HEIGHT,
  GAP,
  GRID_WIDTH_DESKTOP,
  CONTROL_BUTTON_BASE,
  INCENTIVE_MESSAGES,
  DEFAULT_LAYOUTS,
  EMPTY_HIDDEN,
} from '@/components/focus-lab/constants'
import { SegmentedControl } from '@/components/focus-lab/components/SegmentedControl'
import { SoundVisualizer } from '@/components/focus-lab/components/SoundVisualizer'
import {
  SidebarLabel,
  FocusSidebarAction,
  FocusSidebarBrand,
  FocusSidebarProfile,
} from '@/components/focus-lab/components/SidebarComponents'
import { WeChatGroupModal } from '@/components/focus-lab/modals/WeChatGroupModal'

// Extracted Widgets (for future migration - currently using _Inline versions)

import { SonicShieldWidget } from '@/components/focus-lab/widgets/SonicShieldWidget'

import { TimerWidget } from '@/components/focus-lab/widgets/TimerWidget'

import { BrainDumpWidget } from '@/components/focus-lab/widgets/BrainDumpWidget'

import { TaskBreakerWidget } from '@/components/focus-lab/widgets/TaskBreakerWidget'

import { DopamineMenuWidget } from '@/components/focus-lab/widgets/DopamineMenuWidget'

// Extracted Hooks (for future migration - currently using inline state)

import { useSoundSystem } from '@/components/focus-lab/hooks/useSoundSystem'

import { useBrainDump } from '@/components/focus-lab/hooks/useBrainDump'

import { useTaskBreaker } from '@/components/focus-lab/hooks/useTaskBreaker'

import { useDopamineSystem } from '@/components/focus-lab/hooks/useDopamineSystem'

const FocusLabMobileGrid = ({
  focusedTask,
  onStartFocus,
  externalCommand,
  onCommandHandled,
  onSessionLogged,
  onTimerComplete,
  onTaskComplete,
}: {
  focusedTask?: FocusedTaskState
  onStartFocus?: (task: string, id: string) => void
  externalCommand?: string | null
  onCommandHandled?: () => void
  onSessionLogged?: (minutes: number) => void
  onTimerComplete?: (minutes: number) => void
  onTaskComplete?: () => void
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
      <BrainDumpCardWidget className="h-auto" />
      <ToDoCard
        className="h-auto"
        onStartFocus={onStartFocus}
        focusedTaskId={focusedTask?.id}
        onTaskComplete={onTaskComplete}
      />
      <TaskBreakerCard className="h-auto" />
      <DopamineMenuCard className="h-auto" />
    </div>
  )
}

export const FocusLabApp = ({ onExitAction }: { onExitAction?: () => void }) => {
  const { theme, setTheme } = useTheme()
  const { themeColor, setThemeColor, uiStyle, setUiStyle } = useThemeColor()
  const { user } = useAuth()
  const { t, language: lang } = useTranslation()
  const displayName = user
    ? user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      (lang === 'zh' ? '探索者' : 'Explorer')
    : undefined

  // Enforce Light Mode for Warm/Green/Cartoon Style
  useEffect(() => {
    if ((uiStyle === 'warm' || uiStyle === 'green' || uiStyle === 'cartoon') && theme !== 'light') {
      setTheme('light')
    }
  }, [uiStyle, theme, setTheme])
  const isFocusMode = false
  const [isLayoutLocked, setIsLayoutLocked] = useState(true)
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
  const [greeting, setGreeting] = useState<GreetingInfo>(() => computeGreeting(lang, displayName))
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
  // const { user } = useAuth() // Moved up
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await createClient()
          .from('profiles')
          .select('subscription_status')
          .eq('id', user.id)
          .single()
        if (data) {
          setSubscriptionStatus(data.subscription_status)
        }
      }
      fetchProfile()
    }
  }, [user])

  const isPro = subscriptionStatus === 'premium'
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
  const [showWeChatModal, setShowWeChatModal] = useState(false)
  const [encouragementMessage, setEncouragementMessage] = useState<string | null>(null)

  const { celebrate } = useCelebration()

  const triggerEncouragement = useCallback(() => {
    const customMessages = settings.focus_lab?.incentives?.custom_messages
    const hasCustom = customMessages && customMessages.length > 0

    // Choose pool: use Custom if available, else Default
    const messagePool = hasCustom
      ? customMessages
      : lang === 'zh'
        ? INCENTIVE_MESSAGES.zh
        : INCENTIVE_MESSAGES.en

    const randomMsg = messagePool[Math.floor(Math.random() * messagePool.length)]
    setEncouragementMessage(randomMsg)
    celebrate({ variant: 'confetti' })
  }, [lang, celebrate, settings.focus_lab?.incentives?.custom_messages])

  /* Handlers moved below */

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
  const [streak, setStreak] = useState(0)
  const lastResetTime = useRef(0) // 追踪最后一次重置的时间戳

  const { startTour, destroyTour } = useFocusTour() // Initialize tour hook

  // 当 AuthModal 打开时销毁 Tour 以避免 z-index 冲突
  useEffect(() => {
    if (showAuthModal) {
      destroyTour()
    }
  }, [showAuthModal, destroyTour])

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

  // BuBu: Listen for timer control events (specifically for setting the focused task)
  useEffect(() => {
    const handleBuBuTimerTaskControl = (event: Event) => {
      const detail = (event as CustomEvent).detail as {
        duration?: number
        mode?: string
        taskContent?: string
      }
      if (detail.taskContent) {
        setFocusedTask({
          text: detail.taskContent,
          id: `bubu-task-${Date.now()}`,
          timestamp: Date.now(),
        })
      }
    }
    window.addEventListener('bubu-timer-control', handleBuBuTimerTaskControl)
    return () => window.removeEventListener('bubu-timer-control', handleBuBuTimerTaskControl)
  }, [])

  // Real progress tracking
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [todayCompletedCount, setTodayCompletedCount] = useState(0)
  const refreshTodayProgress = useCallback(() => {
    const minutes = getTodayFocusMinutes(user?.id)
    setTodayMinutes(minutes)

    const items = readStationStorage(user?.id)
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    const taskCount = items.filter(
      (item) =>
        item.completed && typeof item.completed_at === 'number' && item.completed_at >= startOfDay
    ).length
    setTodayCompletedCount(taskCount)
  }, [user?.id])
  const handleSessionLogged = useCallback(
    (mins: number) => {
      setTodayMinutes((prev) => prev + mins)
      refreshTodayProgress()
      setStreak(getStreak(user?.id))
    },

    [refreshTodayProgress, user?.id]
  )

  const handleTaskComplete = useCallback(() => {
    setTodayCompletedCount((prev) => prev + 1)
    triggerEncouragement()
  }, [triggerEncouragement])

  const handleTimerComplete = useCallback(
    (minutes: number) => {
      refreshTodayProgress()
      triggerEncouragement()
    },
    [refreshTodayProgress, triggerEncouragement]
  )

  const handleCheckout = async (interval: 'month' | 'year' = 'month') => {
    if (!user) {
      setShowPricingModal(false)
      setShowAuthModal(true)
      return
    }

    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        alert('Please log in again.')
        return
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interval }),
      })

      if (response.status === 401) {
        alert('Session expired. Please log in again.')
        setShowAuthModal(true)
        return
      }

      if (!response.ok) throw new Error('Checkout failed')
      const { url } = await response.json()
      if (url) window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout failed, please try again.')
    }
  }

  // Fetch today's progress on mount and interval
  useEffect(() => {
    refreshTodayProgress()
    setStreak(getStreak(user?.id))
    // Poll every minute to update chart
    const interval = setInterval(() => {
      refreshTodayProgress()
      setStreak(getStreak(user?.id))
    }, 60000)
    return () => clearInterval(interval)
  }, [refreshTodayProgress, user?.id])

  useEffect(() => {
    setGreeting(computeGreeting(lang, displayName))
    const interval = setInterval(() => setGreeting(computeGreeting(lang, displayName)), 60000)
    return () => clearInterval(interval)
  }, [lang, displayName])

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
        // Regenerate IDs for station items too
        const safeLocalStation = localStation.map((i) => ({ ...i, id: crypto.randomUUID() }))
        merged = [...merged, ...safeLocalStation]
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

      // Helper to regenerate IDs to avoid RLS conflicts if items were recycled from another user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const regenerateBrainIds = (items: any[]) =>
        items.map((i) => ({ ...i, id: crypto.randomUUID() }))

      if (localBrain.left.length > 0 || localBrain.right.length > 0) {
        const mergedLeft = [...(cloudBrain?.left || []), ...regenerateBrainIds(localBrain.left)]
        const mergedRight = [...(cloudBrain?.right || []), ...regenerateBrainIds(localBrain.right)]
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
      debouncePersistLayout.flush()
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
              className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white p-0 shadow-2xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-50 p-6 px-8 dark:border-gray-800/50">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                    {t.focusLab.widgets.goal.modalTitle}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-gray-400">
                    {t.focusLab.widgets.goal.modalSubtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left Column: Settings */}
                <div className="flex flex-col justify-center gap-12 border-b border-gray-50 p-8 md:border-r md:border-b-0 dark:border-gray-800/50">
                  <div className="space-y-12">
                    {/* Goal 1: Hours */}
                    <div className="group">
                      <div className="mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="icon-[solar--clock-circle-bold-duotone] text-primary-500 text-2xl" />
                          <label className="text-sm font-black tracking-widest text-gray-400 uppercase">
                            {t.focusLab.widgets.goal.hours}
                          </label>
                        </div>
                        <span className="text-primary-500 text-2xl font-black">
                          {tempGoalHours}h
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="12"
                        step="0.5"
                        value={tempGoalHours}
                        onChange={(e) => setTempGoalHours(e.target.value)}
                        className="accent-primary-500 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 dark:bg-gray-800"
                      />
                      <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-400 uppercase opacity-60">
                        <span>
                          {t.focusLab.widgets.goal.current}: {formatHours(currentProgressHours)}h
                        </span>
                        <span>
                          {t.focusLab.widgets.goal.progress}:{' '}
                          {Math.min(100, Math.round(progressPercentage))}%
                        </span>
                      </div>
                    </div>

                    {/* Goal 2: Tasks */}
                    <div className="group">
                      <div className="mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="icon-[solar--checklist-minimalistic-bold-duotone] text-2xl text-emerald-500" />
                          <label className="text-sm font-black tracking-widest text-gray-400 uppercase">
                            {t.focusLab.widgets.goal.tasks}
                          </label>
                        </div>
                        <span className="text-2xl font-black text-emerald-500">{tempTaskGoal}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={tempTaskGoal}
                        onChange={(e) => setTempTaskGoal(e.target.value)}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-emerald-500 dark:bg-gray-800"
                      />
                      <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-400 uppercase opacity-60">
                        <span>
                          {t.focusLab.widgets.goal.completed}: {tasksCompletedToday}
                        </span>
                        <span>
                          {t.focusLab.widgets.goal.progress}:{' '}
                          {Math.min(100, Math.round(taskProgressPercentage))}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Status & Reward */}
                <div className="bg-gray-50/50 p-6 dark:bg-gray-900/50">
                  <div className="flex h-full flex-col gap-4">
                    {/* Streak Bento Card */}
                    <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20"
                      >
                        <span className="icon-[solar--fire-bold-duotone] text-4xl text-orange-500" />
                      </motion.div>
                      <div className="text-center">
                        <div className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                          {t.focusLab.widgets.goal.streak}
                        </div>
                        <div className="text-4xl font-black text-gray-900 dark:text-white">
                          {streak}{' '}
                          <span className="text-base font-bold text-gray-400">
                            {streak === 1
                              ? t.focusLab.widgets.goal.streakDay
                              : t.focusLab.widgets.goal.streakDays}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reward Bento Card */}
                    <div
                      className={cn(
                        'group relative flex flex-1 items-center gap-4 overflow-hidden rounded-3xl border p-5 transition-all duration-500',
                        rewardUnlocked
                          ? 'border-amber-100 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-900/10'
                          : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-800/50'
                      )}
                    >
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-2xl dark:bg-gray-800">
                        <span
                          className={cn(
                            'transition-transform duration-500 group-hover:scale-110',
                            rewardUnlocked
                              ? 'icon-[solar--magic-stick-3-bold-duotone] text-amber-500'
                              : 'icon-[solar--box-linear] text-gray-400'
                          )}
                        />
                      </div>
                      <div className="relative z-10">
                        <div className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                          {t.focusLab.widgets.goal.reward}
                        </div>
                        <div className="text-sm font-black text-gray-900 dark:text-white">
                          {rewardUnlocked
                            ? t.focusLab.widgets.goal.rewardUnlocked
                            : t.focusLab.widgets.goal.rewardLocked}
                        </div>
                      </div>

                      {/* Decal background icon */}
                      <span className="icon-[solar--medal-ribbons-star-bold] absolute -right-2 -bottom-2 text-6xl text-gray-100 opacity-20 dark:text-gray-800" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 bg-gray-50/50 p-6 px-8 dark:bg-gray-900/50">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="rounded-full px-5 py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  {t.auth.profile.cancel}
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />
                <button
                  onClick={handleGoalModalSave}
                  className="bg-primary-500 shadow-primary-500/30 hover:bg-primary-600 rounded-full px-10 py-3 text-sm font-black text-white shadow-lg transition-all active:scale-95"
                >
                  {t.focusLab.widgets.goal.save}
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
              className="no-scrollbar relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-4 text-xl font-bold dark:text-white">
                {t.focusLab.settings?.title || 'Settings'}
              </h2>

              <div className="space-y-4">
                {/* Dark Mode */}
                <div
                  className={`flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800 ${uiStyle === 'warm' || uiStyle === 'green' || uiStyle === 'blue' || uiStyle === 'cartoon' ? 'opacity-50' : ''}`}
                >
                  <span className="font-medium dark:text-gray-200">
                    {t.focusLab.settings?.darkMode || 'Dark Mode'}
                  </span>
                  <button
                    disabled={
                      uiStyle === 'warm' ||
                      uiStyle === 'green' ||
                      uiStyle === 'blue' ||
                      uiStyle === 'cartoon'
                    }
                    onClick={() => {
                      if (
                        uiStyle !== 'warm' &&
                        uiStyle !== 'green' &&
                        uiStyle !== 'blue' &&
                        uiStyle !== 'cartoon'
                      ) {
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                      }
                    }}
                    className={`rounded-md bg-gray-200 px-3 py-1.5 text-sm transition-colors dark:bg-gray-700 ${uiStyle === 'warm' || uiStyle === 'green' || uiStyle === 'blue' || uiStyle === 'cartoon' ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {uiStyle === 'warm' ||
                    uiStyle === 'green' ||
                    uiStyle === 'blue' ||
                    uiStyle === 'cartoon'
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
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${(settings.focus_lab?.hide_headers ?? false) ? (uiStyle === 'warm' ? 'bg-[#F5F2EC] font-bold text-[#C27B4A]' : uiStyle === 'green' ? 'bg-[#F8F9F7] font-bold text-[#7A9F7A]' : uiStyle === 'blue' ? 'bg-[#E0EEF8] font-bold text-[#5B84B1]' : uiStyle === 'cartoon' ? 'border border-black bg-[#FFF8E7] font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-[#2A2A2A] dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' : 'bg-primary-100 text-primary-700 font-bold') : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
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
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${notificationsEnabled ? (uiStyle === 'warm' ? 'bg-[#F5F2EC] font-bold text-[#C27B4A]' : uiStyle === 'green' ? 'bg-[#F8F9F7] font-bold text-[#7A9F7A]' : uiStyle === 'blue' ? 'bg-[#E0EEF8] font-bold text-[#5B84B1]' : uiStyle === 'cartoon' ? 'border border-black bg-[#FFF8E7] font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-[#2A2A2A] dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' : 'bg-primary-100 text-primary-700 font-bold') : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
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
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${(settings.focus_lab?.sound?.enabled ?? true) ? (uiStyle === 'warm' ? 'bg-[#F5F2EC] font-bold text-[#C27B4A]' : uiStyle === 'green' ? 'bg-[#F8F9F7] font-bold text-[#7A9F7A]' : uiStyle === 'blue' ? 'bg-[#E0EEF8] font-bold text-[#5B84B1]' : uiStyle === 'cartoon' ? 'border border-black bg-[#FFF8E7] font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-[#2A2A2A] dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' : 'bg-primary-100 text-primary-700 font-bold') : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
                  >
                    {(settings.focus_lab?.sound?.enabled ?? true)
                      ? t.focusLab.settings?.on || 'On'
                      : t.focusLab.settings?.off || 'Off'}
                  </button>
                </div>

                {/* Custom Incentives */}
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium dark:text-gray-200">
                      {lang === 'zh' ? '自定义激励语' : 'Personalized Incentives'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {lang === 'zh' ? '每行一条' : 'One per line'}
                    </span>
                  </div>
                  <textarea
                    className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border-gray-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    rows={4}
                    placeholder={
                      lang === 'zh' ? '输入你的专属激励语...' : 'Enter your custom messages...'
                    }
                    value={settings.focus_lab?.incentives?.custom_messages?.join('\n') ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      // Split by newline, but verify we don't save empty string if input is empty
                      const lines = val ? val.split('\n') : []
                      updateSettings('focus_lab.incentives.custom_messages', lines)
                    }}
                  />
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
                            ? uiStyle === 'warm'
                              ? 'bg-[#F5F2EC] text-[#C27B4A]'
                              : uiStyle === 'green'
                                ? 'bg-[#F8F9F7] text-[#7A9F7A]'
                                : uiStyle === 'blue'
                                  ? 'bg-[#E0EEF8] text-[#5B84B1]'
                                  : uiStyle === 'cartoon'
                                    ? 'border border-black bg-[#FFF8E7] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-[#2A2A2A] dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                                    : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
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
                  <div className="grid grid-cols-2 gap-2">
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
                    <button
                      onClick={() => {
                        setUiStyle('cartoon')
                        updateSettings('theme.style', 'cartoon')
                      }}
                      className={cn(
                        'flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        uiStyle === 'cartoon'
                          ? 'border-black bg-[#FFF8E7] text-black shadow-[2px_2px_0px_0px_#000000] dark:border-white dark:bg-[#2A2A2A] dark:text-white dark:shadow-[2px_2px_0px_0px_#FFFFFF]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      Cartoon
                    </button>
                    <button
                      onClick={() => {
                        setUiStyle('blue')
                        updateSettings('theme.style', 'blue')
                      }}
                      className={cn(
                        'flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        uiStyle === 'blue'
                          ? 'border-[#5B84B1] bg-[#E0EEF8] text-[#5B84B1]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      Blue
                    </button>
                  </div>
                  {/* Light mode only hint for non-Modern styles */}
                  {(uiStyle === 'warm' ||
                    uiStyle === 'green' ||
                    uiStyle === 'blue' ||
                    uiStyle === 'cartoon') && (
                    <p className="mt-2 text-xs text-gray-400">
                      {lang === 'zh'
                        ? '此风格仅支持浅色模式'
                        : 'This style only supports light mode'}
                    </p>
                  )}
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
      <WeChatGroupModal isOpen={showWeChatModal} onClose={() => setShowWeChatModal(false)} />
      <AnimatePresence>
        <PlanComparisonModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          onSubscribe={handleCheckout}
        />
      </AnimatePresence>

      <div
        id="focus-lab-container"
        className={cn(
          'fixed inset-0 z-[100] flex h-full w-full overflow-hidden transition-colors duration-500',
          uiStyle === 'warm'
            ? 'bg-[#FDFBF7] text-gray-900'
            : uiStyle === 'green'
              ? 'bg-[#F8F9F7] text-gray-900'
              : uiStyle === 'blue'
                ? 'bg-[#E0EEF8] text-gray-900'
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
                    id="sidebar-goal"
                    icon={<StarIcon className="h-6 w-6" />}
                    label={t.focusLab.sidebar.dailyGoal || 'Daily Goal'}
                    onClick={() => setShowGoalModal(true)}
                  />
                  <FocusSidebarAction
                    id="sidebar-stats"
                    icon={<StatsIcon className="h-6 w-6" />}
                    label={t.focusLab.sidebar.stats}
                    onClick={handleOpenStats}
                  />
                  <FocusSidebarAction
                    id="sidebar-settings"
                    icon={<SettingsIcon className="h-6 w-6" />}
                    label={t.focusLab.sidebar.settings}
                    onClick={() => setShowSettingsModal(true)}
                  />
                  <FocusSidebarAction
                    id="sidebar-tour"
                    icon={<HelpIcon className="h-6 w-6" />}
                    label={lang === 'zh' ? '使用引导' : 'Tour'}
                    onClick={startTour}
                  />
                  {lang === 'zh' && (
                    <FocusSidebarAction
                      icon={<span className="icon-[solar--chat-round-dots-bold-duotone] h-6 w-6" />}
                      label="加入群聊"
                      onClick={() => setShowWeChatModal(true)}
                    />
                  )}
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
                  id="sidebar-layout-lock"
                  icon={
                    <span
                      className={`${
                        isLayoutLocked
                          ? 'icon-[solar--lock-keyhole-bold-duotone]'
                          : 'icon-[solar--lock-keyhole-unlocked-bold-duotone]'
                      } h-6 w-6`}
                    />
                  }
                  label={
                    isLayoutLocked
                      ? t.focusLab.controls.unlockLayout || 'Unlock Layout'
                      : t.focusLab.controls.lockLayout || 'Lock Layout'
                  }
                  onClick={() => setIsLayoutLocked(!isLayoutLocked)}
                />
                <FocusSidebarAction
                  icon={<LogoutIcon className="h-6 w-6" />}
                  label={t.focusLab.controls.exitFocus || 'Exit Focus'}
                  onClick={onExitAction || (() => {})}
                />
                <FocusSidebarProfile
                  userName={
                    user
                      ? user.user_metadata?.full_name || user.email?.split('@')[0] || 'Explorer'
                      : 'Explorer'
                  }
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
                        : uiStyle === 'blue'
                          ? 'border-[#D1E3F3] bg-white'
                          : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
                  )}
                >
                  <span className="text-lg font-bold dark:text-white">Focus Lab</span>
                  <button
                    onClick={onExitAction}
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
                      isLayoutLocked={isLayoutLocked}
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
                              onTimerComplete={handleTimerComplete}
                            />
                          )
                        }
                        if (item.id === 'brain') {
                          return (
                            <BrainDumpCardWidget className="h-full w-full" isFocused={isFocused} />
                          )
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
                              onTaskComplete={handleTaskComplete}
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

      {/* Encouragement Toast */}
      {/* Encouragement Toast */}
      {encouragementMessage && (
        <EncouragementToast
          message={encouragementMessage}
          onClose={() => setEncouragementMessage(null)}
        />
      )}
      {/* BuBu AI Assistant */}
      <BuBu stats={{ todayMinutes, completedTaskCount: todayCompletedCount }} />
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
  const { uiStyle } = useThemeColor()
  const isCartoon = uiStyle === 'cartoon'
  const [isFlipped, setIsFlipped] = useState(false)

  // Use the extracted hook
  const sound = useSoundSystem()

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
              ? uiStyle === 'cartoon'
                ? 'border-2 border-black bg-black text-white shadow-none'
                : 'bg-gray-100 text-gray-900 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700'
              : uiStyle === 'cartoon'
                ? 'border-2 border-transparent text-black hover:border-black hover:bg-white hover:text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-gray-400 ring-gray-100 hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-900 dark:text-gray-500 dark:ring-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-300'
          }`}
          aria-label={t.focusLab.widgets.sonicShield.settings?.title || 'Settings'}
        >
          <MoreHorizontalIcon className="h-5 w-5" />
        </button>
      }
    >
      <SonicShieldWidget sound={sound} isFlipped={isFlipped} onFlip={setIsFlipped} />
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
  const { uiStyle } = useThemeColor()
  const isCartoon = uiStyle === 'cartoon'
  const [isFlipped, setIsFlipped] = useState(false)
  const [showTaskTitle, setShowTaskTitle] = useState(true)

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
          className={`flex aspect-square h-8 w-8 shrink-0 items-center justify-center rounded-2xl shadow-lg ring-1 transition-all ${
            isFlipped
              ? uiStyle === 'cartoon'
                ? 'border-2 border-black bg-black text-white shadow-none'
                : 'bg-gray-100 text-gray-900 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700'
              : uiStyle === 'cartoon'
                ? 'border-2 border-transparent text-black hover:border-black hover:bg-white hover:text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-gray-400 ring-gray-100 hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-900 dark:text-gray-500 dark:ring-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-300'
          }`}
          aria-label={t.focusLab.widgets.timer.switchMode || 'Switch Mode'}
        >
          <MoreHorizontalIcon className="h-5 w-5" />
        </button>
      }
      className={className}
    >
      <TimerWidget_Inline
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
  const [isResultView, setIsResultView] = useState(false)

  // Use the extracted hook
  const taskBreaker = useTaskBreaker((isResult) => setIsResultView(isResult))

  return (
    <CardShell
      title={t.focusLab.widgets.taskBreaker.title}
      onDelete={onDelete}
      className={className}
      isFocused={isFocused}
      variant={isResultView ? 'default' : 'ai-assistant'}
    >
      <TaskBreakerWidget taskBreaker={taskBreaker} uiStyle={uiStyle} isResultView={isResultView} />
    </CardShell>
  )
}

const BrainDumpCardWidget = ({
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

  // Use the extracted hook
  const brainDump = useBrainDump()

  return (
    <CardShell
      title={t.focusLab.widgets.brainDump.title}
      onDelete={onDelete}
      className={className}
      isFocused={isFocused}
    >
      <BrainDumpWidget brainDump={brainDump} uiStyle={uiStyle} />
    </CardShell>
  )
}

const TicketIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--ticket-star-bold-duotone] ${className}`} />
)

const ScratchCard = ({
  onStartFocus,
  onFlipBack,
}: {
  onStartFocus?: (task: string, id: string) => void
  onFlipBack: () => void
}) => {
  const { user } = useAuth()
  const { uiStyle } = useThemeColor()
  const isWarm = uiStyle === 'warm'
  const isGreen = uiStyle === 'green'
  const isBlue = uiStyle === 'blue'
  const isCartoon = uiStyle === 'cartoon'
  const { t } = useTranslation()

  const [targetTask, setTargetTask] = useState<FocusItem | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize: Pick a random task
  useEffect(() => {
    const allItems = readStationStorage(user?.id)
    const activeItems = allItems.filter((i) => !i.completed)

    if (activeItems.length > 0) {
      const randomItem = activeItems[Math.floor(Math.random() * activeItems.length)]
      setTargetTask(randomItem)
    } else {
      setTargetTask(null)
    }
  }, [user])

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !targetTask) return

    const themeColors = {
      default: '#333333',
      cartoon: '#000000',
    }
    const overlayColor = isCartoon ? themeColors.cartoon : themeColors.default

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    ctx.fillStyle = overlayColor
    ctx.fillRect(0, 0, width, height)

    // Removed Sparkle Icon as per user request for a cleaner look
    // ctx.font = 'bold 32px sans-serif'
    // ctx.fillStyle = isCartoon ? '#ffffff' : '#666666'
    // ctx.textAlign = 'center'
    // ctx.textBaseline = 'middle'
    // ctx.fillText('✨', width / 2, height / 2)

    ctx.globalCompositeOperation = 'destination-out'
  }, [targetTask, isCartoon])

  const checkRevealProgress = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    let transparentPixels = 0
    const totalPixels = data.length / 4

    for (let i = 0; i < totalPixels; i += 10) {
      if (data[i * 4 + 3] === 0) transparentPixels++
    }

    if (transparentPixels / (totalPixels / 10) > 0.4) {
      setIsRevealed(true)
    }
  }

  /* Smooth Scratching State */
  const lastPosition = useRef<{ x: number; y: number } | null>(null)

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas || isRevealed) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.lineWidth = 70 // 2 * radius (35)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    if (lastPosition.current) {
      ctx.moveTo(lastPosition.current.x, lastPosition.current.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else {
      ctx.arc(x, y, 35, 0, Math.PI * 2)
      ctx.fill()
    }

    lastPosition.current = { x, y }
    checkRevealProgress()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        lastPosition.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
        scratch(e.clientX, e.clientY)
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) {
      lastPosition.current = null
      return
    }
    scratch(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    lastPosition.current = null
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      lastPosition.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
      scratch(touch.clientX, touch.clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent scrolling while scratching
    const touch = e.touches[0]
    scratch(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = () => {
    lastPosition.current = null
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
    >
      {!targetTask ? (
        <div className="text-center text-gray-400">
          <p>{t.focusLab.widgets.todo.emptyTitle}</p>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 z-0 flex items-center justify-center p-4">
            <FocusTaskCard
              item={targetTask}
              onToggleAction={() => {}}
              onRemoveAction={() => {}}
              onStartFocusAction={onStartFocus}
              variant="reward"
              isWarm={isWarm}
              isGreen={isGreen}
              isBlue={isBlue}
              isCartoon={isCartoon}
            />
          </div>

          <canvas
            ref={canvasRef}
            className={`absolute inset-0 z-10 cursor-crosshair touch-none transition-all duration-1000 ${
              isRevealed ? 'pointer-events-none invisible opacity-0' : 'visible opacity-100'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </>
      )}
    </div>
  )
}

const ToDoCard = ({
  cols,
  onDelete,
  className,
  onStartFocus,
  focusedTaskId,
  onTaskComplete,
  isFocused,
}: {
  cols?: number
  onDelete?: () => void
  className?: string
  onStartFocus?: (task: string, id: string) => void
  focusedTaskId?: string | null
  onTaskComplete?: () => void
  isFocused?: boolean
}) => {
  const { t } = useTranslation()
  const { uiStyle } = useThemeColor()
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <CardShell
      // Hide header when flipped so ScratchCard can take over the full area
      showHeader={!isFlipped}
      title={t.focusLab.widgets.todo.title}
      onDelete={onDelete}
      // Remove padding when flipped
      className={`${className} ${isFlipped ? '!overflow-hidden !p-0' : ''}`}
      // Remove top margin when flipped
      bodyClassName={isFlipped ? '!mt-0' : ''}
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
              ? uiStyle === 'cartoon'
                ? 'border-2 border-black bg-black text-white shadow-none'
                : 'bg-gray-100 text-gray-900 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700'
              : uiStyle === 'cartoon'
                ? 'border-2 border-transparent text-black hover:border-black hover:bg-white hover:text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-gray-400 ring-gray-100 hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-900 dark:text-gray-500 dark:ring-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-300'
          }`}
          aria-label={t.focusLab.widgets.todo.flipToScratch || 'Flip to Scratch Card'}
          title={t.focusLab.widgets.todo.flipToScratch || 'Flip to Scratch Card'}
        >
          <MoreHorizontalIcon className="h-5 w-5" />
        </button>
      }
    >
      <AnimatePresence mode="wait">
        {isFlipped ? (
          <motion.div
            key="back"
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -180 }}
            transition={{ duration: 0.3 }}
            className="flex h-full w-full flex-col"
          >
            <ScratchCard
              onStartFocus={(task, id) => {
                onStartFocus?.(task, id)
                setIsFlipped(false)
              }}
              onFlipBack={() => setIsFlipped(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-full min-h-0 flex-col"
          >
            <FocusStation
              cols={cols}
              onStartFocusAction={onStartFocus}
              focusedTaskId={focusedTaskId}
              onTaskCompleteAction={onTaskComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </CardShell>
  )
}

const DopamineMenuCard = ({
  onDelete,
  className,
  isFocused,
  cols,
}: {
  onDelete?: () => void
  className?: string
  isFocused?: boolean
  cols?: number
}) => {
  const { t } = useTranslation()
  const { uiStyle } = useThemeColor()
  const [isFlipped, setIsFlipped] = useState(false)

  // Use the extracted hook
  const dopamine = useDopamineSystem()

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
              ? uiStyle === 'cartoon'
                ? 'border-2 border-black bg-black text-white shadow-none'
                : 'bg-gray-100 text-gray-900 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700'
              : uiStyle === 'cartoon'
                ? 'border-2 border-transparent text-black hover:border-black hover:bg-white hover:text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-gray-400 ring-gray-100 hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-900 dark:text-gray-500 dark:ring-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-300'
          }`}
          aria-label={t.focusLab.widgets.dopamineMenu.edit || 'Edit Options'}
        >
          <MoreHorizontalIcon className="h-5 w-5" />
        </button>
      }
    >
      <DopamineMenuWidget
        dopamine={dopamine}
        cols={cols}
        isFlipped={isFlipped}
        onFlip={setIsFlipped}
        uiStyle={uiStyle}
      />
    </CardShell>
  )
}

/**
 * Timer State Machine:
 * - idle: 初始/待机状态，可以开始新的专注
 * - focusing: 专注进行中（倒计时或秒表）
 * - paused-focusing: 专注暂停中
 * - focus-completed: 专注时间结束，显示完成界面
 * - break: 休息进行中
 * - paused-break: 休息暂停中
 * - break-completed: 休息结束
 *
 * 状态转换:
 *   idle -> focusing (点击开始)
 *   focusing -> paused-focusing (点击暂停)
 *   focusing -> focus-completed (倒计时归零)
 *   paused-focusing -> focusing (点击继续)
 *   paused-focusing -> idle (点击结束)
 *   focus-completed -> idle (点击结束)
 *   focus-completed -> focusing (点击再来一轮)
 */
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

const TimerWidget_Inline = ({
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
  const isBlue = uiStyle === 'blue'
  const isCartoon = uiStyle === 'cartoon'
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

  // Zen Mode State
  const [isZenMode, setIsZenMode] = useState(false)
  const [zenFocus, setZenFocus] = useState<'task' | 'timer'>('task')

  // Timer Core State
  const [timeLeft, setTimeLeft] = useState(timerPresets.focus.duration) // Seconds. Countdown: remaining. Stopwatch: elapsed.
  const [timerState, setTimerState] = useState<TimerState>('idle')
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

  // Escape key to exit Zen Mode
  useEffect(() => {
    if (!isZenMode) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZenMode(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isZenMode])

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

  // BuBu: Listen for timer control events
  useEffect(() => {
    const handleBuBuTimerControl = (event: Event) => {
      const detail = (event as CustomEvent).detail as {
        duration?: number
        mode?: string
      }
      console.log('[TimerWidget] Received BuBu command:', detail)

      // Ensure we are on Countdown mode (Front)
      if (isFlipped) {
        onFlip(false)
      }

      // Handle Mode & Duration
      if (detail.mode) {
        if (detail.mode.toLowerCase().includes('short')) setActivePreset('short')
        else if (detail.mode.toLowerCase().includes('long')) setActivePreset('long')
        else setActivePreset('focus')
      }

      if (detail.duration) {
        // If specific duration requested, use Custom (Long) preset logic hack or just modify customMinutes
        // For simplicity, let's update customMinutes and switch to 'long' if it's a custom time
        // Or if it matches standard presets, switch to them.

        if (detail.duration === 5) setActivePreset('short')
        else if (detail.duration === 25) setActivePreset('focus')
        else {
          setActivePreset('long')
          setCustomMinutes(detail.duration)
          setIsCustomChanged(true) // trigger save
        }
      }

      // Start the timer
      // We need to wait for state updates to propagate, so we use a small timeout or just call start logic directly
      // However, startTimer depends on current state.
      // Let's force a start in next tick.
      setTimeout(() => {
        const playClickSound = () => {
          const audio = new Audio('/static/sounds/click.mp3')
          audio.volume = 0.5
          audio.play().catch(() => {})
        }
        playClickSound()

        // Reset and Start
        hasLoggedRef.current = false
        setStartTime(Date.now())
        setTimerState('focusing')

        // Set TimeLeft based on the just-set values (need to duplicate logic here because state update implies re-render)
        // Actually, since we are inside the event handler, state updates won't be reflected immediately in 'activePreset' var.
        // So we must calculate d manually here.

        let d = 25 * 60
        if (detail.mode?.includes('short') || detail.duration === 5) d = 5 * 60
        else if (detail.duration && detail.duration !== 25) d = detail.duration * 60

        setTimeLeft(d)
        setTotalAllocatedDuration(d)
      }, 100)
    }

    window.addEventListener('bubu-timer-control', handleBuBuTimerControl)
    return () => window.removeEventListener('bubu-timer-control', handleBuBuTimerControl)
  }, [isFlipped, onFlip])

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
      if (derivedMode === 'countdown') {
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
                  className={`focuslab-numeric ${isWarm ? 'text-[#C27B4A]' : isGreen ? 'text-[#7A9F7A]' : isBlue ? 'text-[#5B84B1]' : isCartoon ? 'text-black dark:text-white' : 'text-primary-600 dark:text-primary-400'} leading-none font-black tracking-tight`}
                  style={{ fontSize: 'clamp(2.5rem, 26cqw, 7rem)' }}
                >
                  {display}
                </div>
              </div>
              <p
                className={`mt-2 text-sm font-medium ${isCartoon ? 'text-black dark:text-white' : 'text-gray-400'}`}
              >
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
                          : isBlue
                            ? 'h-10 flex-1 rounded-xl bg-[#5B84B1] text-white shadow-lg shadow-[#5B84B1]/25 hover:bg-[#4A6E94] hover:shadow-[#5B84B1]/40 focus:ring-2 focus:ring-[#5B84B1] focus:ring-offset-2 dark:focus:ring-offset-2'
                            : isCartoon
                              ? 'h-10 flex-1 rounded-xl bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
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
                        ? 'h-10 flex-1 rounded-xl bg-[#C27B4A] text-white shadow-lg shadow-[#C27B4A]/25 hover:bg-[#A6663E] hover:shadow-[#C27B4A]/40 focus:ring-2 focus:ring-[#C27B4A] focus:ring-offset-2'
                        : isGreen
                          ? 'h-10 flex-1 rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : isBlue
                            ? 'h-10 flex-1 rounded-xl bg-[#5B84B1] text-white shadow-lg shadow-[#5B84B1]/25 hover:bg-[#4A6E94] hover:shadow-[#5B84B1]/40 focus:ring-2 focus:ring-[#5B84B1] focus:ring-offset-2 dark:focus:ring-offset-2'
                            : isCartoon
                              ? 'h-10 flex-1 rounded-xl bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
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
                          : isBlue
                            ? 'h-10 rounded-xl bg-[#D1E3F3] text-[#5B84B1] hover:bg-[#C0D8EE]'
                            : isCartoon
                              ? 'h-10 rounded-xl border-2 border-black text-black hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-gray-800'
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
                          : isBlue
                            ? 'h-10 flex-[2] rounded-xl bg-[#5B84B1] text-white shadow-lg shadow-[#5B84B1]/25 hover:bg-[#4A6E94] hover:shadow-[#5B84B1]/40 focus:ring-2 focus:ring-[#5B84B1] focus:ring-offset-2 dark:focus:ring-offset-2'
                            : isCartoon
                              ? 'h-10 flex-[2] rounded-xl bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
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
            <div className="relative flex h-10 w-full items-center justify-center">
              <AnimatePresence>
                {timerState === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center gap-2 rounded-xl p-1 dark:bg-gray-800 ${isCartoon ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    {(['focus', 'short', 'long'] as TimerPreset[]).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setActivePreset(preset)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                          activePreset === preset
                            ? isBlue
                              ? 'bg-[#E0EEF8] text-[#5B84B1] shadow-sm'
                              : isGreen
                                ? 'bg-[#F8F9F7] text-[#7A9F7A] shadow-sm'
                                : isWarm
                                  ? 'bg-[#F5F2EC] text-[#C27B4A] shadow-sm'
                                  : isCartoon
                                    ? 'bg-black text-white shadow-md'
                                    : 'text-primary-600 dark:text-primary-400 dark:bg-primary-800/40 bg-white shadow-sm'
                            : isCartoon
                              ? 'text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
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
                                className="w-8 [appearance:textfield] rounded bg-transparent p-0 text-center outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                            ) : (
                              <span onDoubleClick={() => setIsEditingCustom(true)}>
                                {typeof settings.focus_lab?.timer?.custom_duration === 'number'
                                  ? `${customMinutes}m`
                                  : t.focusLab.widgets.timer.custom}
                              </span>
                            )}
                          </span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Zen Mode Button - Positioned absolute right in header */}
              <button
                onClick={() => setIsZenMode(true)}
                className={`absolute right-0 z-10 rounded-lg p-1.5 transition-all ${
                  isCartoon
                    ? 'text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                }`}
                aria-label="Enter Zen Mode"
              >
                <span className="icon-[solar--meditation-round-linear] text-lg" />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center">
              <div
                className="flex w-full items-center justify-center"
                style={{ containerType: 'inline-size' }}
              >
                <div
                  className={`focuslab-numeric leading-none font-black tracking-tight ${isBlue ? 'text-[#5B84B1]' : isGreen ? 'text-[#7A9F7A]' : isWarm ? 'text-[#C27B4A]' : isCartoon ? 'text-black dark:text-white' : isCompleted ? 'text-primary-600 dark:text-primary-400' : 'text-primary-600 dark:text-primary-400'}`}
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
                          : isBlue
                            ? 'h-10 flex-1 rounded-xl bg-[#5B84B1] text-white shadow-lg shadow-[#5B84B1]/25 hover:bg-[#4A6E94] hover:shadow-[#5B84B1]/40 focus:ring-2 focus:ring-[#5B84B1] focus:ring-offset-2 dark:focus:ring-offset-2'
                            : isCartoon
                              ? 'h-10 flex-1 rounded-xl bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
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
                        ? 'h-10 flex-1 rounded-xl bg-[#C27B4A] text-white shadow-lg shadow-[#C27B4A]/25 hover:bg-[#A6663E] hover:shadow-[#C27B4A]/40 focus:ring-2 focus:ring-[#C27B4A] focus:ring-offset-2'
                        : isGreen
                          ? 'h-10 flex-1 rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : isBlue
                            ? 'h-10 flex-1 rounded-xl bg-[#5B84B1] text-white shadow-lg shadow-[#5B84B1]/25 hover:bg-[#4A6E94] hover:shadow-[#5B84B1]/40 focus:ring-2 focus:ring-[#5B84B1] focus:ring-offset-2 dark:focus:ring-offset-2'
                            : isCartoon
                              ? 'h-10 flex-1 rounded-xl bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
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
                          : isBlue
                            ? 'h-10 rounded-xl bg-[#D1E3F3] text-[#5B84B1] hover:bg-[#C0D8EE]'
                            : isCartoon
                              ? 'h-10 rounded-xl border-2 border-black bg-white text-black hover:bg-gray-100 dark:border-white dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
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
                          : isBlue
                            ? 'h-10 flex-[2] rounded-xl bg-[#5B84B1] text-white shadow-lg shadow-[#5B84B1]/25 hover:bg-[#4A6E94] hover:shadow-[#5B84B1]/40 focus:ring-2 focus:ring-[#5B84B1] focus:ring-offset-2 dark:focus:ring-offset-2'
                            : isCartoon
                              ? 'h-10 flex-[2] rounded-xl bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
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
                          : isBlue
                            ? 'rounded-lg bg-[#5B84B1] shadow-[#5B84B1]/30 hover:bg-[#4A6E94]'
                            : isCartoon
                              ? 'rounded-lg bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                              : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/25 rounded-full'
                    } w-full px-4 py-2 text-sm font-extrabold text-white shadow-lg transition-all active:scale-95`}
                  >
                    {t.focusLab.widgets.timer.continueFocus || 'One more round'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zen Mode Fullscreen Overlay - using Portal to escape parent constraints */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isZenMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
              >
                {/* Exit Button */}
                <button
                  onClick={() => setIsZenMode(false)}
                  className="absolute top-6 right-6 rounded-full p-3 text-white/60 transition-all hover:bg-white/10 hover:text-white"
                  aria-label={t.focusLab.widgets.timer.zenMode?.exit || 'Exit Zen Mode'}
                >
                  <span className="icon-[solar--close-circle-linear] text-3xl" />
                </button>

                {/* Timer & Task Groups - Click to Swap */}
                <div className="flex w-full flex-col items-center justify-center gap-8">
                  {zenFocus === 'task' ? (
                    <>
                      {/* Secondary: Timer */}
                      <motion.div
                        layoutId="zen-timer"
                        onClick={(e) => {
                          e.stopPropagation()
                          setZenFocus('timer')
                        }}
                        className={`focuslab-numeric cursor-pointer text-3xl font-medium tracking-widest transition-opacity hover:opacity-100 ${isCompleted ? 'text-green-400' : 'text-white/40'}`}
                      >
                        {isCompleted ? t.focusLab.widgets.timer.congratulations || '🎉' : display}
                      </motion.div>

                      {/* Primary: Task */}
                      {focusedTask && (
                        <motion.p
                          layoutId="zen-task"
                          className="max-w-[80%] cursor-default text-center text-6xl leading-tight font-bold text-white"
                        >
                          {focusedTask.text}
                        </motion.p>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Secondary: Task */}
                      {focusedTask && (
                        <motion.p
                          layoutId="zen-task"
                          onClick={(e) => {
                            e.stopPropagation()
                            setZenFocus('task')
                          }}
                          className="max-w-[80%] cursor-pointer text-center text-2xl font-medium text-white/50 transition-opacity hover:text-white/80"
                        >
                          {focusedTask.text}
                        </motion.p>
                      )}

                      {/* Primary: Timer */}
                      <motion.div
                        layoutId="zen-timer"
                        className={`focuslab-numeric text-9xl leading-none font-black tracking-tight ${
                          isCompleted
                            ? 'text-green-400'
                            : isWarm
                              ? 'text-[#C27B4A]'
                              : isGreen
                                ? 'text-[#7A9F7A]'
                                : isBlue
                                  ? 'text-[#5B84B1]'
                                  : 'text-white'
                        }`}
                      >
                        {isCompleted ? t.focusLab.widgets.timer.congratulations || '🎉' : display}
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Status Text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 text-lg text-white/40"
                >
                  {isCompleted
                    ? t.focusLab.widgets.timer.zenMode?.sessionComplete || 'Session Complete!'
                    : isRunning
                      ? isFlipped
                        ? t.focusLab.widgets.timer.recording || 'Recording time...'
                        : t.focusLab.widgets.timer.zenMode?.stayFocused || 'Stay focused'
                      : isPaused
                        ? t.focusLab.widgets.timer.zenMode?.paused || 'Paused'
                        : timerState === 'idle'
                          ? t.focusLab.widgets.timer.ready || 'Ready to start'
                          : ''}
                </motion.p>

                {/* Control Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-12 flex gap-4"
                >
                  {timerState === 'idle' && (
                    <button
                      onClick={() => {
                        playClickSound()
                        startTimer()
                      }}
                      className="flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20"
                    >
                      <span className="icon-[solar--play-bold] text-xl" />
                      {t.focusLab.widgets.timer.start || 'Start'}
                    </button>
                  )}
                  {isRunning && (
                    <button
                      onClick={() => {
                        playClickSound()
                        pauseTimer()
                      }}
                      className="flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20"
                    >
                      <span className="icon-[solar--pause-bold] text-xl" />
                      {t.focusLab.widgets.timer.pause}
                    </button>
                  )}

                  {isPaused && (
                    <>
                      <button
                        onClick={() => {
                          playClickSound()
                          endSession()
                          setIsZenMode(false)
                        }}
                        className="flex items-center gap-2 rounded-full bg-red-500/20 px-8 py-4 text-lg font-semibold text-red-400 transition-all hover:bg-red-500/30"
                      >
                        {t.focusLab.widgets.timer.endSession || 'End'}
                      </button>
                      <button
                        onClick={() => {
                          playClickSound()
                          startTimer()
                        }}
                        className="flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20"
                      >
                        <span className="icon-[solar--play-bold] text-xl" />
                        {t.focusLab.widgets.timer.resume || 'Resume'}
                      </button>
                    </>
                  )}

                  {isCompleted && (
                    <>
                      <button
                        onClick={() => {
                          playClickSound()
                          endSession()
                          setIsZenMode(false)
                        }}
                        className="flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20"
                      >
                        {t.focusLab.widgets.timer.endFocus || 'End Focus'}
                      </button>
                      <button
                        onClick={() => {
                          playClickSound()
                          continueNewSession()
                        }}
                        className={`flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold text-white transition-all ${
                          isWarm
                            ? 'bg-[#C27B4A] hover:bg-[#A6663E]'
                            : isGreen
                              ? 'bg-[#7A9F7A] hover:bg-[#688868]'
                              : isBlue
                                ? 'bg-[#5B84B1] hover:bg-[#4A6E94]'
                                : 'bg-primary-500 hover:bg-primary-600'
                        }`}
                      >
                        {t.focusLab.widgets.timer.continueFocus || 'One more round'}
                      </button>
                    </>
                  )}
                </motion.div>

                {/* Keyboard hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-8 text-sm text-white/20"
                >
                  Press ESC to exit
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}
