import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useFocusSettingsContext } from '@/components/focus-lab/FocusSettingsContext'
import { TimerState, TimerPreset, TIMER_PRESETS, FocusedTaskState } from '../types'
import { saveSession, syncFocusHistory } from '../focusStorage'

type UseFocusTimerProps = {
  activePreset?: TimerPreset
  customMinutes?: number
  onTimerComplete?: (minutes: number) => void
  onSessionLogged?: (minutes: number) => void
  focusedTask?: FocusedTaskState
}

export const useFocusTimer = ({
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
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.focus.duration)
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [totalAllocatedDuration, setTotalAllocatedDuration] = useState(TIMER_PRESETS.focus.duration)

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTime = useRef<number | null>(null)
  const hasLoggedRef = useRef(false)
  const prevCustomDurationRef = useRef<number | null>(null)
  const hasHydratedCustom = useRef(false) // Track if we've loaded custom minutes from settings

  /**
   * Helper: Check if timer is running/paused/completed
   */
  const isRunning = timerState === 'focusing' || timerState === 'break'
  const isPaused = timerState === 'paused-focusing' || timerState === 'paused-break'
  const isCompleted = timerState === 'focus-completed' || timerState === 'break-completed'

  // Initialize Audio
  useEffect(() => {
    // Only client-side
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
        // Note: derivedMode logic was in component. Here we assume countdown unless stated otherwise.
        // We might need to accept 'mode' as argument if we support Stopwatch.
        // For now, let's assume standard countdown logic first.
        // If we want to support Stopwatch, we need 'isStopwatch' state or prop.
        const currentElapsed = Math.max(0, totalAllocatedDuration - timeLeft)
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
    [focusedTask?.text, onSessionLogged, timeLeft, totalAllocatedDuration, user]
  )

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerState === 'focusing' || timerState === 'break') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playAlarmSound()
            setTimerState(timerState === 'focusing' ? 'focus-completed' : 'break-completed')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerState, playAlarmSound])

  // Completion Effect
  useEffect(() => {
    if (timerState === 'focus-completed') {
      finalizeSession({ completed: true, elapsedSeconds: totalAllocatedDuration })
      const minutes = Math.floor(totalAllocatedDuration / 60)
      if (onTimerComplete) onTimerComplete(minutes)
    }
  }, [timerState, totalAllocatedDuration, finalizeSession, onTimerComplete])

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
      const elapsed = Math.max(0, totalAllocatedDuration - timeLeft)
      finalizeSession({ elapsedSeconds: elapsed, completed: false })
    }

    setTimerState('idle')
    startTime.current = null
    const baseDuration =
      activePreset === 'long' ? customMinutes * 60 : TIMER_PRESETS[activePreset].duration
    setTimeLeft(baseDuration)
    setTotalAllocatedDuration(baseDuration)
  }, [timerState, totalAllocatedDuration, timeLeft, finalizeSession, activePreset, customMinutes])

  const continueNewSession = useCallback(() => {
    hasLoggedRef.current = false
    setTimerState('focusing')
    const d = activePreset === 'long' ? customMinutes * 60 : TIMER_PRESETS[activePreset].duration
    setTimeLeft(d)
    setTotalAllocatedDuration(d)
    startTime.current = Date.now()
  }, [activePreset, customMinutes])

  // Handle Preset Change (Reset Timer)
  useEffect(() => {
    if (timerState !== 'idle') return
    const d = activePreset === 'long' ? customMinutes * 60 : TIMER_PRESETS[activePreset].duration
    setTimeLeft(d)
    setTotalAllocatedDuration(d)
  }, [activePreset, customMinutes, timerState])

  // BuBu Listener
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBuBuTimerControl = (event: Event) => {
      const detail = (event as CustomEvent).detail
      console.log('[TimerHook] Received BuBu command:', detail)

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
        // Play sound manually if needed or leave to UI?
        // The original code played sound here.
        const audio = new Audio('/static/sounds/click.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {})

        hasLoggedRef.current = false
        startTime.current = Date.now()
        setTimerState('focusing')

        // Force update timeleft immediately to match preset
        let d = 25 * 60
        if (detail.mode?.includes('short') || detail.duration === 5) d = 5 * 60
        else if (detail.duration && detail.duration !== 25) d = detail.duration * 60

        setTimeLeft(d)
        setTotalAllocatedDuration(d)
      }, 100)
    }

    window.addEventListener('bubu-timer-control', handleBuBuTimerControl)
    return () => window.removeEventListener('bubu-timer-control', handleBuBuTimerControl)
  }, []) // Empty deps for listener

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
      playAlarmSound, // Exposing just in case
    },
  }
}

export type UseFocusTimerResult = ReturnType<typeof useFocusTimer>
