'use client'

import { useState, memo } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useThemeColor } from '@/context/ThemeColorContext'
import { CardShell } from '@/components/focus-lab/CardShell'
import { MoreHorizontalIcon } from '@/components/focus-lab/icons'
import { useSoundSystem } from '@/components/focus-lab/hooks/useSoundSystem'
import { SonicShieldWidget } from '@/components/focus-lab/widgets/SonicShieldWidget'

export const SonicShieldCard = memo(function SonicShieldCard({
  onDeleteAction,
  className,
  isFocused,
}: {
  onDeleteAction?: () => void
  className?: string
  isFocused?: boolean
}) {
  const { t } = useTranslation()
  const { uiStyle } = useThemeColor()
  const isCartoon = uiStyle === 'cartoon'
  const [isFlipped, setIsFlipped] = useState(false)

  // Use the extracted hook
  const sound = useSoundSystem()

  return (
    <CardShell
      title={t.focusLab.widgets.sonicShield.title}
      onDelete={onDeleteAction}
      className={className}
      isFocused={isFocused}
      customActionPosition="right"
      customAction={
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsFlipped(!isFlipped)
          }}
          className={`flex aspect-square h-8 w-8 shrink-0 items-center justify-center rounded-2xl shadow-lg ring-1 transition-all ${
            isFlipped
              ? uiStyle === 'cartoon'
                ? 'border-2 border-black bg-black text-white shadow-none'
                : 'bg-gray-100 text-gray-900 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700'
              : uiStyle === 'cartoon'
                ? 'border-2 border-transparent text-black hover:border-black hover:bg-white hover:text-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-gray-400 ring-gray-100 hover:bg-gray-50 hover:text-gray-600 dark:bg-gray-900 dark:text-gray-500 dark:ring-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-300'
          }`}
          aria-label={t.focusLab.widgets.sonicShield.settings?.title || 'Settings'}
        >
          <MoreHorizontalIcon className="h-5 w-5" />
        </button>
      }
    >
      <SonicShieldWidget sound={sound} isFlipped={isFlipped} onFlip={setIsFlipped} />
    </CardShell>
  )
})
