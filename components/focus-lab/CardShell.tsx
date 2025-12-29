'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useFocusSettingsContext } from '@/components/focus-lab/FocusSettingsContext'
import { useTranslation } from '@/context/LanguageContext'
import { useThemeColor, type ThemeColor } from '@/context/ThemeColorContext'
import { type CardAnimationPreset, type CardSurface } from '@/components/focus-lab/types'
import { Sparkles } from 'lucide-react'

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
  variant?: 'default' | 'ai-assistant'
}

type CardThemeTokens = {
  accent: string
  border: string
  shadow: string
  activeShadow: string
  surface: string
  muted: string
  darkSurface: string
  darkMuted: string
  darkBorder: string
  darkShadow: string
  darkActiveShadow: string
}

const DARK_BASE_SURFACE = 'rgba(5, 8, 12, 0.94)'

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '')
  const parsed = parseInt(normalized, 16)
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  }
}

const createThemeTokens = (
  accent: string,
  surface: string,
  muted: string,
  options: {
    borderAlpha?: number
    borderColor?: string
    shadow?: string
    activeShadow?: string
  } = {}
): CardThemeTokens => {
  const { borderAlpha = 0.2, borderColor, shadow, activeShadow } = options

  const accentRgb = hexToRgb(accent)
  const defaultBorder = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${borderAlpha})`
  const defaultShadow = `0 8px 30px -4px ${accent}25`
  const defaultActiveShadow = `0 20px 40px -4px ${accent}40`

  return {
    accent,
    border: borderColor ?? defaultBorder,
    shadow: shadow ?? defaultShadow,
    activeShadow: activeShadow ?? defaultActiveShadow,
    surface,
    muted,
    darkSurface: `linear-gradient(145deg, rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.16), ${DARK_BASE_SURFACE})`,
    darkMuted: `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.24)`,
    darkBorder: `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.42)`,
    darkShadow: '0 22px 60px rgba(0, 0, 0, 0.55)',
    darkActiveShadow: '0 28px 80px rgba(0, 0, 0, 0.72)',
  }
}

const THEME_TOKENS: Record<ThemeColor, CardThemeTokens> = {
  pink: createThemeTokens(
    '#f472b6',
    'linear-gradient(135deg, rgba(255, 245, 248, 0.95), rgba(255, 255, 255, 0.9))',
    'rgba(244, 114, 182, 0.1)',
    { borderAlpha: 0.32 }
  ),
  blue: createThemeTokens(
    '#2563eb',
    'linear-gradient(135deg, rgba(235, 243, 255, 0.95), rgba(255, 255, 255, 0.9))',
    'rgba(37, 99, 235, 0.1)',
    { borderAlpha: 0.28 }
  ),
  green: createThemeTokens(
    '#0f6b61',
    'linear-gradient(135deg, rgba(226, 244, 238, 0.95), rgba(255, 255, 255, 0.9))',
    'rgba(15, 107, 97, 0.12)',
    { borderAlpha: 0.28 }
  ),
  yellow: createThemeTokens(
    '#c6a15b',
    'linear-gradient(135deg, rgba(255, 248, 231, 0.95), rgba(255, 255, 255, 0.9))',
    'rgba(198, 161, 91, 0.12)',
    { borderAlpha: 0.32 }
  ),
  violet: createThemeTokens(
    '#3b3a82',
    'linear-gradient(135deg, rgba(241, 239, 252, 0.95), rgba(255, 255, 255, 0.9))',
    'rgba(59, 58, 130, 0.12)',
    { borderAlpha: 0.32 }
  ),
  orange: createThemeTokens(
    '#b85c4a',
    'linear-gradient(135deg, rgba(255, 240, 232, 0.95), rgba(255, 255, 255, 0.9))',
    'rgba(184, 92, 74, 0.12)',
    { borderAlpha: 0.3 }
  ),
  red: createThemeTokens(
    '#7a8f86',
    'linear-gradient(135deg, rgba(238, 244, 241, 0.95), rgba(255, 255, 255, 0.9))',
    'rgba(122, 143, 134, 0.12)',
    { borderAlpha: 0.32 }
  ),
  slate: createThemeTokens(
    '#1f2933',
    'linear-gradient(135deg, rgba(242, 244, 247, 0.95), rgba(255, 255, 255, 0.9))',
    'rgba(31, 41, 51, 0.12)',
    { borderAlpha: 0.35 }
  ),
}

const WARM_STYLE_TOKENS = {
  ...createThemeTokens(
    '#c27b4a',
    'linear-gradient(135deg, #FFFFFF, #FFFFFF)', // Flat white for cards
    'rgba(194, 123, 74, 0.05)',
    {
      borderAlpha: 1, // Solid border
      borderColor: '#ECE8E0', // Specific border color from reference
      shadow: 'none', // Remove shadow
      activeShadow: 'none',
    }
  ),
  // Override dark tokens to match light tokens (enforce white "Warm" look in dark mode)
  darkSurface: 'linear-gradient(135deg, #FFFFFF, #FFFFFF)',
  darkMuted: 'rgba(194, 123, 74, 0.05)',
  darkBorder: '#ECE8E0',
  darkShadow: 'none',
  darkActiveShadow: 'none',
}

const GREEN_STYLE_TOKENS = {
  ...createThemeTokens(
    '#7A9F7A',
    'linear-gradient(135deg, #FFFFFF, #FFFFFF)', // Flat white for cards
    'rgba(122, 159, 122, 0.05)',
    {
      borderColor: '#E2E8E2',
    }
  ),
}

const BLUE_STYLE_TOKENS = {
  ...createThemeTokens(
    '#5B84B1',
    'linear-gradient(135deg, #FFFFFF, #FFFFFF)', // Flat white for cards
    'rgba(91, 132, 177, 0.05)',
    {
      borderColor: '#D1E3F3',
    }
  ),
}

const CARTOON_STYLE_TOKENS = {
  accent: '#000000',
  border: '#000000',
  shadow: '4px 4px 0px 0px #000000',
  activeShadow: '2px 2px 0px 0px #000000',
  surface: '#FFF8E7', // Creamy white
  muted: 'rgba(0, 0, 0, 0.05)',
  darkSurface: '#2A2A2A',
  darkMuted: 'rgba(255, 255, 255, 0.05)',
  darkBorder: '#FFFFFF',
  darkShadow: '4px 4px 0px 0px #FFFFFF',
  darkActiveShadow: '2px 2px 0px 0px #FFFFFF',
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
  animationPreset = 'float',
  surface = 'glass',
  isFocused = false,
  variant = 'default',
}: CardShellProps) {
  const { themeColor, uiStyle } = useThemeColor()
  const { resolvedTheme } = useTheme()
  const { settings } = useFocusSettingsContext()
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  // If UI style is warm, use specific tokens, otherwise use theme tokens
  // If UI style is custom (warm/green), use specific tokens, otherwise use theme tokens
  const cardTokens = useMemo(() => {
    return uiStyle === 'warm'
      ? WARM_STYLE_TOKENS
      : uiStyle === 'green'
        ? GREEN_STYLE_TOKENS
        : uiStyle === 'blue'
          ? BLUE_STYLE_TOKENS
          : uiStyle === 'cartoon'
            ? CARTOON_STYLE_TOKENS
            : THEME_TOKENS[themeColor] || THEME_TOKENS.pink
  }, [themeColor, uiStyle])

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteRef = useRef<HTMLDivElement>(null)

  const hideHeadersSetting = settings.focus_lab?.hide_headers
  const headerHidden = hideHeadersSetting || !showHeader

  // Removed redundant requestedMotionEnabled logic or keep it but ensure 'settings' is correct
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

  const surfaceLayer = isDark ? cardTokens.darkSurface : cardTokens.surface
  const mutedLayer = isDark ? cardTokens.darkMuted : cardTokens.muted

  // Special handling for AI Assistant in Warm mode
  // Special handling for AI Assistant in Warm/Green/Cartoon mode
  const isCustomAi =
    (uiStyle === 'warm' || uiStyle === 'green' || uiStyle === 'blue' || uiStyle === 'cartoon') &&
    variant === 'ai-assistant'
  const isCustomMode =
    uiStyle === 'warm' || uiStyle === 'green' || uiStyle === 'blue' || uiStyle === 'cartoon'

  const backgroundValue = isCustomAi
    ? 'linear-gradient(135deg, #1A1A1A, #2A2A2A)'
    : surface === 'glass' && !isCustomMode
      ? `${surfaceLayer}, radial-gradient(circle at 15% 20%, ${mutedLayer}, transparent 42%)`
      : surfaceLayer

  const borderColor = isCustomAi ? '#3A3A3A' : isDark ? cardTokens.darkBorder : cardTokens.border
  const shadowColor = isFocused
    ? isDark
      ? cardTokens.darkActiveShadow
      : cardTokens.activeShadow
    : isDark
      ? cardTokens.darkShadow
      : cardTokens.shadow
  const focusRingClass = isFocused
    ? `ring-2 ring-[color:var(--card-accent)] ring-offset-[3px] ${
        isDark ? 'ring-offset-[rgba(5,8,12,0.9)]' : 'ring-offset-white/80'
      }`
    : ''

  const cardStyle: CSSProperties = {
    '--card-accent': isCustomAi ? (uiStyle === 'green' ? '#0d9488' : '#C27B4A') : cardTokens.accent, // Force copper/green accent for AI card
    background: backgroundValue,
    borderColor: borderColor,
    borderWidth: uiStyle === 'cartoon' ? '2px' : isCustomMode ? '1px' : '1px',
    boxShadow: shadowColor,
    color: isCustomAi ? '#FFFFFF' : undefined, // Force white text for AI card
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
      className={`group relative flex h-full flex-col overflow-hidden px-4 py-3 transition-all duration-300 sm:px-4 sm:py-3 ${className} ${
        // Override rounded-xl for Warm/Green/Blue style
        uiStyle === 'warm' || uiStyle === 'green' || uiStyle === 'blue' || uiStyle === 'cartoon'
          ? 'rounded-xl'
          : 'rounded-3xl'
      } ${focusRingClass}`}
      style={cardStyle}
    >
      {headerHidden && (
        <div className="focuslab-drag-handle absolute inset-x-0 top-0 z-20 h-4 cursor-grab active:cursor-grabbing" />
      )}

      {/* Sparkles decoration for AI Assistant card (Warm/Green style) */}
      {isCustomAi && (
        <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="h-24 w-24 text-white" strokeWidth={1} />
        </div>
      )}

      <div
        className={`focuslab-drag-handle flex items-center justify-between gap-2 ${headerHidden ? 'h-0 min-h-0' : 'h-7'} min-w-0 cursor-grab active:cursor-grabbing`}
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
                <h2
                  className={`max-w-full truncate text-base font-bold whitespace-nowrap ${isCustomAi ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}
                >
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

      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className={`mt-1.5 flex min-h-0 flex-1 flex-col ${bodyClassName}`}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {children}
      </div>

      {customAction && customActionPosition === 'right' && (
        <div className="absolute top-1/2 -right-2 z-50 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:right-0 group-hover:opacity-100">
          <div className="focuslab-no-drag flex translate-x-1/2 items-center">{customAction}</div>
        </div>
      )}
    </motion.section>
  )
}
