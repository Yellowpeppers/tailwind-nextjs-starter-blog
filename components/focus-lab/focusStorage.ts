'use client'

export type FocusSession = {
  id: string
  taskName: string | null // null means "General Focus" (default)
  startTime: number // Unix timestamp
  durationMinutes: number
  completed: boolean
}

const STORAGE_KEY = 'focus-lab-history-v1'

import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export const saveSession = async (session: FocusSession, user?: User | null) => {
  if (typeof window === 'undefined') return

  // Always save to local storage as backup/latency compensation
  // UPDATE: Only if Guest. If User, Cloud Only.
  if (!user) {
    try {
      const existing = window.localStorage.getItem(STORAGE_KEY)
      let history: FocusSession[] = []
      if (existing) {
        history = JSON.parse(existing)
      }
      history.push(session)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch (error) {
      console.error('Failed to save focus session locally:', error)
    }
  }

  // If logged in, save to Cloud
  if (user) {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('focus_logs').insert({
        user_id: user.id,
        task_name: session.taskName,
        start_time: session.startTime,
        duration_minutes: Math.round(session.durationMinutes),
        completed: session.completed,
      })
      if (error) console.error('Failed to save session to cloud:', error)
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudSessions))
  } catch (e) {
    console.error('Failed to update local history from cloud:', e)
  }

  return cloudSessions
}

export const getHistory = (): FocusSession[] => {
  if (typeof window === 'undefined') return []

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing) {
      return JSON.parse(existing)
    }
  } catch (error) {
    console.error('Failed to read focus history:', error)
  }
  return []
}

// Sync local history to cloud
export const syncFocusHistory = async (user: User) => {
  if (typeof window === 'undefined') return

  try {
    const localHistory = getHistory()
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

export const getTodaySessions = (): FocusSession[] => {
  const all = getHistory()
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  return all.filter((s) => s.startTime >= startOfDay)
}

export const getTodayFocusMinutes = (): number => {
  const sessions = getTodaySessions()
  return sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0)
}
