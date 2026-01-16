import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useFocusSettingsContext } from '@/components/focus-lab/FocusSettingsContext'
import { TimerState, TimerPreset, TIMER_PRESETS, FocusedTaskState } from '../types'
import { saveSession, syncFocusHistory } from '../focusStorage'

type UseFocusTimerProps = {
  isFlipped?: boolean
  onTimerComplete?: (minutes: number) => void
  onSessionLogged?: (minutes: number) => void
  focusedTask?: FocusedTaskState
}

export const useFocusTimer = ({
  isFlipped = false,
  onTimerComplete,
  onSessionLogged,
  focusedTask,
}: UseFocusTimerProps = {}) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { settings, updateSettings, isLoaded: isSettingsLoaded } = useFocusSettingsContext()

  // State
  const [activePreset, setActivePreset] = useState<TimerPreset>('focus')
  const [customMinutes, setCustomMinutes] = useState(15)
  const [isEditingCustom, setIsEditingCustom] = useState(false)
  const [isZenMode, setIsZenMode] = useState(false)
  const [zenFocus, setZenFocus] = useState<'task' | 'timer'>('task')

  // Internal Timer State
  // Stopwatch mode: timeLeft = elapsed seconds (counting up)
  // Countdown mode: timeLeft = remaining seconds (counting down)
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.focus.duration)
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [totalAllocatedDuration, setTotalAllocatedDuration] = useState(TIMER_PRESETS.focus.duration)

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTime = useRef<number | null>(null)
  const hasLoggedRef = useRef(false)
  const prevCustomDurationRef = useRef<number | null>(null)
  const hasHydratedCustom = useRef(false)
  const prevModeRef = useRef<'countdown' | 'stopwatch'>('countdown')

  /**
   * Helper: Check if timer is running/paused/completed
   */
  const isRunning = timerState === 'focusing' || timerState === 'break'
  const isPaused = timerState === 'paused-focusing' || timerState === 'paused-break'
  const isCompleted = timerState === 'focus-completed' || timerState === 'break-completed'

  const derivedMode = isFlipped ? 'stopwatch' : 'countdown'

  // Initialize Audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/static/sounds/alarm.mp3')
      audioRef.current.load()
    }
  }, [])

  // Sync Custom Duration from Settings
  useEffect(() => {
    if (!isSettingsLoaded) return
    const storedSeconds = settings.focus_lab?.timer?.custom_duration

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
  }, [isSettingsLoaded, settings.focus_lab?.timer?.custom_duration, customMinutes])

  // Persist Custom Duration
  useEffect(() => {
    if (!hasHydratedCustom.current) return
    const currentStored = settings.focus_lab?.timer?.custom_duration
    const nextSeconds = customMinutes * 60
    if (currentStored === nextSeconds) return

    prevCustomDurationRef.current = nextSeconds
    updateSettings('focus_lab.timer.custom_duration', nextSeconds)
  }, [customMinutes, settings.focus_lab?.timer?.custom_duration, updateSettings])

  // Play Alarm
  const playAlarmSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((e) => console.error('Play alarm failed:', e))
    }
  }, [])

  const finalizeSession = useCallback(
    async ({ completed, elapsedSeconds }: { completed: boolean; elapsedSeconds?: number }) => {
      try {
        if (completed && hasLoggedRef.current) return

        const now = Date.now()
        // Determine resolved elapsed seconds
        let currentElapsed = 0
        if (derivedMode === 'countdown') {
          currentElapsed = Math.max(0, totalAllocatedDuration - timeLeft)
        } else {
          // Stopwatch: timeLeft IS the elapsed time
          currentElapsed = timeLeft
        }

        const resolvedElapsedSeconds =
          typeof elapsedSeconds === 'number' ? elapsedSeconds : currentElapsed

        const durationMinutes = resolvedElapsedSeconds / 60
        if (!completed && durationMinutes < 0.1) return

        const id = crypto.randomUUID ? crypto.randomUUID() : `session-${now}`
        const finalStartTime = startTime.current
          ? startTime.current
          : now - resolvedElapsedSeconds * 1000

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
    [derivedMode, focusedTask?.text, onSessionLogged, timeLeft, totalAllocatedDuration, user]
  )

  // Handle Mode Switching (Flip)
  useEffect(() => {
    if (prevModeRef.current === derivedMode) return
    const previousMode = prevModeRef.current
    prevModeRef.current = derivedMode

    const isFocusActive =
      timerState === 'focusing' ||
      timerState === 'paused-focusing' ||
      timerState === 'focus-completed'

    if (isFocusActive) {
      // Log session if switching modes while active
      const elapsedSeconds =
        previousMode === 'countdown' ? Math.max(0, totalAllocatedDuration - timeLeft) : timeLeft
      finalizeSession({ elapsedSeconds, completed: false })
    }

    // Reset
    hasLoggedRef.current = false
    setTimerState('idle')
    startTime.current = null

    if (derivedMode === 'countdown') {
      const d = activePreset === 'long' ? customMinutes * 60 : TIMER_PRESETS[activePreset].duration
      setTimeLeft(d)
      setTotalAllocatedDuration(d)
    } else {
      // Stopwatch: start at 0
      setTimeLeft(0)
      setTotalAllocatedDuration(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedMode, activePreset, customMinutes])

  // Timer Tick - 使用时间戳计算，解决后台标签页节流问题
  useEffect(() => {
    let interval: NodeJS.Timeout
    let lastTickTime = Date.now()

    if (timerState === 'focusing' || timerState === 'break') {
      interval = setInterval(() => {
        const now = Date.now()
        const elapsedSinceLastTick = Math.round((now - lastTickTime) / 1000)
        lastTickTime = now

        if (derivedMode === 'countdown') {
          setTimeLeft((prev) => {
            const newTime = prev - elapsedSinceLastTick
            if (newTime <= 0) {
              playAlarmSound()
              setTimerState(timerState === 'focusing' ? 'focus-completed' : 'break-completed')
              return 0
            }
            return newTime
          })
        } else {
          // Stopwatch: Count Up - 使用实际经过时间
          setTimeLeft((prev) => prev + elapsedSinceLastTick)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerState, derivedMode, playAlarmSound])

  // 页面可见性变化时校正时间
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (timerState !== 'focusing' && timerState !== 'break') return
    if (!startTime.current) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && startTime.current) {
        const now = Date.now()
        const totalElapsedSeconds = Math.round((now - startTime.current) / 1000)

        if (derivedMode === 'countdown') {
          const newTimeLeft = Math.max(0, totalAllocatedDuration - totalElapsedSeconds)
          setTimeLeft(newTimeLeft)
          if (newTimeLeft <= 0) {
            playAlarmSound()
            setTimerState(timerState === 'focusing' ? 'focus-completed' : 'break-completed')
          }
        } else {
          // Stopwatch: elapsed time
          setTimeLeft(totalElapsedSeconds)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [timerState, derivedMode, totalAllocatedDuration, playAlarmSound])

  // Completion Effect
  useEffect(() => {
    if (timerState === 'focus-completed') {
      if (derivedMode === 'countdown') {
        finalizeSession({ completed: true, elapsedSeconds: totalAllocatedDuration })
        const minutes = Math.floor(totalAllocatedDuration / 60)
        if (onTimerComplete) onTimerComplete(minutes)
      }
    }
  }, [timerState, totalAllocatedDuration, finalizeSession, onTimerComplete, derivedMode])

  // -- Actions --
  const startTimer = useCallback(() => {
    hasLoggedRef.current = false
    startTime.current = Date.now()
    if (timerState === 'idle' || isPaused) {
      setTimerState('focusing')
    }
  }, [timerState, isPaused])

  const pauseTimer = useCallback(() => {
    if (timerState === 'focusing') setTimerState('paused-focusing')
    if (timerState === 'break') setTimerState('paused-break')
  }, [timerState])

  const endSession = useCallback(() => {
    if (timerState === 'focus-completed') {
      // Just reset
    } else if (timerState === 'focusing' || timerState === 'paused-focusing') {
      const elapsed =
        derivedMode === 'countdown' ? Math.max(0, totalAllocatedDuration - timeLeft) : timeLeft
      finalizeSession({ elapsedSeconds: elapsed, completed: false })
    }

    setTimerState('idle')
    startTime.current = null

    if (derivedMode === 'countdown') {
      const baseDuration =
        activePreset === 'long' ? customMinutes * 60 : TIMER_PRESETS[activePreset].duration
      setTimeLeft(baseDuration)
      setTotalAllocatedDuration(baseDuration)
    } else {
      setTimeLeft(0)
      setTotalAllocatedDuration(0)
    }
  }, [
    timerState,
    derivedMode,
    totalAllocatedDuration,
    timeLeft,
    finalizeSession,
    activePreset,
    customMinutes,
  ])

  const continueNewSession = useCallback(() => {
    hasLoggedRef.current = false
    setTimerState('focusing')

    if (derivedMode === 'countdown') {
      const d = activePreset === 'long' ? customMinutes * 60 : TIMER_PRESETS[activePreset].duration
      setTimeLeft(d)
      setTotalAllocatedDuration(d)
    } else {
      // Stopwatch reset to 0
      setTimeLeft(0)
      setTotalAllocatedDuration(0)
    }
    startTime.current = Date.now()
  }, [activePreset, customMinutes, derivedMode])

  // Handle Preset Change (Reset Timer)
  useEffect(() => {
    if (timerState !== 'idle') return
    if (derivedMode === 'countdown') {
      const d = activePreset === 'long' ? customMinutes * 60 : TIMER_PRESETS[activePreset].duration
      setTimeLeft(d)
      setTotalAllocatedDuration(d)
    }
  }, [activePreset, customMinutes, timerState, derivedMode])

  // BuBu Listener
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBuBuTimerControl = (event: Event) => {
      const detail = (event as CustomEvent).detail

      if (detail.mode) {
        if (detail.mode.includes('short')) setActivePreset('short')
        else if (detail.mode.includes('long')) setActivePreset('long')
        else setActivePreset('focus')
      }

      if (detail.duration) {
        if (detail.duration === 5) setActivePreset('short')
        else if (detail.duration === 25) setActivePreset('focus')
        else {
          setActivePreset('long')
          setCustomMinutes(detail.duration)
        }
      }

      // Start Logic
      setTimeout(() => {
        const audio = new Audio('/static/sounds/click.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {})

        hasLoggedRef.current = false
        startTime.current = Date.now()
        setTimerState('focusing')

        let d = 25 * 60
        if (detail.mode?.includes('short') || detail.duration === 5) d = 5 * 60
        else if (detail.duration && detail.duration !== 25) d = detail.duration * 60

        // BuBu implicitly targets countdown mode
        setTimeLeft(d)
        setTotalAllocatedDuration(d)
      }, 100)
    }

    window.addEventListener('bubu-timer-control', handleBuBuTimerControl)
    return () => window.removeEventListener('bubu-timer-control', handleBuBuTimerControl)
  }, [])

  return {
    state: {
      activePreset,
      customMinutes,
      isEditingCustom,
      isZenMode,
      zenFocus,
      timeLeft,
      timerState,
      totalAllocatedDuration,
      isRunning,
      isPaused,
      isCompleted,
    },
    actions: {
      setActivePreset,
      setCustomMinutes,
      setIsEditingCustom,
      setIsZenMode,
      setZenFocus,
      startTimer,
      pauseTimer,
      endSession,
      continueNewSession,
      playAlarmSound,
    },
  }
}

export type UseFocusTimerResult = ReturnType<typeof useFocusTimer>
