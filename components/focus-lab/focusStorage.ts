'use client'

export type FocusSession = {
  id: string
  taskName: string | null // null means "General Focus" (default)
  startTime: number // Unix timestamp
  durationMinutes: number
  completed: boolean
}

const STORAGE_KEY = 'focus-lab-history-v1'

const getStorageKey = (userId?: string) => (userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY)

import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export const saveSession = async (session: FocusSession, user?: User | null) => {
  if (typeof window === 'undefined') return

  // Always save to local storage as backup/latency compensation, scoped to user
  try {
    const key = getStorageKey(user?.id)
    const existing = window.localStorage.getItem(key)
    let history: FocusSession[] = []
    if (existing) {
      history = JSON.parse(existing)
    }
    history.push(session)
    window.localStorage.setItem(key, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save focus session locally:', error)
  }

  // If logged in, save to Cloud
  if (user) {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('focus_logs').upsert(
        {
          id: session.id,
          user_id: user.id,
          task_name: session.taskName,
          start_time: session.startTime,
          duration_minutes: Math.round(session.durationMinutes),
          completed: session.completed,
        },
        { onConflict: 'id' }
      )

      if (error) console.error('Failed to save session to cloud:', error?.message || error)
    } catch (error) {
      console.error('Supabase error:', error)
    }
  }
}

// Fetch history from cloud and merge/overwrite local
export const fetchCloudHistory = async (user: User): Promise<FocusSession[]> => {
  if (typeof window === 'undefined') return []
  const supabase = createClient()

  const { data, error } = await supabase
    .from('focus_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Fetch cloud history error:', error.message)
    return []
  }

  if (!data) return []

  const cloudSessions: FocusSession[] = data.map((d) => ({
    id: d.id,
    taskName: d.task_name,
    startTime: d.start_time,
    durationMinutes: Number(d.duration_minutes),
    completed: d.completed,
  }))

  // Save to local storage to keep "Local First" architecture consistent
  // We can treat Cloud as source of truth here because logs are append-only mostly.
  try {
    window.localStorage.setItem(getStorageKey(user.id), JSON.stringify(cloudSessions))
  } catch (e) {
    console.error('Failed to update local history from cloud:', e)
  }

  return cloudSessions
}

export const getHistory = (userId?: string): FocusSession[] => {
  if (typeof window === 'undefined') return []

  try {
    const key = getStorageKey(userId)
    const existing = window.localStorage.getItem(key)

    let scoped: FocusSession[] = []
    if (existing) {
      scoped = JSON.parse(existing)
    }

    // Merge legacy guest history into user-scoped key to avoid losing old sessions after login
    if (userId) {
      const legacy = window.localStorage.getItem(STORAGE_KEY)
      if (legacy) {
        const legacySessions: FocusSession[] = JSON.parse(legacy)
        const byId = new Map(scoped.map((s) => [s.id, s]))
        let hasNew = false
        for (const session of legacySessions) {
          if (!byId.has(session.id)) {
            byId.set(session.id, session)
            hasNew = true
          }
        }
        const merged = Array.from(byId.values())
        if (hasNew) {
          window.localStorage.setItem(key, JSON.stringify(merged))
        }
        return merged
      }
    }

    return scoped
  } catch (error) {
    console.error('Failed to read focus history:', error)
  }
  return []
}

// Sync local history to cloud
export const syncFocusHistory = async (user: User) => {
  if (typeof window === 'undefined') return

  try {
    const localHistory = getHistory(user.id)
    if (localHistory.length === 0) return

    const supabase = createClient()

    // Convert to DB format
    // We use upsert to avoid duplicates if run multiple times
    const records = localHistory.map((s) => ({
      id: s.id, // Ensure we use the same ID
      user_id: user.id,
      task_name: s.taskName,
      start_time: s.startTime,
      duration_minutes: Math.round(s.durationMinutes),
      completed: s.completed,
    }))

    // Batch insert/upsert
    // Supabase allows batch upsert
    const { error } = await supabase.from('focus_logs').upsert(records, { onConflict: 'id' })

    if (error) {
      console.error('Focus history sync error:', error.message || error)
    } else {
      console.log(`Synced ${records.length} focus sessions to cloud`)
    }
  } catch (e) {
    console.error('Failed to sync focus history:', e)
  }
}

export const getTodaySessions = (userId?: string): FocusSession[] => {
  const all = getHistory(userId)
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  return all.filter((s) => s.startTime >= startOfDay)
}

export const getTodayFocusMinutes = (userId?: string): number => {
  const sessions = getTodaySessions(userId)
  return sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0)
}

export const getStreak = (userId?: string): number => {
  const all = getHistory(userId).sort((a, b) => b.startTime - a.startTime)
  if (all.length === 0) return 0

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const oneDay = 86400000

  let streak = 0
  let currentDate = today

  // Check if there are sessions today (or if it's still "today")
  const todaySessions = all.filter((s) => s.startTime >= today)
  if (todaySessions.length === 0) {
    // If no sessions today, check if there was one yesterday to keep streak alive
    currentDate -= oneDay
  }

  while (true) {
    const daySessions = all.filter(
      (s) => s.startTime >= currentDate && s.startTime < currentDate + oneDay
    )
    if (daySessions.length > 0) {
      streak++
      currentDate -= oneDay
    } else {
      break
    }
  }

  return streak
}

export type LevelInfo = {
  level: number
  xp: number
  nextLevelXp: number
  percentage: number
  totalMinutes: number
}

export const getLevelInfo = (userId?: string): LevelInfo => {
  const all = getHistory(userId)
  const totalMinutes = all.reduce((acc, c) => acc + c.durationMinutes, 0)

  // Experience curve: 100 mins per level for the first 5 levels, then 200, then 500 etc.
  // Let's keep it simple: 100 mins per level.
  const xpPerLevel = 100
  const level = Math.floor(totalMinutes / xpPerLevel) + 1
  const xp = totalMinutes % xpPerLevel
  const percentage = (xp / xpPerLevel) * 100

  return {
    level,
    xp,
    nextLevelXp: xpPerLevel,
    percentage,
    totalMinutes,
  }
}
