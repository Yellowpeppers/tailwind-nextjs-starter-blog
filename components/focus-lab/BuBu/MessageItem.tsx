import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Check, X, XCircle } from 'lucide-react'
import { Typewriter } from './Typewriter'
import type { ChatMessage } from './types'
import { memo, useMemo, useState, useEffect, useRef } from 'react'

interface MessageItemProps {
  message: ChatMessage
  isLastMessage: boolean
  onRemoveTask: (messageId: string, index: number) => void
  onConfirmAction: (messageId: string) => void
  onCancelAction: (messageId: string) => void
}

const AutoConfirmCard = ({
  message,
  isLastMessage,
  onConfirm,
  onCancel,
  onRemoveTask,
}: {
  message: ChatMessage
  isLastMessage: boolean
  onConfirm: () => void
  onCancel: () => void
  onRemoveTask: (messageId: string, index: number) => void
}) => {
  const [timeLeft, setTimeLeft] = useState(3)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only auto-confirm if it's the last message
    if (!isLastMessage) return

    if (timeLeft > 0 && !isPaused) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      onConfirm()
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [timeLeft, isPaused, isLastMessage, onConfirm])

  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  // Progress percentage for the bar (3s -> 0s)
  const progress = ((3 - timeLeft) / 3) * 100

  return (
    <div
      className="border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/20 relative mt-1 overflow-hidden rounded-xl border-2 p-3"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Auto-confirm Progress Bar (Background) */}
      {isLastMessage && timeLeft > 0 && (
        <div
          className="bg-primary-500/30 absolute bottom-0 left-0 h-1 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      )}

      <div className="mb-2 flex justify-between text-sm font-semibold text-gray-700 dark:text-gray-300">
        <div>
          {message.action?.type === 'add_tasks' && '📝 任务预览：'}
          {message.action?.type === 'add_idea' && '💡 想法：'}
          {message.action?.type === 'complete_task' && '✅ 标记完成：'}
          {message.action?.type === 'delete_task' && '🗑️ 删除任务：'}
          {message.action?.type === 'uncomplete_task' && '↩️ 标记为未完成：'}
          {message.action?.type === 'delete_idea' && '🗑️ 删除想法：'}
          {(message.action?.type === 'update_task' || message.action?.type === 'update_idea') &&
            '✏️ 修改内容：'}
          {message.action?.type === 'start_pomodoro' && '⏱️ 开启专注：'}
          {message.action?.type === 'control_ambience' && '🎵 播放声音：'}
        </div>
      </div>

      {/* Tasks list */}
      {message.action?.type === 'add_tasks' && (
        <ul className="mb-3 space-y-1.5">
          {(message.action.payload as string[]).map((task, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <span>• {task}</span>
              <button
                onClick={() => onRemoveTask(message.id, i)}
                className="ml-auto text-gray-400 hover:text-red-500"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Single idea */}
      {message.action?.type === 'add_idea' && (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          "{message.action.payload as string}"
        </div>
      )}

      {/* Complete/Delete/Uncomplete task preview - supports array */}
      {(message.action?.type === 'complete_task' ||
        message.action?.type === 'delete_task' ||
        message.action?.type === 'uncomplete_task' ||
        message.action?.type === 'delete_idea') && (
        <ul className="mb-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {(Array.isArray(message.action.payload)
            ? (message.action.payload as string[])
            : [message.action.payload as string]
          ).map((task, i) => (
            <li key={i}>• {task}</li>
          ))}
        </ul>
      )}

      {/* Update task/idea preview */}
      {(message.action?.type === 'update_task' || message.action?.type === 'update_idea') && (
        <div className="mb-3 space-y-2 text-sm">
          <div className="text-gray-500 line-through">
            {(message.action.payload as { oldContent: string }).oldContent}
          </div>
          <div className="text-gray-500">↓</div>
          <div className="text-gray-800 dark:text-gray-200">
            {(message.action.payload as { newContent: string }).newContent}
          </div>
        </div>
      )}

      {/* Pomodoro/Ambience preview */}
      {message.action?.type === 'start_pomodoro' && (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          {(() => {
            const payload = message.action.payload as { duration?: number; mode?: string }
            const mode =
              payload.mode === 'short' ? '短休息' : payload.mode === 'long' ? '长休息' : '专注'
            const duration = payload.duration || 25
            return `${mode} ${duration} 分钟`
          })()}
        </div>
      )}

      {message.action?.type === 'control_ambience' && (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          {(() => {
            const payload = message.action.payload as { action: string; sound?: string }
            if (payload.action === 'stop' || payload.action === 'pause') return '停止播放'
            if (payload.action === 'play')
              return payload.sound ? `播放 ${payload.sound}` : '恢复播放'
            return '调整音量'
          })()}
        </div>
      )}

      {/* Confirmation buttons */}
      <div className="relative z-10 flex gap-2">
        <button
          onClick={onConfirm}
          className="bg-primary-500 hover:bg-primary-600 flex-1 rounded-lg py-2 text-sm font-medium text-white transition-colors"
        >
          <Check className="mr-1 inline h-4 w-4" />
          {timeLeft > 0 && isLastMessage && !isPaused ? `自动执行 (${timeLeft})` : '确认执行'}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="inline h-4 w-4" />
          {isLastMessage && timeLeft > 0 ? '取消' : ''}
        </button>
      </div>
    </div>
  )
}

import { useThemeColor } from '@/context/ThemeColorContext' // Add this import

const MessageItem = memo(
  ({ message, isLastMessage, onRemoveTask, onConfirmAction, onCancelAction }: MessageItemProps) => {
    const { uiStyle } = useThemeColor()
    const isUser = message.role === 'user'

    // Theme helpers
    const isCartoon = uiStyle === 'cartoon'
    const isWarm = uiStyle === 'warm'
    const isGreen = uiStyle === 'green'
    const isBlue = uiStyle === 'blue'

    // Bubble Styles
    const userBubbleStyle = isCartoon
      ? 'bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-white dark:text-black dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] rounded-xl rounded-br-sm'
      : isWarm
        ? 'bg-[#C27B4A] text-white rounded-2xl rounded-br-sm'
        : isGreen
          ? 'bg-[#7A9F7A] text-white rounded-2xl rounded-br-sm'
          : isBlue
            ? 'bg-[#5B84B1] text-white rounded-2xl rounded-br-sm'
            : 'bg-primary-500 text-white rounded-2xl rounded-br-sm'

    const aiBubbleStyle = isCartoon
      ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:text-white dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] rounded-xl rounded-bl-sm'
      : isWarm
        ? 'bg-[#F5F2EC] text-gray-900 border border-[#ECE8E0] dark:bg-[#1E1C1A] dark:text-gray-100 dark:border-[#3E352F] rounded-2xl rounded-bl-sm'
        : isGreen
          ? 'bg-[#F8F9F7] text-gray-900 border border-[#E2E8E2] dark:bg-[#1A201A] dark:text-gray-100 dark:border-[#2F3E2F] rounded-2xl rounded-bl-sm'
          : isBlue
            ? 'bg-[#E0EEF8] text-gray-900 border border-[#D1E3F3] dark:bg-[#1A1F26] dark:text-gray-100 dark:border-[#2F3540] rounded-2xl rounded-bl-sm'
            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-2xl rounded-bl-sm'

    const avatarStyle = isCartoon
      ? 'bg-black text-white border border-black dark:bg-white dark:text-black dark:border-white'
      : isWarm
        ? 'bg-gradient-to-tr from-[#C27B4A] to-[#A6663E] text-white'
        : isGreen
          ? 'bg-gradient-to-tr from-[#7A9F7A] to-[#688868] text-white'
          : isBlue
            ? 'bg-gradient-to-tr from-[#5B84B1] to-[#4A6E94] text-white'
            : 'bg-gradient-to-tr from-primary-400 to-primary-600 text-white'

    const components = useMemo(
      () => ({
        // Override link to open in new tab
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        a: ({ node, children, ...props }: React.ComponentPropsWithoutRef<'a'> & { node?: any }) => (
          <a target="_blank" rel="noopener noreferrer" {...props}>
            {children}
          </a>
        ),
        // Reduce margin on paragraphs with typewriter effect for last message
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        p: ({ node, children, ...props }: React.ComponentPropsWithoutRef<'p'> & { node?: any }) => {
          const isAssistant = message.role === 'assistant'

          if (isLastMessage && isAssistant && typeof children === 'string') {
            return (
              <p className="mb-1 last:mb-0" {...props}>
                <Typewriter text={children} speed={20} />
              </p>
            )
          }
          return (
            <p className="mb-1 last:mb-0" {...props}>
              {children}
            </p>
          )
        },
      }),
      [isLastMessage, message.role]
    )

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          {!isUser && (
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarStyle}`}
            >
              B
            </div>
          )}

          {/* Message bubble */}
          <div className="flex min-w-0 flex-col gap-2">
            <div className={`px-4 py-2.5 ${isUser ? userBubbleStyle : aiBubbleStyle}`}>
              <div
                className={`prose prose-sm max-w-none break-words ${
                  isUser ? 'prose-invert text-white' : 'dark:prose-invert'
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                  {typeof message.content === 'string' ? message.content : String(message.content)}
                </ReactMarkdown>
              </div>
            </div>

            {/* Action preview card (for tasks/ideas) */}
            {message.action && message.action.status === 'pending' && (
              <AutoConfirmCard
                message={message}
                isLastMessage={isLastMessage}
                onConfirm={() => onConfirmAction(message.id)}
                onCancel={() => onCancelAction(message.id)}
                onRemoveTask={onRemoveTask}
              />
            )}

            {/* Confirmed state */}
            {message.action && message.action.status === 'confirmed' && (
              <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                {message.action.type === 'add_tasks' &&
                  `✓ 已添加 ${(message.action.payload as string[]).length} 个任务`}
                {message.action.type === 'add_idea' && '✓ 已添加想法'}
                {message.action.type === 'complete_task' && '✓ 已标记完成'}
                {message.action.type === 'delete_task' && '✓ 已删除'}
                {message.action.type === 'uncomplete_task' && '✓ 已标记为未完成'}
                {message.action.type === 'delete_idea' && '✓ 已删除想法'}
                {(message.action.type === 'update_task' || message.action.type === 'update_idea') &&
                  '✓ 已修改'}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }
)

MessageItem.displayName = 'MessageItem'

export { MessageItem }
