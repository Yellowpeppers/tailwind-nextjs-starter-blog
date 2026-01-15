'use client'

import { Menu, Transition } from '@headlessui/react'
import { useState, useRef, useEffect, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Send, ChevronDown, Check } from 'lucide-react'
import { useThemeColor } from '@/context/ThemeColorContext'
import { useTranslation } from '@/context/LanguageContext'
import { useBuBuChat } from './useBuBuChat'
import { useVoiceInput } from './useVoiceInput'
import { MessageItem } from './MessageItem'
import { Mic, MicOff } from 'lucide-react'
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
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const {
    messages,
    isLoading,
    error,
    personality,
    setPersonality,
    sendMessage,
    confirmAction,
    cancelAction,
    removeTaskFromPreview,
    clearHistory,
    retry,
  } = useBuBuChat()

  // Personality options configuration
  const personalities = [
    {
      id: 'gentle',
      name: t.bubu?.personality?.gentle || '温柔伙伴',
      icon: '🌸',
      desc: '温暖治愈，倾听你的心声',
    },
    {
      id: 'professional',
      name: t.bubu?.personality?.professional || '效率专家',
      icon: '👔',
      desc: '干练简洁，专注任务管理',
    },
    {
      id: 'energetic',
      name: t.bubu?.personality?.energetic || '活力教练',
      icon: '🔥',
      desc: '激情满满，通过鼓励驱动你',
    },
  ] as const

  const currentPersonality = personalities.find((p) => p.id === personality) || personalities[0]
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px` // Max height 120px
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [inputValue])

  // Voice Input Hook
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isVoiceSupported,
    error: voiceError,
    clearError,
    interimTranscript,
  } = useVoiceInput()

  // Handle voice errors (e.g. permission denied)
  useEffect(() => {
    console.log('[BuBuChatModal] Voice state:', { isVoiceSupported, voiceError, isListening })
  }, [isVoiceSupported, voiceError, isListening])

  // Sync voice transcript to input
  useEffect(() => {
    if (transcript) {
      setInputValue((prev) => {
        // Avoid duplicating if already present (simple check)
        if (prev.endsWith(transcript)) return prev
        const suffix = prev.length > 0 && !prev.endsWith(' ') ? ' ' : ''
        return prev + suffix + transcript
      })
      resetTranscript()
    }
  }, [transcript, resetTranscript])

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return
    sendMessage(inputValue.trim())
    setInputValue('')
    // Reset height manually after send
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
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

  // Render individual message logic moved to MessageItem component

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
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="group flex cursor-pointer items-center gap-2 rounded-lg py-1 pr-2 transition-colors outline-none hover:bg-gray-100 dark:hover:bg-gray-800">
                    <span className="text-xl">{currentPersonality.icon}</span>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="leading-none font-bold text-gray-800 dark:text-gray-100">
                        BuBu
                      </span>
                      <span className="text-[10px] font-medium text-gray-500">
                        {currentPersonality.name}
                      </span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-gray-400 transition-transform group-hover:text-gray-600 group-data-[open]:rotate-180" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 z-50 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:divide-gray-700 dark:bg-gray-800 dark:ring-white/10">
                    <div className="p-1">
                      {personalities.map((p) => (
                        <Menu.Item key={p.id}>
                          {({ active }) => (
                            <button
                              onClick={() => setPersonality(p.id)}
                              className={`${active ? 'bg-primary-50 dark:bg-primary-900/30' : ''} ${
                                personality === p.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                              } group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors`}
                            >
                              <span className="text-lg">{p.icon}</span>
                              <div className="flex flex-col items-start text-left">
                                <span
                                  className={`font-medium ${personality === p.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'}`}
                                >
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  {p.desc}
                                </span>
                              </div>
                              {personality === p.id && (
                                <Check className="text-primary-500 ml-auto h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
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
                  {messages.map((msg, index) => (
                    <MessageItem
                      key={msg.id}
                      message={msg}
                      isLastMessage={index === messages.length - 1}
                      onRemoveTask={removeTaskFromPreview}
                      onConfirmAction={confirmAction}
                      onCancelAction={cancelAction}
                    />
                  ))}

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

            {/* Voice Permission Error Banner - Persistent */}
            {voiceError === 'not-allowed' && (
              <div className="flex items-start justify-between gap-2 border-t border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">🚫 无法访问麦克风</span>
                  <span>1. 请检查浏览器地址栏权限设置 (点击 🔒 图标)</span>
                  <span>2. **修改后请刷新页面** (浏览器限制)</span>
                  <span>
                    3. macOS 用户请检查 系统设置 {'>'} 隐私 {'>'} 麦克风
                  </span>
                </div>
                <button
                  onClick={clearError}
                  className="rounded p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40"
                  title="关闭提示"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Network Error Banner - Chrome requires Google access */}
            {voiceError === 'network' && (
              <div className="flex items-start justify-between gap-2 border-t border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">🌐 语音识别连接失败</span>
                  <span>Chrome 语音识别需要访问 Google 服务器</span>
                  <span>• 请检查网络连接，或使用 Safari 浏览器（本地识别）</span>
                </div>
                <button
                  onClick={clearError}
                  className="rounded p-1 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                  title="关闭提示"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Input area */}
            <div
              className={`shrink-0 border-gray-200 p-4 dark:border-gray-800 ${voiceError ? 'border-t-0' : 'border-t'}`}
            >
              <div className="flex gap-2">
                {/* Voice Input Button */}
                {isVoiceSupported && (
                  <div className="group relative">
                    {/* Tooltip removed in favor of banner */}
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`rounded-full p-2 transition-colors ${
                        isListening
                          ? 'animate-pulse bg-red-100 text-red-500'
                          : voiceError
                            ? 'text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={
                        voiceError === 'not-allowed'
                          ? '麦克风权限被拒绝'
                          : isListening
                            ? 'Stop listening'
                            : 'Start voice input'
                      }
                    >
                      {/* Show alert icon if error, otherwise Mic */}
                      {voiceError === 'not-allowed' ? (
                        <MicOff size={20} />
                      ) : isListening ? (
                        <MicOff size={20} />
                      ) : (
                        <Mic size={20} />
                      )}
                    </button>
                  </div>
                )}

                <textarea
                  ref={inputRef}
                  value={isListening ? inputValue + interimTranscript : inputValue}
                  onChange={(e) => {
                    // 只有非录音状态才允许手动编辑
                    if (!isListening) {
                      setInputValue(e.target.value)
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? '' : t.bubu?.placeholder || '和 BuBu 聊聊天...'}
                  disabled={isLoading}
                  rows={1}
                  className={`focus:border-primary-500 focus:ring-primary-500/20 max-h-[120px] flex-1 resize-none rounded-lg border bg-white px-4 py-2 text-sm outline-none focus:ring-2 disabled:opacity-50 dark:bg-gray-800 ${isListening ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'}`}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-primary-500 hover:bg-primary-600 h-fit self-end rounded-lg px-4 py-2 text-white disabled:opacity-50"
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
