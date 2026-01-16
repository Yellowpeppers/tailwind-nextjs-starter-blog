'use client'

import { useState, memo } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useThemeColor } from '@/context/ThemeColorContext'
import { CardShell } from '@/components/focus-lab/CardShell'
import { useTaskBreaker } from '@/components/focus-lab/hooks/useTaskBreaker'
import { TaskBreakerWidget } from '@/components/focus-lab/widgets/TaskBreakerWidget'

export const TaskBreakerCard = memo(function TaskBreakerCard({
  onDeleteAction,
  className,
  isFocused,
  onLogin,
}: {
  onDeleteAction?: () => void
  onLogin?: () => void
  className?: string
  isFocused?: boolean
}) {
  const { t } = useTranslation()
  const { uiStyle } = useThemeColor()
  const [isResultView, setIsResultView] = useState(false)

  // Use the extracted hook
  const taskBreaker = useTaskBreaker((isResult) => setIsResultView(isResult))

  return (
    <CardShell
      title={t.focusLab.widgets.taskBreaker.title}
      onDelete={onDeleteAction}
      className={className}
      isFocused={isFocused}
      variant={isResultView ? 'default' : 'ai-assistant'}
    >
      <TaskBreakerWidget
        taskBreaker={taskBreaker}
        uiStyle={uiStyle}
        isResultView={isResultView}
        onLogin={onLogin}
      />
    </CardShell>
  )
})
