'use client'

import { memo } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useThemeColor } from '@/context/ThemeColorContext'
import { CardShell } from '@/components/focus-lab/CardShell'
import { useBrainDump } from '@/components/focus-lab/hooks/useBrainDump'
import { BrainDumpWidget } from '@/components/focus-lab/widgets/BrainDumpWidget'

export const BrainDumpCard = memo(function BrainDumpCard({
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

  // Use the extracted hook
  const brainDump = useBrainDump()

  return (
    <CardShell
      title={t.focusLab.widgets.brainDump.title}
      onDelete={onDeleteAction}
      className={className}
      isFocused={isFocused}
    >
      <BrainDumpWidget brainDump={brainDump} uiStyle={uiStyle} />
    </CardShell>
  )
})
