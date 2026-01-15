import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Check, X, XCircle } from 'lucide-react'
import { Typewriter } from './Typewriter'
import type { ChatMessage } from './types'
import { memo, useMemo } from 'react'

interface MessageItemProps {
  message: ChatMessage
  isLastMessage: boolean
  onRemoveTask: (messageId: string, index: number) => void
  onConfirmAction: (messageId: string) => void
  onCancelAction: (messageId: string) => void
}

const MessageItem = memo(
  ({ message, isLastMessage, onRemoveTask, onConfirmAction, onCancelAction }: MessageItemProps) => {
    const isUser = message.role === 'user'

    const components = useMemo(
      () => ({
        // Override link to open in new tab
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        a: ({ node, children, ...props }: any) => (
          <a target="_blank" rel="noopener noreferrer" {...props}>
            {children}
          </a>
        ),
        // Reduce margin on paragraphs with typewriter effect for last message
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        p: ({ node, children, ...props }: any) => {
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
            <div className="from-primary-400 to-primary-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr text-sm font-bold text-white">
              B
            </div>
          )}

          {/* Message bubble */}
          <div className="flex min-w-0 flex-col gap-2">
            <div
              className={`rounded-2xl px-4 py-2.5 ${
                isUser
                  ? 'bg-primary-500 rounded-br-sm text-white'
                  : 'rounded-bl-sm bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              } `}
            >
              <div
                className={`prose prose-sm max-w-none break-words ${
                  isUser ? 'prose-invert text-white' : 'dark:prose-invert'
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Action preview card (for tasks/ideas) */}
            {message.action && message.action.status === 'pending' && (
              <div className="border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/20 mt-1 rounded-xl border-2 p-3">
                <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {message.action.type === 'add_tasks' && '📝 任务预览：'}
                  {message.action.type === 'add_idea' && '💡 想法：'}
                  {message.action.type === 'complete_task' && '✅ 标记完成：'}
                  {message.action.type === 'delete_task' && '🗑️ 删除任务：'}
                </div>

                {/* Tasks list */}
                {message.action.type === 'add_tasks' && (
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
                {message.action.type === 'add_idea' && (
                  <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    "{message.action.payload as string}"
                  </div>
                )}

                {/* Complete/Delete task preview */}
                {(message.action.type === 'complete_task' ||
                  message.action.type === 'delete_task') && (
                  <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    {message.action.payload as string}
                  </div>
                )}

                {/* Confirmation buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onConfirmAction(message.id)}
                    className="bg-primary-500 hover:bg-primary-600 flex-1 rounded-lg py-2 text-sm font-medium text-white"
                  >
                    <Check className="mr-1 inline h-4 w-4" />
                    {message.action.type === 'add_tasks' && '添加到任务列表'}
                    {message.action.type === 'add_idea' && '添加到想法本'}
                    {message.action.type === 'complete_task' && '确认完成'}
                    {message.action.type === 'delete_task' && '确认删除'}
                  </button>
                  <button
                    onClick={() => onCancelAction(message.id)}
                    className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="inline h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Confirmed state */}
            {message.action && message.action.status === 'confirmed' && (
              <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                {message.action.type === 'add_tasks' &&
                  `✓ 已添加 ${(message.action.payload as string[]).length} 个任务`}
                {message.action.type === 'add_idea' && '✓ 已添加想法'}
                {message.action.type === 'complete_task' && '✓ 已标记完成'}
                {message.action.type === 'delete_task' && '✓ 已删除'}
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
