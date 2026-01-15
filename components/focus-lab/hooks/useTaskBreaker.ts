import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { readStationStorage, saveStationItems, createFocusItem } from '../focusStationStorage'

export const useTaskBreaker = (onViewChange?: (isResult: boolean) => void) => {
  const { t } = useTranslation()
  const { user } = useAuth()

  // State
  const [task, setTask] = useState('')
  const [visibleSteps, setVisibleSteps] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTransferring, setIsTransferring] = useState(false)
  const [hasTransferred, setHasTransferred] = useState(false)
  const [transferStatus, setTransferStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Result View state can be managed by parent (Widget) or here?
  // Original code had `isResultView` prop passed to Widget, and `onViewChange`.
  // It seems `FocusLabApp` didn't manage this state, `TaskBreakerCard` did?
  // Wait, `TaskBreakerCard` (FocusLabApp line 2228) just managed `onViewChange={setIsFlipped}`?
  // Wait, `TaskBreakerCard` wrapped `TaskBreakerWidget`.
  // Let's check `TaskBreakerCard` (I haven't extracted it yet).
  // Usually logic like "Is showing result" is internal unless it affects flipping.
  // In `FocusLabApp`, `TaskBreakerCard` handles flipping.
  // `TaskBreakerCard` (line 2228 in Step 148 view? No, I need to check it.)
  // If I need to flip the card when breaking down, `onViewChange` callback is needed.

  // Timers ref
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((timer) => clearTimeout(timer))
    timeoutsRef.current = []
  }, [])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  const handleBreakDown = useCallback(async () => {
    if (!task.trim()) return
    clearTimers()
    setIsLoading(true)
    onViewChange?.(true) // Flip to back/result view
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

      // Staggered reveal
      steps.forEach((step: string, index: number) => {
        const timer = setTimeout(() => {
          setVisibleSteps((prev) => [...prev, step])
        }, index * 500)
        timeoutsRef.current.push(timer)
      })
    } catch (err) {
      setIsLoading(false)
      setError(t.focusLab.widgets.taskBreaker.failed)
      // Fallback to mock data
      const fallbackSteps = t.focusLab.widgets.taskBreaker.mockSteps
      fallbackSteps.forEach((step: string, index: number) => {
        // mockSteps is string[]
        const timer = setTimeout(() => {
          setVisibleSteps((prev) => [...prev, step])
        }, index * 500)
        timeoutsRef.current.push(timer)
      })
    }
  }, [task, t, onViewChange, clearTimers])

  const handleTransferToTodo = useCallback(() => {
    if (visibleSteps.length === 0 || isLoading || isTransferring || hasTransferred) return
    setIsTransferring(true)
    try {
      const existingItems = readStationStorage(user?.id)
      const newItems = visibleSteps.map((step) => createFocusItem('text', step))

      // Combine and sort: Active first, then Completed
      const combined = [...existingItems, ...newItems]
      const active = combined.filter((t) => !t.completed)
      const completed = combined.filter((t) => t.completed)

      saveStationItems([...active, ...completed], user)
      setTransferStatus('success')
      setHasTransferred(true)
    } catch (err) {
      console.error('Failed to transfer AI steps to Focus Station:', err)
      setTransferStatus('error')
    } finally {
      setIsTransferring(false)
    }
  }, [visibleSteps, isLoading, isTransferring, hasTransferred, user])

  const handleReset = useCallback(() => {
    clearTimers()
    setTask('')
    setVisibleSteps([])
    onViewChange?.(false) // Flip back
    setIsLoading(false)
    setError(null)
    setHasTransferred(false)
    setTransferStatus('idle')
    setIsTransferring(false)
  }, [clearTimers, onViewChange])

  return {
    state: {
      task,
      visibleSteps,
      isLoading,
      error,
      isTransferring,
      hasTransferred,
      transferStatus,
    },
    actions: {
      setTask,
      handleBreakDown,
      handleTransferToTodo,
      handleReset,
    },
  }
}

export type UseTaskBreakerResult = ReturnType<typeof useTaskBreaker>
