import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useTranslation } from '@/context/LanguageContext'
import { UIStyle } from '@/context/ThemeColorContext'
import { TimerPreset, FocusedTaskState, TimerState } from '../types'
import { playClickSound } from '../utils'
import {
  PlayIcon,
  PauseIcon,
  MoreHorizontalIcon, // Note: parent Card uses this, but checking internal usage
} from '../icons'

// We need to define the hook result type here or import it if we exported it
// Since we didn't export it, we define the expected shape for props
export type TimerHookState = {
  activePreset: TimerPreset
  customMinutes: number
  isEditingCustom: boolean
  isZenMode: boolean
  zenFocus: 'task' | 'timer'
  timeLeft: number
  timerState: TimerState
  totalAllocatedDuration: number
  isRunning: boolean
  isPaused: boolean
  isCompleted: boolean
}

export type TimerHookActions = {
  setActivePreset: (p: TimerPreset) => void
  setCustomMinutes: (m: number) => void
  setIsEditingCustom: (v: boolean) => void
  setIsZenMode: (v: boolean) => void
  setZenFocus: (v: 'task' | 'timer') => void
  startTimer: () => void
  pauseTimer: () => void
  endSession: () => void
  continueNewSession: () => void
}

export type TimerWidgetProps = {
  timerState: TimerHookState
  timerActions: TimerHookActions
  focusedTask?: FocusedTaskState
  uiStyle?: UIStyle
  isFlipped: boolean
  onFlip: (v: boolean) => void
}

export const TimerWidget = ({
  timerState: {
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
  timerActions: {
    setActivePreset,
    setCustomMinutes,
    setIsEditingCustom,
    setIsZenMode,
    setZenFocus,
    startTimer,
    pauseTimer,
    endSession,
    continueNewSession,
  },
  focusedTask,
  uiStyle,
  isFlipped,
  onFlip,
}: TimerWidgetProps) => {
  const { t } = useTranslation()
  const customInputRef = useRef<HTMLInputElement>(null)

  // Shortcuts for conditional styles
  const isWarm = uiStyle === 'warm'
  const isGreen = uiStyle === 'green'
  const isBlue = uiStyle === 'blue'
  const isCartoon = uiStyle === 'cartoon'
  // Flag for changed custom duration to trigger save in parent? No, hook handles it.
  const setIsCustomChanged = (v: boolean) => {} // No-op, hook handles effect

  // -- UI Helpers --
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <div className="relative flex h-full flex-col">
      <AnimatePresence mode="wait">
        {isFlipped ? (
          // BACK: Settings / Stopwatch Mode Placeholder or just Controls
          // Original code had a "Stopwatch" UI on the back, but looking at logic,
          // derivedMode was 'stopwatch' if isFlipped was true.
          // The hook manages "derivedMode" logic internally via timerState?
          // Wait, the hook I wrote didn't explicitly check `isFlipped` for stopwatch mode.
          // In the original, `useEffect([isFlipped])` reset state and set mode.
          // My Hook needs to know about `isFlipped` if that determines stopwatch mode!
          // REVIEW: Original code:
          // useEffect(() => { ... if (isFlipped) setTimeLeft(0) ... }, [isFlipped])
          // My hook removed `isFlipped` dependency.
          // CORRECTIVE ACTION: I need to handle stopwatch mode.
          // Ideally, the widget tells the hook "I am in stopwatch mode".
          // BUT, to keep UI pure, I should probably expose `setMode` in hook?
          // For now, let's render the Stopwatch UI if isFlipped is true,
          // AND we assume the hook handles the logic if we didn't break it.
          // Oh, I missed passing `isFlipped` to the hook!
          // The hook needs to know if we are in Stopwatch mode (flipped).
          // Or, better, `TimerWidget` calls `resetTimer(mode)` when it flips.

          <motion.div
            key="back"
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -180 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-col"
          >
            {/* Stopwatch Display */}
            <div className="flex flex-1 flex-col items-center justify-center">
              <div
                className="flex w-full items-center justify-center"
                style={{ containerType: 'inline-size' }}
              >
                <div
                  className={`focuslab-numeric ${isWarm ? 'text-[#C27B4A]' : isGreen ? 'text-[#7A9F7A]' : isBlue ? 'text-[#5B84B1]' : isCartoon ? 'text-black dark:text-white' : 'text-primary-600 dark:text-primary-400'} leading-none font-black tracking-tight`}
                  style={{ fontSize: 'clamp(2.5rem, 26cqw, 7rem)' }}
                >
                  {display}
                </div>
              </div>
              <p
                className={`mt-2 text-sm font-medium ${isCartoon ? 'text-black dark:text-white' : 'text-gray-400'}`}
              >
                {isRunning
                  ? t.focusLab.widgets.timer.recording || 'Recording time...'
                  : t.focusLab.widgets.timer.ready || 'Ready to start'}
              </p>
            </div>

            {/* Stopwatch Controls */}
            <div className="w-full">
              {timerState === 'idle' && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      playClickSound()
                      startTimer()
                    }}
                    className={`${
                      isWarm
                        ? 'rounded-lg bg-[#C27B4A] text-white shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
                        : isGreen
                          ? 'h-10 flex-1 rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : isBlue
                            ? 'h-10 flex-1 rounded-xl bg-[#5B84B1] text-white shadow-lg shadow-[#5B84B1]/25 hover:bg-[#4A6E94] hover:shadow-[#5B84B1]/40 focus:ring-2 focus:ring-[#5B84B1] focus:ring-offset-2 dark:focus:ring-offset-2'
                            : isCartoon
                              ? 'h-10 flex-1 rounded-xl bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                              : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 focus:ring-primary-500 h-10 flex-1 rounded-xl text-white shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-2'
                    } flex w-auto min-w-[100px] items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-all active:scale-95`}
                  >
                    <PlayIcon className="h-4 w-4" />
                    {t.focusLab.widgets.timer.start}
                  </button>
                </div>
              )}

              {isRunning && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      playClickSound()
                      pauseTimer()
                    }}
                    className={`${
                      isWarm
                        ? 'h-10 flex-1 rounded-xl bg-[#C27B4A] text-white shadow-lg shadow-[#C27B4A]/25 hover:bg-[#A6663E] hover:shadow-[#C27B4A]/40 focus:ring-2 focus:ring-[#C27B4A] focus:ring-offset-2'
                        : isGreen
                          ? 'h-10 flex-1 rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : isBlue
                            ? 'h-10 flex-1 rounded-xl bg-[#5B84B1] text-white shadow-lg shadow-[#5B84B1]/25 hover:bg-[#4A6E94] hover:shadow-[#5B84B1]/40 focus:ring-2 focus:ring-[#5B84B1] focus:ring-offset-2 dark:focus:ring-offset-2'
                            : isCartoon
                              ? 'h-10 flex-1 rounded-xl bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                              : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 focus:ring-primary-500 h-10 flex-1 rounded-xl text-white shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-2'
                    } flex w-auto min-w-[100px] items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-all active:scale-95`}
                  >
                    <PauseIcon className="h-4 w-4" />
                    {t.focusLab.widgets.timer.pause}
                  </button>
                </div>
              )}

              {(isPaused || isCompleted) && (
                <div className="flex gap-3">
                  <button
                    onClick={endSession}
                    className={`flex-1 px-6 py-2 text-sm font-medium transition-colors ${
                      isWarm
                        ? 'rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:bg-gray-800 dark:hover:bg-gray-700'
                        : isGreen
                          ? 'h-10 rounded-xl bg-[#E2E8E2] text-[#7A9F7A] hover:bg-[#D1DAD1]'
                          : isBlue
                            ? 'h-10 rounded-xl bg-[#D1E3F3] text-[#5B84B1] hover:bg-[#C0D8EE]'
                            : isCartoon
                              ? 'h-10 rounded-xl border-2 border-black text-black hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-gray-800'
                              : 'h-10 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                    }`}
                  >
                    {t.focusLab.widgets.timer.endSession || 'End'}
                  </button>
                  <button
                    onClick={() => {
                      playClickSound()
                      startTimer()
                    }}
                    className={`${
                      isWarm
                        ? 'rounded-lg bg-[#C27B4A] text-white shadow-lg shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
                        : isGreen
                          ? 'h-10 flex-[2] rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : isBlue
                            ? 'h-10 flex-[2] rounded-xl bg-[#5B84B1] text-white shadow-lg shadow-[#5B84B1]/25 hover:bg-[#4A6E94] hover:shadow-[#5B84B1]/40 focus:ring-2 focus:ring-[#5B84B1] focus:ring-offset-2 dark:focus:ring-offset-2'
                            : isCartoon
                              ? 'h-10 flex-[2] rounded-xl bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                              : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 focus:ring-primary-500 h-10 flex-[2] rounded-xl text-white shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-2'
                    } flex flex-[2] items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-all active:scale-95`}
                  >
                    {t.focusLab.widgets.timer.resume}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // FRONT: Timer Display
          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col justify-between"
          >
            {/* Presets (Visible Only When Idle) */}
            <div className="relative flex h-10 w-full items-center justify-center">
              <AnimatePresence>
                {timerState === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center gap-2 rounded-xl p-1 dark:bg-gray-800 ${isCartoon ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    {(['focus', 'short', 'long'] as TimerPreset[]).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setActivePreset(preset)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                          activePreset === preset
                            ? isBlue
                              ? 'bg-[#E0EEF8] text-[#5B84B1] shadow-sm'
                              : isGreen
                                ? 'bg-[#F8F9F7] text-[#7A9F7A] shadow-sm'
                                : isWarm
                                  ? 'bg-[#F5F2EC] text-[#C27B4A] shadow-sm'
                                  : isCartoon
                                    ? 'bg-black text-white shadow-md'
                                    : 'text-primary-600 dark:text-primary-400 dark:bg-primary-800/40 bg-white shadow-sm'
                            : isCartoon
                              ? 'text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        {preset === 'focus' && '25m'}
                        {preset === 'short' && '5m'}
                        {preset === 'long' && (
                          <span className="flex items-center gap-1">
                            {isEditingCustom ? (
                              <input
                                type="number"
                                min="1"
                                max="120"
                                ref={customInputRef}
                                value={customMinutes}
                                onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 0)}
                                onBlur={() => {
                                  setCustomMinutes(Math.max(1, Math.min(120, customMinutes)))
                                  setIsEditingCustom(false)
                                  setIsCustomChanged(true)
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && setIsEditingCustom(false)}
                                className="w-8 [appearance:textfield] rounded bg-transparent p-0 text-center outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                            ) : (
                              <span onDoubleClick={() => setIsEditingCustom(true)}>
                                {customMinutes}m
                              </span>
                            )}
                          </span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Zen Mode Button - Positioned absolute right in header */}
              <button
                onClick={() => setIsZenMode(true)}
                className={`absolute right-0 z-10 rounded-lg p-1.5 transition-all ${
                  isCartoon
                    ? 'text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                }`}
                aria-label="Enter Zen Mode"
              >
                <span className="icon-[solar--meditation-round-linear] text-lg" />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center">
              <div
                className="flex w-full items-center justify-center"
                style={{ containerType: 'inline-size' }}
              >
                <div
                  className={`focuslab-numeric leading-none font-black tracking-tight ${isBlue ? 'text-[#5B84B1]' : isGreen ? 'text-[#7A9F7A]' : isWarm ? 'text-[#C27B4A]' : isCartoon ? 'text-black dark:text-white' : isCompleted ? 'text-primary-600 dark:text-primary-400' : 'text-primary-600 dark:text-primary-400'}`}
                  style={{
                    fontSize: isCompleted
                      ? 'clamp(2rem, 15cqw, 4.5rem)'
                      : 'clamp(2.5rem, 26cqw, 7rem)',
                  }}
                >
                  {isCompleted
                    ? t.focusLab.widgets.timer.congratulations || 'Congratulations'
                    : display}
                </div>
              </div>
              {!isCompleted && timerState !== 'idle' && (
                <p className="mt-2 animate-pulse text-sm font-medium text-gray-400">
                  {timerState === 'focusing'
                    ? 'Stay focused'
                    : timerState === 'break'
                      ? 'Take a break'
                      : 'Paused'}
                </p>
              )}
            </div>

            {/* Bottom Action Button */}
            <div className="w-full">
              {timerState === 'idle' && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      playClickSound()
                      startTimer()
                    }}
                    className={`${
                      isWarm
                        ? 'rounded-lg bg-[#C27B4A] text-white shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
                        : isGreen
                          ? 'h-10 flex-1 rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : isBlue
                            ? 'h-10 flex-1 rounded-xl bg-[#5B84B1] text-white shadow-lg shadow-[#5B84B1]/25 hover:bg-[#4A6E94] hover:shadow-[#5B84B1]/40 focus:ring-2 focus:ring-[#5B84B1] focus:ring-offset-2 dark:focus:ring-offset-2'
                            : isCartoon
                              ? 'h-10 flex-1 rounded-xl bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                              : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 focus:ring-primary-500 h-10 flex-1 rounded-xl text-white shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-2'
                    } flex w-auto min-w-[100px] items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-all active:scale-95`}
                  >
                    <span className="icon-[solar--play-bold] text-lg" />
                    {t.focusLab.widgets.timer.start}
                  </button>
                </div>
              )}

              {isRunning && (
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      playClickSound()
                      pauseTimer()
                    }}
                    className={`${
                      isWarm
                        ? 'h-10 flex-1 rounded-xl bg-[#C27B4A] text-white shadow-lg shadow-[#C27B4A]/25 hover:bg-[#A6663E] hover:shadow-[#C27B4A]/40 focus:ring-2 focus:ring-[#C27B4A] focus:ring-offset-2'
                        : isGreen
                          ? 'h-10 flex-1 rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : isBlue
                            ? 'h-10 flex-1 rounded-xl bg-[#5B84B1] text-white shadow-lg shadow-[#5B84B1]/25 hover:bg-[#4A6E94] hover:shadow-[#5B84B1]/40 focus:ring-2 focus:ring-[#5B84B1] focus:ring-offset-2 dark:focus:ring-offset-2'
                            : isCartoon
                              ? 'h-10 flex-1 rounded-xl bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                              : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 focus:ring-primary-500 h-10 flex-1 rounded-xl text-white shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-2'
                    } flex w-auto min-w-[100px] items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-all active:scale-95`}
                  >
                    <span className="icon-[solar--pause-bold] text-lg" />
                    {t.focusLab.widgets.timer.pause}
                  </button>
                </div>
              )}

              {isPaused && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      playClickSound()
                      endSession()
                    }}
                    className={`flex-1 px-6 py-2 text-sm font-medium transition-colors ${
                      isWarm
                        ? 'rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:bg-gray-800 dark:hover:bg-gray-700'
                        : isGreen
                          ? 'h-10 rounded-xl bg-[#E2E8E2] text-[#7A9F7A] hover:bg-[#D1DAD1]'
                          : isBlue
                            ? 'h-10 rounded-xl bg-[#D1E3F3] text-[#5B84B1] hover:bg-[#C0D8EE]'
                            : isCartoon
                              ? 'h-10 rounded-xl border-2 border-black bg-white text-black hover:bg-gray-100 dark:border-white dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                              : 'h-10 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                    }`}
                  >
                    {t.focusLab.widgets.timer.endSession || 'End'}
                  </button>
                  <button
                    onClick={() => {
                      playClickSound()
                      startTimer()
                    }}
                    className={`${
                      isWarm
                        ? 'rounded-lg bg-[#C27B4A] text-white shadow-lg shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
                        : isGreen
                          ? 'h-10 flex-[2] rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40 focus:ring-2 focus:ring-[#7A9F7A] focus:ring-offset-2 dark:focus:ring-offset-2'
                          : isBlue
                            ? 'h-10 flex-[2] rounded-xl bg-[#5B84B1] text-white shadow-lg shadow-[#5B84B1]/25 hover:bg-[#4A6E94] hover:shadow-[#5B84B1]/40 focus:ring-2 focus:ring-[#5B84B1] focus:ring-offset-2 dark:focus:ring-offset-2'
                            : isCartoon
                              ? 'h-10 flex-[2] rounded-xl bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                              : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 focus:ring-primary-500 h-10 flex-[2] rounded-xl text-white shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-2'
                    } flex flex-[2] items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-all active:scale-95`}
                  >
                    <span className="icon-[solar--play-bold] text-xl" />
                    {t.focusLab.widgets.timer.resume || 'Resume'}
                  </button>
                </div>
              )}

              {isCompleted && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={() => {
                      playClickSound()
                      endSession()
                    }}
                    className={`w-full ${isWarm ? 'rounded-lg' : 'rounded-full'} bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-200 active:scale-95 sm:flex-1 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700`}
                  >
                    {t.focusLab.widgets.timer.endFocus || 'End Focus'}
                  </button>
                  <button
                    onClick={() => {
                      playClickSound()
                      continueNewSession()
                    }}
                    className={`${
                      isWarm
                        ? 'rounded-lg bg-[#C27B4A] shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
                        : isGreen
                          ? 'rounded-lg bg-[#7A9F7A] shadow-[#7A9F7A]/30 hover:bg-[#688868]'
                          : isBlue
                            ? 'rounded-lg bg-[#5B84B1] shadow-[#5B84B1]/30 hover:bg-[#4A6E94]'
                            : isCartoon
                              ? 'rounded-lg bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                              : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/25 rounded-full'
                    } w-full px-4 py-2 text-sm font-extrabold text-white shadow-lg transition-all active:scale-95`}
                  >
                    {t.focusLab.widgets.timer.continueFocus || 'One more round'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zen Mode Fullscreen Overlay */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isZenMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
              >
                {/* Exit Button */}
                <button
                  onClick={() => setIsZenMode(false)}
                  className="absolute top-6 right-6 rounded-full p-3 text-white/60 transition-all hover:bg-white/10 hover:text-white"
                  aria-label={t.focusLab.widgets.timer.zenMode?.exit || 'Exit Zen Mode'}
                >
                  <span className="icon-[solar--close-circle-linear] text-3xl" />
                </button>

                {/* Timer & Task Groups - Click to Swap */}
                <div className="flex w-full flex-col items-center justify-center gap-8">
                  {zenFocus === 'task' ? (
                    <>
                      {/* Secondary: Timer */}
                      <motion.div
                        layoutId="zen-timer"
                        onClick={(e) => {
                          e.stopPropagation()
                          setZenFocus('timer')
                        }}
                        className={`focuslab-numeric cursor-pointer text-3xl font-medium tracking-widest transition-opacity hover:opacity-100 ${isCompleted ? 'text-green-400' : 'text-white/40'}`}
                      >
                        {isCompleted ? t.focusLab.widgets.timer.congratulations || '🎉' : display}
                      </motion.div>

                      {/* Primary: Task */}
                      {focusedTask && (
                        <motion.p
                          layoutId="zen-task"
                          className="max-w-[80%] cursor-default text-center text-6xl leading-tight font-bold text-white"
                        >
                          {focusedTask.text}
                        </motion.p>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Secondary: Task */}
                      {focusedTask && (
                        <motion.p
                          layoutId="zen-task"
                          onClick={(e) => {
                            e.stopPropagation()
                            setZenFocus('task')
                          }}
                          className="max-w-[80%] cursor-pointer text-center text-2xl font-medium text-white/50 transition-opacity hover:text-white/80"
                        >
                          {focusedTask.text}
                        </motion.p>
                      )}

                      {/* Primary: Timer */}
                      <motion.div
                        layoutId="zen-timer"
                        className={`focuslab-numeric text-9xl leading-none font-black tracking-tight ${
                          isCompleted
                            ? 'text-green-400'
                            : isWarm
                              ? 'text-[#C27B4A]'
                              : isGreen
                                ? 'text-[#7A9F7A]'
                                : isBlue
                                  ? 'text-[#5B84B1]'
                                  : 'text-white'
                        }`}
                      >
                        {isCompleted ? t.focusLab.widgets.timer.congratulations || '🎉' : display}
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Status Text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 text-lg text-white/40"
                >
                  {isCompleted
                    ? t.focusLab.widgets.timer.zenMode?.sessionComplete || 'Session Complete!'
                    : isRunning
                      ? isFlipped
                        ? t.focusLab.widgets.timer.recording || 'Recording time...'
                        : t.focusLab.widgets.timer.zenMode?.stayFocused || 'Stay focused'
                      : isPaused
                        ? t.focusLab.widgets.timer.zenMode?.paused || 'Paused'
                        : timerState === 'idle'
                          ? t.focusLab.widgets.timer.ready || 'Ready to start'
                          : ''}
                </motion.p>

                {/* Control Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-12 flex gap-4"
                >
                  {timerState === 'idle' && (
                    <button
                      onClick={() => {
                        playClickSound()
                        startTimer()
                      }}
                      className="flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20"
                    >
                      <span className="icon-[solar--play-bold] text-xl" />
                      {t.focusLab.widgets.timer.start || 'Start'}
                    </button>
                  )}
                  {isRunning && (
                    <button
                      onClick={() => {
                        playClickSound()
                        pauseTimer()
                      }}
                      className="flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20"
                    >
                      <span className="icon-[solar--pause-bold] text-xl" />
                      {t.focusLab.widgets.timer.pause}
                    </button>
                  )}

                  {isPaused && (
                    <>
                      <button
                        onClick={() => {
                          playClickSound()
                          endSession()
                          setIsZenMode(false)
                        }}
                        className="flex items-center gap-2 rounded-full bg-red-500/20 px-8 py-4 text-lg font-semibold text-red-400 transition-all hover:bg-red-500/30"
                      >
                        {t.focusLab.widgets.timer.endSession || 'End'}
                      </button>
                      <button
                        onClick={() => {
                          playClickSound()
                          startTimer()
                        }}
                        className="flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20"
                      >
                        <span className="icon-[solar--play-bold] text-xl" />
                        {t.focusLab.widgets.timer.resume || 'Resume'}
                      </button>
                    </>
                  )}

                  {isCompleted && (
                    <>
                      <button
                        onClick={() => {
                          playClickSound()
                          endSession()
                          setIsZenMode(false)
                        }}
                        className="flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20"
                      >
                        {t.focusLab.widgets.timer.endFocus || 'End Focus'}
                      </button>
                      <button
                        onClick={() => {
                          playClickSound()
                          continueNewSession()
                        }}
                        className={`flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold text-white transition-all ${
                          isWarm
                            ? 'bg-[#C27B4A] hover:bg-[#A6663E]'
                            : isGreen
                              ? 'bg-[#7A9F7A] hover:bg-[#688868]'
                              : isBlue
                                ? 'bg-[#5B84B1] hover:bg-[#4A6E94]'
                                : 'bg-primary-500 hover:bg-primary-600'
                        }`}
                      >
                        {t.focusLab.widgets.timer.continueFocus || 'One more round'}
                      </button>
                    </>
                  )}
                </motion.div>

                {/* Keyboard hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-8 text-sm text-white/20"
                >
                  Press ESC to exit
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}
