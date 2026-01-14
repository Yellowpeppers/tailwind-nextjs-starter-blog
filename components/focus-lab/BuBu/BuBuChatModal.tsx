'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Send, Check, XCircle } from 'lucide-react'
import { useThemeColor } from '@/context/ThemeColorContext'
import { useTranslation } from '@/context/LanguageContext'
import { useBuBuChat } from './useBuBuChat'
import type { ChatMessage } from './types'

interface BuBuChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export const BuBuChatModal = ({ isOpen, onClose }: BuBuChatModalProps) => {
  const { t } = useTranslation()
  const { uiStyle } = useThemeColor()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    messages,
    isLoading,
    error,
    personality,
    sendMessage,
    confirmAction,
    cancelAction,
    removeTaskFromPreview,
    clearHistory,
    retry,
  } = useBuBuChat()

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return
    sendMessage(inputValue.trim())
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClearWithConfirm = () => {
    if (messages.length === 0) return
    if (confirm(t.bubu?.confirmClear || '确定要清空对话吗？')) {
      clearHistory()
    }
  }

  // Render individual message
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user'

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          {!isUser && (
            <div className="from-primary-400 to-primary-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr text-sm font-bold text-white">
              B
            </div>
          )}

          {/* Message bubble */}
          <div className="flex flex-col gap-2">
            <div
              className={`rounded-2xl px-4 py-2.5 ${isUser ? 'bg-primary-500 rounded-br-sm text-white' : 'rounded-bl-sm bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'} `}
            >
              {message.content}
            </div>

            {/* Action preview card (for tasks/ideas) */}
            {message.action && message.action.status === 'pending' && (
              <div className="border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-900/20 mt-1 rounded-xl border-2 p-3">
                <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {message.action.type === 'add_tasks' ? '📝 任务预览：' : '💡 想法：'}
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
                          onClick={() => removeTaskFromPreview(message.id, i)}
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

                {/* Confirmation buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => confirmAction(message.id)}
                    className="bg-primary-500 hover:bg-primary-600 flex-1 rounded-lg py-2 text-sm font-medium text-white"
                  >
                    <Check className="mr-1 inline h-4 w-4" />
                    {message.action.type === 'add_tasks' ? '添加到任务列表' : '添加到想法本'}
                  </button>
                  <button
                    onClick={() => cancelAction(message.id)}
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
                ✓ 已添加{' '}
                {message.action.type === 'add_tasks'
                  ? `${(message.action.payload as string[]).length} 个任务`
                  : '想法'}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Welcome message
  const WelcomeMessage = () => (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="text-6xl">💙</div>
      <div>
        <h3 className="text-lg font-bold">{t.bubu?.welcome?.title || '你好呀！我是 BuBu~'}</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {t.bubu?.welcome?.subtitle || '你可以和我聊聊天，或者告诉我今天要做的事情'}
        </p>
      </div>
      <div className="w-full rounded-xl bg-gray-50 p-4 text-left text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        <div className="mb-2 font-semibold">💡 试试这样说：</div>
        <ul className="space-y-1">
          <li>• "今天要写报告和开会"</li>
          <li>• "帮我记下这个想法：做个时间管理视频"</li>
          <li>• "我有点累了"</li>
        </ul>
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (desktop only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] hidden bg-black/40 backdrop-blur-sm md:block"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed inset-0 z-[100] flex h-full w-full flex-col bg-white/95 backdrop-blur-xl md:top-1/2 md:left-1/2 md:h-[600px] md:max-h-[80vh] md:w-[420px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:shadow-2xl dark:bg-gray-900/95`}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">💬</span>
                <span className="font-bold">BuBu</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearWithConfirm}
                  disabled={messages.length === 0}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-gray-800"
                  title="新对话"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {messages.length === 0 ? (
                <WelcomeMessage />
              ) : (
                <>
                  {messages.map(renderMessage)}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        💭
                      </motion.div>
                      <span className="text-sm">BuBu 正在思考...</span>
                    </div>
                  )}

                  {/* Error state */}
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                      <div className="text-sm text-red-600 dark:text-red-400">❌ {error}</div>
                      <button
                        onClick={retry}
                        className="mt-2 text-sm text-red-500 underline hover:text-red-600"
                      >
                        重试
                      </button>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="shrink-0 border-t border-gray-200 p-4 dark:border-gray-800">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.bubu?.placeholder || '和 BuBu 聊聊天...'}
                  disabled={isLoading}
                  className="focus:border-primary-500 focus:ring-primary-500/20 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-primary-500 hover:bg-primary-600 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
