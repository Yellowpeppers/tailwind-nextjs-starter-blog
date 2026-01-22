'use client'

import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'
import { usePathname, useRouter } from 'next/navigation'

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
import { useFocusLabLayout } from '@/components/focus-lab/hooks/useFocusLabLayout'
import { useFocusLabStats } from '@/components/focus-lab/hooks/useFocusLabStats'
import dynamic from 'next/dynamic'
// Dynamic import for BuBu to reduce initial bundle size
const BuBu = dynamic(() => import('@/components/focus-lab/BuBu').then((mod) => mod.BuBu), {
  ssr: false,
})

import {
  StatsIcon,
  CrownIcon,
  SettingsIcon,
  StarIcon,
  LogoutIcon,
  HelpIcon,
  TranslateIcon,
} from '@/components/focus-lab/icons'
import {
  GreetingInfo,
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
import { GoalSettingsModal } from '@/components/focus-lab/modals/GoalSettingsModal'
import { FocusLabSettingsModal } from '@/components/focus-lab/modals/FocusLabSettingsModal'
import { ResetConfirmModal } from '@/components/focus-lab/modals/ResetConfirmModal'

// Migrated Cards
import { SonicShieldCard } from '@/components/focus-lab/widgets/cards/SonicShieldCard'
import { TimerCard } from '@/components/focus-lab/widgets/cards/TimerCard'
import { BrainDumpCard } from '@/components/focus-lab/widgets/cards/BrainDumpCard'
import { TaskBreakerCard } from '@/components/focus-lab/widgets/cards/TaskBreakerCard'
import { DopamineMenuCard } from '@/components/focus-lab/widgets/cards/DopamineMenuCard'
import { ToDoCard } from '@/components/focus-lab/widgets/cards/ToDoCard'

const FocusLabMobileGrid = ({
  focusedTask,
  onStartFocusAction,
  externalCommand,
  onCommandHandledAction,
  onSessionLoggedAction,
  onTimerCompleteAction,
  onTaskCompleteAction,
}: {
  focusedTask?: FocusedTaskState
  onStartFocusAction?: (task: string, id: string) => void
  externalCommand?: string | null
  onCommandHandledAction?: () => void
  onSessionLoggedAction?: (minutes: number) => void
  onTimerCompleteAction?: (minutes: number) => void
  onTaskCompleteAction?: () => void
}) => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-5 pb-16">
      <SonicShieldCard className="h-auto" />
      <TimerCard
        className="h-auto"
        focusedTask={focusedTask}
        externalCommand={externalCommand}
        onCommandHandledAction={onCommandHandledAction}
        onSessionLoggedAction={onSessionLoggedAction}
        onTimerCompleteAction={onTimerCompleteAction}
      />
      <BrainDumpCard className="h-auto" />
      <ToDoCard
        className="h-auto"
        onStartFocusAction={onStartFocusAction}
        focusedTaskId={focusedTask?.id}
        onTaskCompleteAction={onTaskCompleteAction}
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
  const pathname = usePathname()
  const router = useRouter()

  const { settings, updateSettings, isLoaded: isSettingsLoaded } = useFocusSettingsContext()
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
  // Hooks Integration: Layout
  const { state: layoutState, actions: layoutActions } = useFocusLabLayout({
    settings,
    updateSettings,
    isSettingsLoaded,
  })
  const { layoutsByPreset, activePreset, hiddenByPreset, isLayoutLocked, columns } = layoutState
  const {
    setActivePreset,
    handleResetLayout: performResetLayoutAction,
    setIsLayoutLocked,
  } = layoutActions
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

  // Hooks Integration: Stats
  const [showGoalModal, setShowGoalModal] = useState(false)

  const {
    state: statsState,
    actions: statsActions,
    hasHydratedGoals,
  } = useFocusLabStats({
    userId: user?.id,
    settings,
    updateSettings,
  })

  const {
    todayMinutes,
    tasksCompletedToday: todayCompletedCount,
    tasksCompletedToday, // Expose raw name too just in case
    dailyGoalHours,
    dailyTaskGoal,
    tempGoalHours,
    tempTaskGoal,
    currentProgressHours,
    progressPercentage,
    taskProgressPercentage,
    rewardUnlocked,
    streak,
  } = statsState

  const {
    setDailyGoalHours,
    setDailyTaskGoal,
    setTempGoalHours,
    setTempTaskGoal,
    handleGoalSave: saveGoals,
    refreshStats: refreshTodayProgress,
  } = statsActions

  const lastResetTime = useRef(0)

  const { startTour, destroyTour } = useFocusTour() // Initialize tour hook

  // 当 AuthModal 打开时销毁 Tour 以避免 z-index 冲突
  useEffect(() => {
    if (showAuthModal) {
      destroyTour()
    }
  }, [showAuthModal, destroyTour])

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

  // Handlers Adapters (Hook Integration)
  const handleSessionLogged = useCallback(
    (mins: number) => {
      refreshTodayProgress()
    },
    [refreshTodayProgress]
  )

  const handleTaskComplete = useCallback(() => {
    refreshTodayProgress()
    triggerEncouragement()
  }, [triggerEncouragement, refreshTodayProgress])

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

  useEffect(() => {
    setGreeting(computeGreeting(lang, displayName))
    const interval = setInterval(() => setGreeting(computeGreeting(lang, displayName)), 60000)
    return () => clearInterval(interval)
  }, [lang, displayName])

  // Track completed tasks from Focus Station (today)
  useEffect(() => {
    // Sync logic handled by hook + event listener
    const handler = () => refreshTodayProgress()
    window.addEventListener(STATION_SYNC_EVENT, handler)
    return () => window.removeEventListener(STATION_SYNC_EVENT, handler)
  }, [refreshTodayProgress])

  // Stats computed values provided by Hook
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

  const hasCelebratedRef = useRef(false)

  useEffect(() => {
    if (rewardUnlocked && hasHydratedGoals.current && !hasCelebratedRef.current) {
      triggerCelebration({ variant: 'fireworks', spread: 110, particleCount: 140 })
      hasCelebratedRef.current = true
    } else if (!rewardUnlocked) {
      hasCelebratedRef.current = false
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
      refreshTodayProgress()
      setTempGoalHours(dailyGoalHours.toString())
      setTempTaskGoal(dailyTaskGoal.toString())
      preloadCelebration()
    }
  }, [showGoalModal, dailyGoalHours, dailyTaskGoal, preloadCelebration, refreshTodayProgress])

  const handleGoalModalSave = () => {
    saveGoals()
    setShowGoalModal(false)
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
        brain.items.length > 0 ||
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

      if (localBrain.items.length > 0) {
        // Merge with cloud brain items
        const mergedItems = [
          ...(cloudBrain?.items || []),
          ...localBrain.items.map((i) => ({ ...i, id: crypto.randomUUID() })),
        ]
        await saveBrainDump({ items: mergedItems }, user)
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

  // Adapter Handlers

  const handleResetLayout = useCallback(() => {
    performResetLayoutAction()
    // Force remount RGL
    setLayoutKey((prev) => prev + 1)
    setShowResetConfirm(false)
  }, [performResetLayoutAction])

  const handleLayoutChange = layoutActions.handleLayoutChange
  const handleToggleHidden = layoutActions.handleToggleHidden

  const handleRemoveItem = useCallback(
    (preset: LayoutPreset, id: string) => {
      const current = layoutsByPreset[preset] || []
      const next = current.filter((item) => item.id !== id)
      layoutActions.handleLayoutChange(preset, next)
    },
    [layoutsByPreset, layoutActions]
  )

  const hiddenCards = useMemo(() => {
    return hiddenByPreset[activePreset] || new Set()
  }, [hiddenByPreset, activePreset])

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

      <GoalSettingsModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        tempGoalHours={tempGoalHours}
        tempTaskGoal={tempTaskGoal}
        onTempGoalHoursChange={setTempGoalHours}
        onTempTaskGoalChange={setTempTaskGoal}
        currentProgressHours={currentProgressHours}
        progressPercentage={progressPercentage}
        tasksCompletedToday={tasksCompletedToday}
        taskProgressPercentage={taskProgressPercentage}
        streak={streak}
        rewardUnlocked={rewardUnlocked}
        onSave={handleGoalModalSave}
      />
      <AnimatePresence>
        {showAnalytics && (
          <AnalyticsModal
            onClose={() => setShowAnalytics(false)}
            isPro={isPro}
            onUpgrade={() => {
              setShowAnalytics(false)
              setShowPricingModal(true)
            }}
            onLogin={() => {
              setShowAnalytics(false)
              setAuthTrigger('generic')
              setShowAuthModal(true)
            }}
          />
        )}
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

      <FocusLabSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        updateSettings={updateSettings}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
        activePreset={activePreset}
        hiddenByPreset={hiddenByPreset}
        onToggleHidden={handleToggleHidden}
        onResetLayout={() => setShowResetConfirm(true)}
      />

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
                  <FocusSidebarAction
                    id="sidebar-language"
                    icon={<TranslateIcon className="h-6 w-6" />}
                    label={lang === 'zh' ? 'English' : '切换中文'}
                    onClick={() => {
                      const newLang = lang === 'en' ? 'zh' : 'en'
                      const newPath = pathname.replace(`/${lang}`, `/${newLang}`)
                      router.push(newPath)
                    }}
                  />
                  {lang === 'zh' && (
                    <FocusSidebarAction
                      icon={<span className="icon-[solar--chat-round-dots-bold-duotone] h-6 w-6" />}
                      label="加入群聊"
                      onClick={() => setShowWeChatModal(true)}
                    />
                  )}
                  {user && (
                    <>
                      <div className="my-1 h-2" aria-hidden />
                      <FocusSidebarAction
                        icon={<CrownIcon className="h-6 w-6 text-amber-500" />}
                        label={upgradeLabel}
                        onClick={() => setShowPricingModal(true)}
                      />
                    </>
                  )}
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newLang = lang === 'en' ? 'zh' : 'en'
                        // Replace the first occurrence of the current lang in the path
                        // This assumes the path starts with /en or /zh
                        const newPath = pathname.replace(`/${lang}`, `/${newLang}`)
                        router.push(newPath)
                      }}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      {lang === 'en' ? '中文' : 'En'}
                    </button>
                    <button
                      onClick={onExitAction}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      {lang === 'zh' ? '退出' : 'Exit'}
                    </button>
                  </div>
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
                      onStartFocusAction={(task, id) => {
                        if (focusedTask?.id === id) {
                          setFocusedTask(null)
                        } else {
                          setFocusedTask({ text: task, id, timestamp: Date.now() })
                        }
                        // setExternalCommand('start-focus') // Removed auto-start
                      }}
                      externalCommand={externalCommand}
                      onCommandHandledAction={() => setExternalCommand(null)}
                      onSessionLoggedAction={handleSessionLogged}
                      onTimerCompleteAction={refreshTodayProgress}
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
                              onCommandHandledAction={() => setExternalCommand(null)}
                              onSessionLoggedAction={handleSessionLogged}
                              onTimerCompleteAction={handleTimerComplete}
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
                              onStartFocusAction={(task, id) => {
                                if (focusedTask?.id === id) {
                                  setFocusedTask(null)
                                } else {
                                  setFocusedTask({ text: task, id, timestamp: Date.now() })
                                }
                              }}
                              focusedTaskId={focusedTask?.id}
                              onTaskCompleteAction={handleTaskComplete}
                            />
                          )
                        }
                        if (item.id === 'breaker') {
                          return (
                            <TaskBreakerCard
                              className="h-full w-full"
                              isFocused={isFocused}
                              onLogin={() => {
                                setAuthTrigger('generic')
                                setShowAuthModal(true)
                              }}
                            />
                          )
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
      <ResetConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetLayout}
      />

      {/* Encouragement Toast */}
      {/* Encouragement Toast */}
      {encouragementMessage && (
        <EncouragementToast
          message={encouragementMessage}
          onClose={() => setEncouragementMessage(null)}
        />
      )}
      {/* BuBu AI Assistant */}
      <BuBu
        stats={{ todayMinutes, completedTaskCount: todayCompletedCount }}
        isPro={isPro}
        onUpgrade={() => setShowPricingModal(true)}
        onLogin={() => {
          setAuthTrigger('generic')
          setShowAuthModal(true)
        }}
      />
    </>
  )
}
