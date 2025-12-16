'use client'

export type FocusSession = {
  id: string
  taskName: string | null // null means "General Focus" (default)
  startTime: number // Unix timestamp
  durationMinutes: number
  completed: boolean
}

const STORAGE_KEY = 'focus-lab-history-v1'

export const saveSession = (session: FocusSession) => {
  if (typeof window === 'undefined') return

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)
    let history: FocusSession[] = []
    if (existing) {
      history = JSON.parse(existing)
    }
    history.push(session)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save focus session:', error)
  }
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
