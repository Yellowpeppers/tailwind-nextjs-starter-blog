'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useFocusSettingsContext } from '@/components/focus-lab/FocusSettingsContext'
import { useTranslation } from '@/context/LanguageContext'
import { useThemeColor, type ThemeColor } from '@/context/ThemeColorContext'
import { type CardAnimationPreset, type CardSurface } from '@/components/focus-lab/types'

type CardShellProps = {
  title?: ReactNode
  badge?: ReactNode
  children: ReactNode
  onHeaderClick?: () => void
  onDelete?: () => void
  customAction?: ReactNode
  customActionPosition?: 'top' | 'right'
  className?: string
  bodyClassName?: string
  showHeader?: boolean
  motionEnabled?: boolean
  animationPreset?: CardAnimationPreset
  surface?: CardSurface
  isFocused?: boolean
}

type CardThemeTokens = {
  accent: string
  border: string
  shadow: string
  activeShadow: string
  surface: string
  muted: string
}

const THEME_TOKENS: Record<ThemeColor, CardThemeTokens> = {
  pink: {
    accent: '#f472b6',
    border: 'rgba(244, 114, 182, 0.32)',
    shadow: '0 18px 48px rgba(244, 114, 182, 0.12)',
    activeShadow: '0 22px 60px rgba(244, 114, 182, 0.2)',
    surface: 'linear-gradient(135deg, rgba(255, 245, 248, 0.95), rgba(255, 255, 255, 0.9))',
    muted: 'rgba(244, 114, 182, 0.1)',
  },
  blue: {
    accent: '#2563eb',
    border: 'rgba(37, 99, 235, 0.28)',
    shadow: '0 18px 48px rgba(37, 99, 235, 0.12)',
    activeShadow: '0 22px 60px rgba(37, 99, 235, 0.2)',
    surface: 'linear-gradient(135deg, rgba(235, 243, 255, 0.95), rgba(255, 255, 255, 0.9))',
    muted: 'rgba(37, 99, 235, 0.1)',
  },
  green: {
    accent: '#0f6b61',
    border: 'rgba(15, 107, 97, 0.28)',
    shadow: '0 18px 48px rgba(15, 107, 97, 0.12)',
    activeShadow: '0 22px 60px rgba(15, 107, 97, 0.2)',
    surface: 'linear-gradient(135deg, rgba(226, 244, 238, 0.95), rgba(255, 255, 255, 0.9))',
    muted: 'rgba(15, 107, 97, 0.12)',
  },
  yellow: {
    accent: '#c6a15b',
    border: 'rgba(198, 161, 91, 0.32)',
    shadow: '0 18px 48px rgba(198, 161, 91, 0.12)',
    activeShadow: '0 22px 60px rgba(198, 161, 91, 0.2)',
    surface: 'linear-gradient(135deg, rgba(255, 248, 231, 0.95), rgba(255, 255, 255, 0.9))',
    muted: 'rgba(198, 161, 91, 0.12)',
  },
  violet: {
    accent: '#3b3a82',
    border: 'rgba(59, 58, 130, 0.32)',
    shadow: '0 18px 48px rgba(59, 58, 130, 0.14)',
    activeShadow: '0 22px 60px rgba(59, 58, 130, 0.22)',
    surface: 'linear-gradient(135deg, rgba(241, 239, 252, 0.95), rgba(255, 255, 255, 0.9))',
    muted: 'rgba(59, 58, 130, 0.12)',
  },
  orange: {
    accent: '#b85c4a',
    border: 'rgba(184, 92, 74, 0.3)',
    shadow: '0 18px 48px rgba(184, 92, 74, 0.14)',
    activeShadow: '0 22px 60px rgba(184, 92, 74, 0.22)',
    surface: 'linear-gradient(135deg, rgba(255, 240, 232, 0.95), rgba(255, 255, 255, 0.9))',
    muted: 'rgba(184, 92, 74, 0.12)',
  },
  red: {
    accent: '#7a8f86',
    border: 'rgba(122, 143, 134, 0.32)',
    shadow: '0 18px 48px rgba(122, 143, 134, 0.14)',
    activeShadow: '0 22px 60px rgba(122, 143, 134, 0.22)',
    surface: 'linear-gradient(135deg, rgba(238, 244, 241, 0.95), rgba(255, 255, 255, 0.9))',
    muted: 'rgba(122, 143, 134, 0.12)',
  },
  slate: {
    accent: '#1f2933',
    border: 'rgba(31, 41, 51, 0.35)',
    shadow: '0 18px 48px rgba(31, 41, 51, 0.12)',
    activeShadow: '0 22px 60px rgba(31, 41, 51, 0.22)',
    surface: 'linear-gradient(135deg, rgba(242, 244, 247, 0.95), rgba(255, 255, 255, 0.9))',
    muted: 'rgba(31, 41, 51, 0.12)',
  },
}

const motionPresets: Record<CardAnimationPreset, Variants> = {
  float: {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.98 },
  },
  slide: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 12 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.94 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  },
}

const MinusIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--minus-circle-outline] ${className}`} />
)

export function CardShell({
  title,
  badge,
  children,
  onHeaderClick,
  onDelete,
  customAction,
  customActionPosition = 'top',
  className = '',
  bodyClassName = '',
  showHeader = true,
  motionEnabled,
  animationPreset,
  surface = 'glass',
  isFocused = false,
}: CardShellProps) {
  const { settings } = useFocusSettingsContext()
  const { themeColor } = useThemeColor()
  const { t } = useTranslation()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteRef = useRef<HTMLDivElement>(null)

  const hideHeadersSetting = settings.focus_lab?.hide_headers
  const headerHidden = hideHeadersSetting || !showHeader

  const cardTokens = useMemo(() => THEME_TOKENS[themeColor] || THEME_TOKENS.pink, [themeColor])

  const requestedMotionEnabled = motionEnabled ?? settings.focus_lab?.motion?.enabled ?? true
  const finalMotionEnabled = requestedMotionEnabled && false // 强制关闭入场动效
  const finalPreset =
    animationPreset ?? (settings.focus_lab?.motion?.preset as CardAnimationPreset) ?? 'float'
  const variants = motionPresets[finalPreset] || motionPresets.float

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (deleteRef.current && !deleteRef.current.contains(target)) {
        setShowDeleteConfirm(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const cardStyle: CSSProperties = {
    '--card-accent': cardTokens.accent,
    '--card-muted': cardTokens.muted,
    borderColor: cardTokens.border,
    boxShadow: isFocused ? cardTokens.activeShadow : cardTokens.shadow,
    backgroundImage:
      surface === 'glass'
        ? `${cardTokens.surface}, radial-gradient(circle at 15% 20%, ${cardTokens.muted}, transparent 40%)`
        : undefined,
    backdropFilter: surface === 'glass' ? 'blur(12px)' : undefined,
  } as CSSProperties

  return (
    <motion.section
      layout={false}
      initial={false}
      animate={finalMotionEnabled ? 'animate' : undefined}
      exit={finalMotionEnabled ? 'exit' : undefined}
      variants={finalMotionEnabled ? variants : undefined}
      transition={finalMotionEnabled ? { duration: 0.25, ease: 'easeOut' } : undefined}
      className={`group relative flex h-full flex-col rounded-[32px] border bg-white/95 px-5 py-4 shadow-lg shadow-gray-200/40 transition-all sm:px-6 sm:py-5 dark:bg-gray-900/90 ${isFocused ? 'ring-2 ring-[color:var(--card-accent)] ring-offset-[3px] ring-offset-white/80 dark:ring-offset-gray-950/80' : ''} ${className}`}
      style={cardStyle}
    >
      {headerHidden && (
        <div className="focuslab-drag-handle absolute inset-x-0 top-0 z-20 h-4 cursor-grab active:cursor-grabbing" />
      )}

      <div
        className={`focuslab-drag-handle flex items-center justify-between gap-2 ${headerHidden ? 'h-0 min-h-0' : 'h-9'} min-w-0 cursor-grab active:cursor-grabbing`}
        onClick={() => onHeaderClick?.()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onHeaderClick?.()
          }
        }}
      >
        {!headerHidden && (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {title && (
                <h2 className="max-w-full truncate text-base font-bold whitespace-nowrap text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
              )}
              {badge && <div>{badge}</div>}
            </div>
          </div>
        )}

        <div
          className={`flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 ${
            customActionPosition === 'top'
              ? headerHidden
                ? 'absolute top-3 right-4 z-10'
                : ''
              : ''
          }`}
        >
          {customAction && customActionPosition === 'top' && (
            <div className="focuslab-no-drag">{customAction}</div>
          )}
          {!customAction && onDelete && (
            <div className="relative" ref={deleteRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteConfirm(!showDeleteConfirm)
                }}
                className={`focuslab-no-drag flex aspect-square h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all ${
                  showDeleteConfirm
                    ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'
                    : 'text-gray-300 hover:bg-gray-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-gray-800/50 dark:hover:text-red-400'
                }`}
                aria-label="Remove widget"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-full right-0 z-10 mt-2 w-32 rounded-lg border border-gray-100 bg-white p-1 text-xs shadow-xl dark:border-gray-700 dark:bg-gray-800"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
                      }}
                      className="w-full rounded-md bg-red-50 px-3 py-2 text-left font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      {t.focusLab.delete.confirmBtn}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className={`mt-2 flex min-h-0 flex-1 flex-col ${bodyClassName}`}>{children}</div>

      {customAction && customActionPosition === 'right' && (
        <div className="absolute top-1/2 -right-2 z-50 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:right-0 group-hover:opacity-100">
          <div className="focuslab-no-drag flex translate-x-1/2 items-center">{customAction}</div>
        </div>
      )}
    </motion.section>
  )
}
