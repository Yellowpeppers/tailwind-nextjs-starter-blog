export type CardAnimationPreset = 'float' | 'slide' | 'scale'
export type CardSurface = 'solid' | 'glass'

export type SoundOption = {
  id: string
  name: string
  path: string
  detail: string
}

export type GreetingInfo = {
  title: string
  subtitle: string
  iconClass: string
  emoji: string
}

export type ActiveTrack = {
  id: string
  volume: number
  isPlaying: boolean
}

export type GridItem = {
  id: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

export type LayoutPreset = 'desktop' | 'triple' | 'double'

export type FocusedTaskState = { text: string; timestamp: number; id: string } | null

/**
 * Timer State Machine:
 * - idle: Initial/Standby
 * - focusing: Active (Countdown or Stopwatch)
 * - paused-focusing: Paused during focus
 * - focus-completed: Session done
 * - break: Break active
 * - paused-break: Break paused
 * - break-completed: Break done
 */
export type TimerState =
  | 'idle'
  | 'focusing'
  | 'paused-focusing'
  | 'focus-completed'
  | 'break'
  | 'paused-break'
  | 'break-completed'

export type TimerPreset = 'focus' | 'short' | 'long'

export const TIMER_PRESETS: Record<TimerPreset, { label: string; duration: number }> = {
  focus: { label: 'Focus · 25m', duration: 25 * 60 },
  short: { label: 'Short Break · 5m', duration: 5 * 60 },
  long: { label: 'Long Break · 15m', duration: 15 * 60 },
}
