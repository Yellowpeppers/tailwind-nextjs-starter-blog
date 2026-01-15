'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/context/LanguageContext'
import { useTheme } from 'next-themes'
import { useThemeColor, ThemeColor, UIStyle } from '@/context/ThemeColorContext'
import { GRID_PRESETS } from '@/components/focus-lab/constants'
import { LayoutPreset } from '@/components/focus-lab/types'

export interface FocusLabSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  // Settings
  settings: {
    focus_lab?: {
      hide_headers?: boolean
      sound?: { enabled?: boolean }
      incentives?: { custom_messages?: string[] }
    }
  }
  updateSettings: (path: string, value: unknown) => void
  // Notifications
  notificationsEnabled: boolean
  onToggleNotifications: () => void
  // Layout customization
  activePreset: LayoutPreset
  hiddenByPreset: Record<LayoutPreset, Set<string>>
  onToggleHidden: (preset: LayoutPreset, id: string) => void
  onResetLayout: () => void
}

export const FocusLabSettingsModal = ({
  isOpen,
  onClose,
  settings,
  updateSettings,
  notificationsEnabled,
  onToggleNotifications,
  activePreset,
  hiddenByPreset,
  onToggleHidden,
  onResetLayout,
}: FocusLabSettingsModalProps) => {
  const { t, language: lang } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { themeColor, setThemeColor, uiStyle, setUiStyle } = useThemeColor()

  const [showCustomizeMenu, setShowCustomizeMenu] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const customizeButtonRef = useRef<HTMLButtonElement | null>(null)
  const customizeMenuRef = useRef<HTMLDivElement | null>(null)

  // Close Customize menu on outside click
  useEffect(() => {
    if (!showCustomizeMenu) return
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideMenu = customizeMenuRef.current?.contains(target)
      const isButton = customizeButtonRef.current?.contains(target)
      if (!isInsideMenu && !isButton) {
        setShowCustomizeMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showCustomizeMenu])

  // Close customize menu when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowCustomizeMenu(false)
    }
  }, [isOpen])

  const getToggleButtonClass = (enabled: boolean) => {
    if (!enabled) return 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
    if (uiStyle === 'warm') return 'bg-[#F5F2EC] font-bold text-[#C27B4A]'
    if (uiStyle === 'green') return 'bg-[#F8F9F7] font-bold text-[#7A9F7A]'
    if (uiStyle === 'blue') return 'bg-[#E0EEF8] font-bold text-[#5B84B1]'
    if (uiStyle === 'cartoon')
      return 'border border-black bg-[#FFF8E7] font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-[#2A2A2A] dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
    return 'bg-primary-100 text-primary-700 font-bold'
  }

  const isLightModeOnlyStyle =
    uiStyle === 'warm' || uiStyle === 'green' || uiStyle === 'blue' || uiStyle === 'cartoon'

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="no-scrollbar relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-4 text-xl font-bold dark:text-white">
                {t.focusLab.settings?.title || 'Settings'}
              </h2>

              <div className="space-y-4">
                {/* Dark Mode */}
                <div
                  className={`flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800 ${isLightModeOnlyStyle ? 'opacity-50' : ''}`}
                >
                  <span className="font-medium dark:text-gray-200">
                    {t.focusLab.settings?.darkMode || 'Dark Mode'}
                  </span>
                  <button
                    disabled={isLightModeOnlyStyle}
                    onClick={() => {
                      if (!isLightModeOnlyStyle) {
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                      }
                    }}
                    className={`rounded-md bg-gray-200 px-3 py-1.5 text-sm transition-colors dark:bg-gray-700 ${isLightModeOnlyStyle ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {isLightModeOnlyStyle
                      ? 'Light Only'
                      : theme === 'dark'
                        ? t.focusLab.settings?.on || 'On'
                        : t.focusLab.settings?.off || 'Off'}
                  </button>
                </div>

                {/* Hide Card Headers */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="font-medium dark:text-gray-200">
                    {t.focusLab.settings?.hideHeaders || 'Hide Card Headers'}
                  </span>
                  <button
                    onClick={() =>
                      updateSettings(
                        'focus_lab.hide_headers',
                        !(settings.focus_lab?.hide_headers ?? false)
                      )
                    }
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${getToggleButtonClass(settings.focus_lab?.hide_headers ?? false)}`}
                  >
                    {(settings.focus_lab?.hide_headers ?? false)
                      ? t.focusLab.settings?.on || 'On'
                      : t.focusLab.settings?.off || 'Off'}
                  </button>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="font-medium dark:text-gray-200">
                    {t.focusLab.settings?.notifications || 'Notifications'}
                  </span>
                  <button
                    onClick={onToggleNotifications}
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${getToggleButtonClass(notificationsEnabled)}`}
                  >
                    {notificationsEnabled
                      ? t.focusLab.settings?.on || 'On'
                      : t.focusLab.settings?.off || 'Off'}
                  </button>
                </div>

                {/* Sound Effects */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="font-medium dark:text-gray-200">
                    {t.focusLab.settings?.soundEffects || 'Sound Effects'}
                  </span>
                  <button
                    onClick={() =>
                      updateSettings(
                        'focus_lab.sound.enabled',
                        !(settings.focus_lab?.sound?.enabled ?? true)
                      )
                    }
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${getToggleButtonClass(settings.focus_lab?.sound?.enabled ?? true)}`}
                  >
                    {(settings.focus_lab?.sound?.enabled ?? true)
                      ? t.focusLab.settings?.on || 'On'
                      : t.focusLab.settings?.off || 'Off'}
                  </button>
                </div>

                {/* Custom Incentives */}
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium dark:text-gray-200">
                      {lang === 'zh' ? '自定义激励语' : 'Personalized Incentives'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {lang === 'zh' ? '每行一条' : 'One per line'}
                    </span>
                  </div>
                  <textarea
                    className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border-gray-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    rows={4}
                    placeholder={
                      lang === 'zh' ? '输入你的专属激励语...' : 'Enter your custom messages...'
                    }
                    value={settings.focus_lab?.incentives?.custom_messages?.join('\n') ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      const lines = val ? val.split('\n') : []
                      updateSettings('focus_lab.incentives.custom_messages', lines)
                    }}
                  />
                </div>

                {/* Layout Customization */}
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium dark:text-gray-200">
                        {t.focusLab.controls.customizeLayout || 'Customize Layout'}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t.focusLab.controls.widgetVisibility || 'Show/Hide Cards'}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setShowCustomizeMenu(!showCustomizeMenu)
                        }}
                        ref={customizeButtonRef}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold shadow-sm transition-all active:scale-95 ${
                          showCustomizeMenu
                            ? uiStyle === 'warm'
                              ? 'bg-[#F5F2EC] text-[#C27B4A]'
                              : uiStyle === 'green'
                                ? 'bg-[#F8F9F7] text-[#7A9F7A]'
                                : uiStyle === 'blue'
                                  ? 'bg-[#E0EEF8] text-[#5B84B1]'
                                  : uiStyle === 'cartoon'
                                    ? 'border border-black bg-[#FFF8E7] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-[#2A2A2A] dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                                    : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                            : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="icon-[solar--widget-4-line-duotone] text-lg" />
                        {t.focusLab.controls.customizeLayout || 'Customize'}
                      </button>

                      <AnimatePresence>
                        {showCustomizeMenu && (
                          <motion.div
                            ref={customizeMenuRef}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900"
                          >
                            <div className="flex flex-col gap-1">
                              <h4 className="mb-1 border-b border-gray-100 px-3 py-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:border-gray-800">
                                {t.focusLab.controls.widgetVisibility || 'Show/Hide Cards'}
                              </h4>
                              {GRID_PRESETS[activePreset].layout.map((defaultItem) => {
                                const hiddenSet = hiddenByPreset[activePreset] || new Set()
                                const isActive = !hiddenSet.has(defaultItem.id)

                                const idMap: Record<string, string> = {
                                  sonic: 'sonicShield',
                                  timer: 'timer',
                                  brain: 'brainDump',
                                  todo: 'todo',
                                  breaker: 'taskBreaker',
                                  dopamine: 'dopamineMenu',
                                }
                                const translationKey = idMap[defaultItem.id] || defaultItem.id
                                // @ts-ignore
                                const widgetTitle =
                                  t.focusLab.widgets[translationKey]?.title || defaultItem.id

                                return (
                                  <button
                                    key={defaultItem.id}
                                    onClick={() => {
                                      onToggleHidden(activePreset, defaultItem.id)
                                    }}
                                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                      isActive
                                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                    }`}
                                  >
                                    <span>{widgetTitle}</span>
                                    {isActive && (
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        className="text-primary-600 dark:text-primary-400 h-4 w-4"
                                      >
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </button>
                                )
                              })}

                              <div className="my-1 h-px bg-gray-100 dark:bg-gray-800" />

                              <button
                                onClick={() => {
                                  setShowCustomizeMenu(false)
                                  setShowResetConfirm(true)
                                }}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                              >
                                <span className="icon-[solar--restart-bold] text-sm" />
                                {t.focusLab.controls.resetLayout}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Visual Style */}
                <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="mb-3 block font-medium dark:text-gray-200">Visual Style</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setUiStyle('modern')
                        updateSettings('theme.style', 'modern')
                      }}
                      className={cn(
                        'flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        uiStyle === 'modern'
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      Modern
                    </button>
                    <button
                      onClick={() => {
                        setUiStyle('warm')
                        updateSettings('theme.style', 'warm')
                      }}
                      className={cn(
                        'flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        uiStyle === 'warm'
                          ? 'border-amber-500 bg-[#FDFBF7] text-[#8C502B]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      Warm
                    </button>
                    <button
                      onClick={() => {
                        setUiStyle('green')
                        updateSettings('theme.style', 'green')
                      }}
                      className={cn(
                        'flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        uiStyle === 'green'
                          ? 'border-[#7A9F7A] bg-[#F8F9F7] text-[#7A9F7A]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      Green
                    </button>
                    <button
                      onClick={() => {
                        setUiStyle('cartoon')
                        updateSettings('theme.style', 'cartoon')
                      }}
                      className={cn(
                        'flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        uiStyle === 'cartoon'
                          ? 'border-black bg-[#FFF8E7] text-black shadow-[2px_2px_0px_0px_#000000] dark:border-white dark:bg-[#2A2A2A] dark:text-white dark:shadow-[2px_2px_0px_0px_#FFFFFF]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      Cartoon
                    </button>
                    <button
                      onClick={() => {
                        setUiStyle('blue')
                        updateSettings('theme.style', 'blue')
                      }}
                      className={cn(
                        'flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                        uiStyle === 'blue'
                          ? 'border-[#5B84B1] bg-[#E0EEF8] text-[#5B84B1]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      Blue
                    </button>
                  </div>
                  {/* Light mode only hint for non-Modern styles */}
                  {isLightModeOnlyStyle && (
                    <p className="mt-2 text-xs text-gray-400">
                      {lang === 'zh'
                        ? '此风格仅支持浅色模式'
                        : 'This style only supports light mode'}
                    </p>
                  )}
                </div>

                {/* Theme Color (Only visible in Modern style) */}
                <AnimatePresence>
                  {uiStyle === 'modern' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <span className="mb-3 block font-medium dark:text-gray-200">
                        {t.focusLab.settings?.themeColor || 'Theme Color'}
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { name: 'pink', color: '#db2777', label: 'Pink' },
                          { name: 'blue', color: '#0B1F3B', label: 'Deep Navy Blue' },
                          { name: 'green', color: '#0F6B61', label: 'Cool Ink Green' },
                          { name: 'yellow', color: '#C6A15B', label: 'Champagne Gold' },
                          { name: 'violet', color: '#3B3A82', label: 'Misty Indigo' },
                          { name: 'orange', color: '#B85C4A', label: 'Terracotta Orange' },
                          { name: 'red', color: '#7A8F86', label: 'Sage Green' },
                          { name: 'slate', color: '#1F2933', label: 'Graphite Gray' },
                        ].map(({ name, color, label }) => (
                          <button
                            key={name}
                            onClick={() => {
                              setThemeColor(name as ThemeColor)
                              updateSettings('theme.color', name)
                            }}
                            className={`h-8 w-full rounded-md ring-2 ring-offset-2 ring-offset-white transition-all hover:scale-105 dark:ring-offset-gray-800 ${
                              themeColor === name
                                ? 'scale-105 ring-gray-400 dark:ring-gray-400'
                                : 'opacity-80 ring-transparent hover:opacity-100'
                            }`}
                            style={{ backgroundColor: color }}
                            title={label}
                            aria-label={`Set theme to ${label}`}
                          ></button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={onClose}
                className="mt-6 w-full rounded-lg bg-gray-100 py-2 font-semibold transition hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation - Inline for simplicity */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm dark:bg-black/40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
            >
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                {t.focusLab.controls.resetLayout || 'Reset Layout?'}
              </h3>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                {t.focusLab.controls.resetConfirm ||
                  'This will restore the default layout arrangement.'}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {t.focusLab.common?.cancel || 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    onResetLayout()
                    setShowResetConfirm(false)
                  }}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  {t.focusLab.controls.resetLayout || 'Reset'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
