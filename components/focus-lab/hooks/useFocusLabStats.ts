'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { getTodayFocusMinutes, getStreak } from '@/components/focus-lab/focusStorage'
import { readStationStorage, FocusItem } from '@/components/focus-lab/focusStationStorage'

export interface FocusLabStatsState {
  // Focus Time
  todayMinutes: number
  currentProgressHours: number
  // Goals
  dailyGoalHours: number
  dailyTaskGoal: number
  tempGoalHours: string
  tempTaskGoal: string
  // Progress
  progressPercentage: number
  taskProgressPercentage: number
  // Tasks
  tasksCompletedToday: number
  // Streak
  streak: number
  // Reward
  rewardUnlocked: boolean
}

export interface FocusLabStatsActions {
  setDailyGoalHours: (value: number) => void
  setDailyTaskGoal: (value: number) => void
  setTempGoalHours: (value: string) => void
  setTempTaskGoal: (value: string) => void
  refreshStats: () => void
  handleGoalSave: (callback?: () => void) => void
}

interface UseFocusLabStatsOptions {
  userId?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateSettings?: (key: string, value: any) => void
  initialGoalHours?: number
  initialTaskGoal?: number
}

/**
 * Hook for managing FocusLab statistics and goals
 */
export const useFocusLabStats = (options: UseFocusLabStatsOptions = {}) => {
  const { userId, settings, updateSettings, initialGoalHours = 4.5, initialTaskGoal = 5 } = options

  // Goals state
  const [dailyGoalHours, setDailyGoalHours] = useState(initialGoalHours)
  const [dailyTaskGoal, setDailyTaskGoal] = useState(initialTaskGoal)
  const [tempGoalHours, setTempGoalHours] = useState(initialGoalHours.toString())
  const [tempTaskGoal, setTempTaskGoal] = useState(initialTaskGoal.toString())

  // Stats state
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [tasksCompletedToday, setTasksCompletedToday] = useState(0)
  const [streak, setStreak] = useState(0)

  const prevGoalRef = useRef<{ hours?: number; tasks?: number }>({})
  const hasHydratedGoals = useRef(false)

  // Load / Refresh stats
  const refreshStats = useCallback(async () => {
    const minutes = await getTodayFocusMinutes(userId)
    setTodayMinutes(minutes)

    const currentStreak = await getStreak(userId)
    setStreak(currentStreak)

    // Get tasks completed today using Station Storage
    const items = readStationStorage(userId)
    const now = new Date()
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    const done = items.filter((item: FocusItem) => {
      if (!item.completed) return false
      if (typeof item.completed_at !== 'number') return false
      return item.completed_at >= dayStart
    })
    setTasksCompletedToday(done.length)
  }, [userId])

  // Initial load
  useEffect(() => {
    refreshStats()
    // Poll every minute
    const interval = setInterval(refreshStats, 60000)
    return () => clearInterval(interval)
  }, [refreshStats])

  // Hydrate goals from settings
  useEffect(() => {
    if (!settings || !settings.focus_lab?.stats) return

    const storedHours = settings.focus_lab.stats.goal_hours
    const storedTasks = settings.focus_lab.stats.goal_tasks

    if (typeof storedHours === 'number' && storedHours !== prevGoalRef.current.hours) {
      // Only update if significantly different
      if (Math.abs(storedHours - dailyGoalHours) > 0.01) {
        setDailyGoalHours(storedHours)
        // Also update temp
        setTempGoalHours(storedHours.toString())
      }
      prevGoalRef.current.hours = storedHours
    }
    if (typeof storedTasks === 'number' && storedTasks !== prevGoalRef.current.tasks) {
      if (storedTasks !== dailyTaskGoal) {
        setDailyTaskGoal(storedTasks)
        setTempTaskGoal(storedTasks.toString())
      }
      prevGoalRef.current.tasks = storedTasks
    }

    if (storedHours !== undefined || storedTasks !== undefined) {
      hasHydratedGoals.current = true
    }
  }, [settings, dailyGoalHours, dailyTaskGoal])

  // Computed values
  const currentProgressHours = useMemo(() => todayMinutes / 60, [todayMinutes])

  const progressPercentage = useMemo(() => {
    return dailyGoalHours > 0 ? Math.min((todayMinutes / (dailyGoalHours * 60)) * 100, 100) : 0
  }, [todayMinutes, dailyGoalHours])

  const taskProgressPercentage = useMemo(() => {
    return dailyTaskGoal > 0 ? Math.min((tasksCompletedToday / dailyTaskGoal) * 100, 100) : 0
  }, [tasksCompletedToday, dailyTaskGoal])

  const rewardUnlocked = useMemo(() => {
    const isGoalReached = dailyGoalHours > 0 && currentProgressHours >= dailyGoalHours
    const isTaskGoalReached = dailyTaskGoal > 0 && tasksCompletedToday >= dailyTaskGoal
    return isGoalReached || isTaskGoalReached
  }, [dailyGoalHours, currentProgressHours, dailyTaskGoal, tasksCompletedToday])

  const handleGoalSave = useCallback(
    (callback?: () => void) => {
      const hoursVal = Math.max(0.5, parseFloat(tempGoalHours) || dailyGoalHours)
      const tasksVal = Math.max(0, Math.round(parseFloat(tempTaskGoal) || dailyTaskGoal))

      setDailyGoalHours(hoursVal)
      setDailyTaskGoal(tasksVal)

      if (updateSettings) {
        updateSettings('focus_lab.stats.goal_hours', hoursVal)
        updateSettings('focus_lab.stats.goal_tasks', tasksVal)
      }

      prevGoalRef.current.hours = hoursVal
      prevGoalRef.current.tasks = tasksVal

      callback?.()
    },
    [tempGoalHours, tempTaskGoal, dailyGoalHours, dailyTaskGoal, updateSettings]
  )

  // Sync temp values when goal changes (from hydration)
  // NOTE: We already handle this in the hydration effect to separate logic,
  // but explicit sync might be needed if state changes via setter.
  // However, since temp state is local to modal usually, we sync it only when opening modal?
  // In this hook, we keep temp state always in sync or independent?
  // In `FocusLabApp`, `setTempGoalHours` was called when `showGoalModal` became true.
  // Here we expose `setTempGoal` actions, so the UI can call them.
  // We initialize temp with current state.

  const state: FocusLabStatsState = {
    todayMinutes,
    currentProgressHours,
    dailyGoalHours,
    dailyTaskGoal,
    tempGoalHours,
    tempTaskGoal,
    progressPercentage,
    taskProgressPercentage,
    tasksCompletedToday,
    streak,
    rewardUnlocked,
  }

  const actions: FocusLabStatsActions = {
    setDailyGoalHours,
    setDailyTaskGoal,
    setTempGoalHours,
    setTempTaskGoal,
    refreshStats,
    handleGoalSave,
  }

  return { state, actions, hasHydratedGoals }
}
