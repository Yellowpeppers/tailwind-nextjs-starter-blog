import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/context/LanguageContext'
import { useThemeColor } from '@/context/ThemeColorContext'
import { CardShell } from '@/components/focus-lab/CardShell'
import { FocusStation } from '../FocusStation'
import { ScratchCard } from '../components/ScratchCard'
import { UseToDoManagerResult } from '../hooks/useToDoManager'
import { MoreHorizontalIcon } from '../icons'

export const ToDoCard = ({
  todo,
  cols,
  onDelete,
  className,
  isFocused,
  externalFocusedTaskId, // Allow overriding if needed, or take from todo.state.focusedTask
}: {
  todo: UseToDoManagerResult
  cols?: number
  onDelete?: () => void
  className?: string
  isFocused?: boolean
  externalFocusedTaskId?: string | null
}) => {
  const { t } = useTranslation()
  const { uiStyle } = useThemeColor()
  const [isFlipped, setIsFlipped] = useState(false)
  const isCartoon = uiStyle === 'cartoon'

  // If externalFocusedTaskId is provided (e.g. from parent state), use it.
  // Otherwise derive from todo.state.focusedTask.id
  const focusedTaskId = externalFocusedTaskId ?? todo.state.focusedTask?.id ?? null

  return (
    <CardShell
      // Hide header when flipped so ScratchCard can take over the full area
      showHeader={!isFlipped}
      title={t.focusLab.widgets.todo.title}
      onDelete={onDelete}
      // Remove padding when flipped
      className={`${className} ${isFlipped ? '!overflow-hidden !p-0' : ''}`}
      // Remove top margin when flipped
      bodyClassName={isFlipped ? '!mt-0' : ''}
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
          aria-label={t.focusLab.widgets.todo.flipToScratch || 'Flip to Scratch Card'}
          title={t.focusLab.widgets.todo.flipToScratch || 'Flip to Scratch Card'}
        >
          <MoreHorizontalIcon className="h-5 w-5" />
        </button>
      }
    >
      <AnimatePresence mode="wait">
        {isFlipped ? (
          <motion.div
            key="back"
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -180 }}
            transition={{ duration: 0.3 }}
            className="flex h-full w-full flex-col"
          >
            <ScratchCard
              onStartFocus={(task, id) => {
                todo.actions.handleStartFocus(task, id)
                setIsFlipped(false)
              }}
              onFlipBack={() => setIsFlipped(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-full min-h-0 flex-col"
          >
            <FocusStation
              cols={cols}
              onStartFocusAction={todo.actions.handleStartFocus}
              focusedTaskId={focusedTaskId}
              onTaskCompleteAction={todo.actions.handleTaskComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </CardShell>
  )
}
