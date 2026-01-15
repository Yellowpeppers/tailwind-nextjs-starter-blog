import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useFocusSettingsContext } from '@/components/focus-lab/FocusSettingsContext'
import { useCelebration } from '@/components/focus-lab/useCelebration'
import { readStationStorage, FocusItem } from '../focusStationStorage'
import { getStreak, getTodayFocusMinutes } from '../focusStorage'
import { FocusedTaskState } from '../types'

export const useToDoManager = () => {
  const { user } = useAuth()
  const { settings, updateSettings } = useFocusSettingsContext()
  const { celebrate } = useCelebration()

  const [toDoItems, setToDoItems] = useState<FocusItem[]>([])
  const [focusedTask, setFocusedTask] = useState<FocusedTaskState>(null)

  // Stats
  const [todayCompletedCount, setTodayCompletedCount] = useState(0)
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [streak, setStreak] = useState(0)

  // Goals
  const [dailyGoalHours, setDailyGoalHours] = useState(4)
  const [dailyTaskGoal, setDailyTaskGoal] = useState(8)
  const prevGoalRef = useRef({ hours: 4, tasks: 8 })
  const hasHydratedGoals = useRef(false)

  // -- Handlers --

  const handleStartFocus = useCallback((taskText: string, id: string) => {
    setFocusedTask({ text: taskText, timestamp: Date.now(), id })
  }, [])

  const handleTaskComplete = useCallback(() => {
    setTodayCompletedCount((prev) => prev + 1)
    celebrate()
  }, [celebrate])

  // -- Effects --

  const refreshTodayProgress = useCallback(() => {
    const mins = getTodayFocusMinutes(user?.id)
    setTodayMinutes(mins)

    const dayStart = new Date().setHours(0, 0, 0, 0)

    const computeToday = (items: FocusItem[]) => {
      const done = items.filter((item) => {
        if (!item.completed) return false
        if (typeof item.completed_at === 'number' && item.completed_at >= dayStart) {
          return true
        }
        return false
      })
      setTodayCompletedCount(done.length)
    }

    const items = readStationStorage(user?.id)
    computeToday(items)
  }, [user?.id])

  useEffect(() => {
    refreshTodayProgress()
    setStreak(getStreak(user?.id))

    const interval = setInterval(() => {
      refreshTodayProgress()
      setStreak(getStreak(user?.id))
    }, 60000)
    return () => clearInterval(interval)
  }, [refreshTodayProgress, user?.id])

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
      prevGoalRef.current = { hours: storedHours || 4, tasks: storedTasks || 8 }
    }
  }, [settings.focus_lab?.stats?.goal_hours, settings.focus_lab?.stats?.goal_tasks])

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

  return {
    state: {
      toDoItems,
      focusedTask,
      todayCompletedCount,
      todayMinutes,
      streak,
      dailyGoalHours,
      dailyTaskGoal,
    },
    actions: {
      setToDoItems,
      setFocusedTask,
      setDailyGoalHours,
      setDailyTaskGoal,
      handleStartFocus,
      handleTaskComplete,
      refreshTodayProgress,
    },
  }
}

export type UseToDoManagerResult = ReturnType<typeof useToDoManager>
