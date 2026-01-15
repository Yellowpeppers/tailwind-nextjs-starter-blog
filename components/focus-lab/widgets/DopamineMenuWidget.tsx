import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/context/LanguageContext'
import { UIStyle } from '@/context/ThemeColorContext'
import { UseDopamineSystemResult } from '../hooks/useDopamineSystem'
import { TrashIcon, CheckIcon, SmileCircleIcon } from '../icons'
import { playClickSound } from '../utils'

export const DopamineMenuWidget = ({
  dopamine,
  cols = 6,
  isFlipped,
  onFlip,
  uiStyle,
}: {
  dopamine: UseDopamineSystemResult
  cols?: number
  isFlipped: boolean
  onFlip: (v: boolean) => void
  uiStyle?: UIStyle
}) => {
  const isWarm = uiStyle === 'warm'
  const isGreen = uiStyle === 'green'
  const isBlue = uiStyle === 'blue'
  const isCartoon = uiStyle === 'cartoon'
  const { t, language: lang } = useTranslation()

  const { state, actions } = dopamine
  const { options, selected, isSpinning, showResult } = state
  const { addOption, removeOption, clearOptions, triggerSpin, resetResult } = actions

  const [newOption, setNewOption] = useState('')

  const handleAddOption = () => {
    if (newOption.trim()) {
      addOption(newOption.trim())
      setNewOption('')
    }
  }

  return (
    <div className="relative flex h-full min-w-0 flex-col" style={{ containerType: 'inline-size' }}>
      <AnimatePresence mode="wait">
        {isFlipped ? (
          // BACK: Settings / Options List
          <motion.div
            key="back"
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -180 }}
            transition={{ duration: 0.3 }}
            className="flex h-full min-w-0 flex-col gap-2.5"
          >
            {/* Input & Action Row */}
            <div className="flex shrink-0 items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                  placeholder={t.focusLab.widgets.dopamineMenu.addPlaceholder}
                  className={`w-full rounded-xl border py-2 pr-12 pl-4 text-sm text-gray-900 placeholder:text-gray-500 focus:ring-1 focus:outline-none dark:text-gray-100 ${
                    isWarm
                      ? 'border-[#ECE8E0] bg-[#F5F2EC] focus:border-[#C27B4A] focus:bg-[#F5F2EC] focus:ring-[#C27B4A] dark:border-gray-700 dark:bg-gray-800'
                      : isGreen
                        ? 'border-[#E2E8E2] bg-[#F8F9F7] text-gray-900 placeholder:text-gray-400 focus:border-[#7A9F7A] focus:ring-[#7A9F7A]'
                        : isBlue
                          ? 'border-[#D1E3F3] bg-[#E0EEF8] text-gray-900 placeholder:text-gray-400 focus:border-[#5B84B1] focus:ring-[#5B84B1]'
                          : isCartoon
                            ? 'border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-500 focus:ring-0 dark:border-white dark:bg-gray-900 dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                            : 'focus:border-primary-500 focus:ring-primary-500 border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:bg-gray-800'
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={clearOptions}
                disabled={options.length === 0}
                className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 disabled:hover:text-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 ${
                  isWarm
                    ? 'border border-[#ECE8E0] bg-[#F5F2EC] text-gray-600'
                    : isGreen
                      ? 'text-[#7A9F7A] hover:bg-[#E2E8E2] hover:text-[#5e7c5e]'
                      : isBlue
                        ? 'text-[#5B84B1] hover:bg-[#E0EEF8] hover:hover:text-[#4A6E94]'
                        : isCartoon
                          ? 'border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] dark:hover:bg-white dark:hover:text-black'
                          : 'bg-gray-100 text-gray-500 disabled:hover:bg-gray-100'
                }`}
                title={lang === 'en' ? 'Clear all options' : '清空所有选项'}
                aria-label={t.focusLab.widgets.dopamineMenu.accessibility.removeOption}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>

            {/* List */}
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto rounded-xl border border-dashed border-gray-200 p-2 dark:border-gray-700 [&::-webkit-scrollbar]:hidden">
              <div className="grid grid-cols-1 gap-2">
                {options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`group hover:bg-primary-50 dark:hover:bg-primary-900/20 flex min-w-0 items-center justify-between rounded-lg p-2 text-sm transition-all dark:bg-gray-800 dark:text-gray-200 ${
                      isCartoon
                        ? 'border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-gray-900 dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                        : 'bg-white shadow-sm'
                    }`}
                  >
                    <span className="truncate pr-2">{opt}</span>
                    <button
                      onClick={() => removeOption(idx)}
                      className="p-1 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
                      aria-label={t.focusLab.widgets.dopamineMenu.accessibility.removeOption}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : showResult ? (
          // RESULT VIEW
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex h-full flex-col items-center justify-center gap-6 text-center"
            style={{ containerType: 'inline-size' }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="text-4xl">🎉</div>
              <h3 className="max-w-full px-4 text-2xl font-black break-words text-gray-900 dark:text-white">
                {selected}
              </h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => resetResult()}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <CheckIcon className="h-5 w-5" />
                <span className="hidden @[220px]:inline">
                  {t.focusLab.widgets.dopamineMenu.done || 'Done'}
                </span>
              </button>
              <button
                onClick={() => {
                  playClickSound()
                  triggerSpin()
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white transition-colors ${
                  isWarm
                    ? 'bg-[#C27B4A] hover:bg-[#A6663E]'
                    : isGreen
                      ? 'bg-[#7A9F7A] hover:bg-[#688868]'
                      : isBlue
                        ? 'bg-[#5B84B1] hover:bg-[#4A6E94]'
                        : isCartoon
                          ? 'bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                          : 'bg-primary-500 hover:bg-primary-600'
                }`}
              >
                🎲
                <span className="hidden @[220px]:inline">Again</span>
              </button>
            </div>
          </motion.div>
        ) : (
          // FRONT: Main Spin View
          // FRONT: Simple Card + Spinner Overlay
          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex h-full flex-col"
          >
            {/* Edit Button moved to Header */}

            {isSpinning ? (
              // Spinning State
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="border-primary-200 border-t-primary-500 h-12 w-12 animate-spin rounded-full border-4" />
                <p className="text-primary-600 dark:text-primary-400 animate-pulse text-lg font-bold">
                  {selected || t.focusLab.widgets.dopamineMenu.spinning || 'Spinning...'}
                </p>
              </div>
            ) : (
              // Initial Simple State
              <div className="flex h-full flex-col justify-between">
                <div className="flex flex-1 flex-col items-center justify-center gap-2 pt-0 text-center">
                  <div
                    className={`${isWarm ? 'bg-primary-100 text-[#C27B4A]' : isGreen ? 'bg-[#F8F9F7] text-[#7A9F7A]' : isBlue ? 'bg-[#E0EEF8] text-[#5B84B1]' : isCartoon ? 'border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'} mt-2 flex h-14 w-14 items-center justify-center rounded-full`}
                  >
                    <SmileCircleIcon className="h-9 w-9" />
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        playClickSound()
                        triggerSpin()
                      }}
                      disabled={options.length === 0}
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
                      } flex w-auto min-w-[100px] items-center justify-center gap-2 px-4 py-2 text-sm font-bold shadow-lg transition-all active:scale-95 disabled:active:scale-100 dark:shadow-none`}
                    >
                      {t.focusLab.widgets.dopamineMenu.spinButton || 'Get Dopamine'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
