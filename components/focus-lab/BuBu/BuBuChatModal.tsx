'use client'

import { Menu, Transition } from '@headlessui/react'
import { useState, useRef, useEffect, Fragment } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { X, Trash2, Send, ChevronDown, Check, Lock } from 'lucide-react'
import { useThemeColor } from '@/context/ThemeColorContext'
import { useTranslation } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useBuBuChat } from './useBuBuChat'
import { useVoiceInput } from './useVoiceInput'
import { MessageItem } from './MessageItem'
import { Mic, MicOff } from 'lucide-react'
import { FeatureGateModal } from '../FeatureGateModal'
import type { ChatMessage } from './types'

interface BuBuChatModalProps {
  isOpen: boolean
  onClose: () => void
  stats?: { todayMinutes: number; completedTaskCount: number }
  isPro?: boolean
  onUpgrade?: () => void
  onLogin?: () => void
}

export const BuBuChatModal = ({
  isOpen,
  onClose,
  stats,
  isPro = false,
  onUpgrade,
  onLogin,
}: BuBuChatModalProps) => {
  const { t, language: lang } = useTranslation()
  const { user } = useAuth()
  const { uiStyle } = useThemeColor()
  const dragControls = useDragControls()

  // Feature gate modals
  const [showLoginGate, setShowLoginGate] = useState(false)
  const [showUpgradeGate, setShowUpgradeGate] = useState(false)
  const [gateFeature, setGateFeature] = useState('')

  // Theme helpers
  const isCartoon = uiStyle === 'cartoon'
  const isWarm = uiStyle === 'warm'
  const isGreen = uiStyle === 'green'
  const isBlue = uiStyle === 'blue'

  const containerStyle = isCartoon
    ? 'bg-[#FFF8E7] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-[#2A2A2A] dark:border-white dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-xl'
    : isWarm
      ? 'bg-[#F5F2EC] border border-[#ECE8E0] shadow-xl dark:bg-[#1E1C1A] dark:border-[#3E352F] rounded-xl'
      : isGreen
        ? 'bg-[#F8F9F7] border border-[#E2E8E2] shadow-xl dark:bg-[#1A201A] dark:border-[#2F3E2F] rounded-xl'
        : isBlue
          ? 'bg-[#E0EEF8] border border-[#D1E3F3] shadow-xl dark:bg-[#1A1F26] dark:border-[#2F3540] rounded-xl'
          : 'bg-white/95 backdrop-blur-xl shadow-2xl dark:bg-gray-900/95 rounded-2xl'

  const headerBorder = isCartoon
    ? 'border-b-4 border-black dark:border-white'
    : isWarm
      ? 'border-b border-[#ECE8E0] dark:border-[#3E352F]'
      : isGreen
        ? 'border-b border-[#E2E8E2] dark:border-[#2F3E2F]'
        : isBlue
          ? 'border-b border-[#D1E3F3] dark:border-[#2F3540]'
          : 'border-b border-gray-200 dark:border-gray-800'

  const sendBtnStyle = isCartoon
    ? 'bg-black text-white hover:scale-105 active:scale-95 border-2 border-transparent hover:border-black hover:bg-white hover:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-white dark:text-black dark:hover:border-white dark:hover:bg-black dark:hover:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
    : isWarm
      ? 'bg-[#C27B4A] text-white hover:bg-[#A6663E]'
      : isGreen
        ? 'bg-[#7A9F7A] text-white hover:bg-[#688868]'
        : isBlue
          ? 'bg-[#5B84B1] text-white hover:bg-[#4A6E94]'
          : 'bg-primary-500 hover:bg-primary-600'

  const quickCommandStyle = isCartoon
    ? 'border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 rounded-xl font-bold'
    : isWarm
      ? 'bg-white border border-[#ECE8E0] text-[#8D5A36] shadow-sm hover:bg-[#F5F2EC] hover:text-[#C27B4A]'
      : isGreen
        ? 'bg-white border border-[#E2E8E2] text-[#556F55] shadow-sm hover:bg-[#F8F9F7] hover:text-[#7A9F7A]'
        : isBlue
          ? 'bg-white border border-[#D1E3F3] text-[#3F5C7A] shadow-sm hover:bg-[#E0EEF8] hover:text-[#5B84B1]'
          : 'bg-white border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'

  const welcomeBoxStyle = isCartoon
    ? 'border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
    : isWarm
      ? 'bg-[#FDFCF8] border border-[#ECE8E0] text-[#8D5A36]'
      : isGreen
        ? 'bg-[#FCFDFB] border border-[#E2E8E2] text-[#556F55]'
        : isBlue
          ? 'bg-[#F5FAFF] border border-[#D1E3F3] text-[#3F5C7A]'
          : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const {
    messages,
    isLoading,
    error,
    remaining,
    personality,
    setPersonality,
    sendMessage,
    confirmAction,
    cancelAction,
    removeTaskFromPreview,
    clearHistory,
    retry,
  } = useBuBuChat({ stats, isPro })

  // Personality options configuration
  const personalities = [
    {
      id: 'gentle',
      name: t.bubu?.personality?.gentle || '温柔伙伴',
      icon: '🌸',
      desc: lang === 'zh' ? '温暖治愈，倾听你的心声' : 'Warm and healing, listening to you',
      proOnly: false,
    },
    {
      id: 'professional',
      name: t.bubu?.personality?.professional || '效率专家',
      icon: '👔',
      desc: lang === 'zh' ? '干练简洁，专注任务管理' : 'Efficient and focused on tasks',
      proOnly: true,
    },
    {
      id: 'energetic',
      name: t.bubu?.personality?.energetic || '活力教练',
      icon: '🔥',
      desc:
        lang === 'zh' ? '激情满满，通过鼓励驱动你' : 'Energetic, driving you with encouragement',
      proOnly: true,
    },
  ] as const

  // Handle personality change with Pro check
  const handlePersonalityChange = (newPersonality: typeof personality) => {
    const selected = personalities.find((p) => p.id === newPersonality)

    if (selected?.proOnly) {
      if (!user) {
        setGateFeature(lang === 'zh' ? 'Switch Personality' : 'Switch Personality')
        setShowLoginGate(true)
        return
      }
      if (!isPro) {
        setGateFeature(lang === 'zh' ? 'BuBu 性格切换' : 'BuBu Personality Switch')
        setShowUpgradeGate(true)
        return
      }
    }
    setPersonality(newPersonality)
  }

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

  const handleSend = (quickMessageOrEvent?: string | React.MouseEvent) => {
    // Ignore event objects, only accept string messages
    const quickMessage = typeof quickMessageOrEvent === 'string' ? quickMessageOrEvent : undefined
    const messageToSend = quickMessage || inputValue.trim()
    if (!messageToSend || isLoading) return

    // Check if user is logged in
    if (!user) {
      setGateFeature(lang === 'zh' ? 'BuBu AI 助手' : 'BuBu AI Assistant')
      setShowLoginGate(true)
      return
    }

    sendMessage(messageToSend)
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

  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleClearWithConfirm = () => {
    if (messages.length === 0) return
    setShowClearConfirm(true)
  }

  const handleConfirmClear = () => {
    clearHistory()
    setShowClearConfirm(false)
  }

  // Determine styles for confirmation box based on theme
  const confirmBoxStyle = isCartoon
    ? 'border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
    : isWarm
      ? 'bg-[#FDFCF8] border border-[#ECE8E0] shadow-lg'
      : isGreen
        ? 'bg-[#FCFDFB] border border-[#E2E8E2] shadow-lg'
        : isBlue
          ? 'bg-[#F5FAFF] border border-[#D1E3F3] shadow-lg'
          : 'bg-white shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700'

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
      <div className={`w-full rounded-xl p-4 text-left text-xs ${welcomeBoxStyle}`}>
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
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: '-50%', y: 'calc(-50% + 20px)' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, x: '-50%', y: 'calc(-50% + 20px)' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              drag
              dragListener={false}
              dragControls={dragControls}
              dragMomentum={false}
              dragElastic={0}
              className={`fixed inset-0 z-[200] flex h-full w-full flex-col md:top-1/2 md:right-auto md:bottom-auto md:left-1/2 md:h-[600px] md:max-h-[80vh] md:w-[420px] ${containerStyle}`}
            >
              {/* Confirmation Overlay */}
              <AnimatePresence>
                {showClearConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-white/80 p-6 backdrop-blur-sm dark:bg-black/80"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className={`flex w-full max-w-sm flex-col gap-4 overflow-hidden rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 ${confirmBoxStyle}`}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${
                            isCartoon
                              ? 'border-2 border-black bg-yellow-100 text-yellow-600'
                              : isWarm
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          <Trash2 className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {t.bubu?.confirmClear || '确定要清空对话吗？'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          清空后，所有聊天记录将无法恢复。
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            isCartoon
                              ? 'border-2 border-black bg-white hover:bg-gray-50 active:translate-y-[2px]'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {t.common?.cancel || '取消'}
                        </button>
                        <button
                          onClick={handleConfirmClear}
                          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all ${
                            isCartoon
                              ? 'border-2 border-black bg-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 active:translate-y-[2px] active:shadow-none'
                              : 'bg-red-500 shadow-sm hover:bg-red-600'
                          }`}
                        >
                          确认清空
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Header */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className={`flex shrink-0 cursor-move items-center justify-between px-6 py-4 ${headerBorder}`}
              >
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="group flex cursor-pointer items-center gap-3 rounded-lg py-1 pr-2 transition-colors outline-none hover:bg-black/5 dark:hover:bg-white/10">
                      <span className="text-2xl">{currentPersonality.icon}</span>
                      <div className="flex flex-col items-start">
                        <span className="mb-0.5 text-lg leading-none font-black tracking-tight text-gray-900 dark:text-gray-100">
                          BuBu
                        </span>
                        <span className="text-[10px] font-semibold whitespace-nowrap text-gray-500/90">
                          {currentPersonality.name}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-hover:text-gray-600 group-data-[open]:rotate-180" />
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
                                onClick={() => handlePersonalityChange(p.id)}
                                className={`${active ? 'bg-primary-50 dark:bg-primary-900/30' : ''} ${
                                  personality === p.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                } group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors`}
                              >
                                <span className="text-lg">{p.icon}</span>
                                <div className="flex flex-col items-start text-left">
                                  <span
                                    className={`flex items-center gap-1 font-medium ${personality === p.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'}`}
                                  >
                                    {p.name}
                                    {p.proOnly && !isPro && (
                                      <span className="rounded bg-blue-100 px-1 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                        PRO
                                      </span>
                                    )}
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
                  {/* Remaining uses indicator (free users only) */}
                  {!isPro && remaining !== null && remaining >= 0 && (
                    <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">
                        今日剩余{' '}
                        <span
                          className={
                            remaining <= 3
                              ? 'font-bold text-orange-500'
                              : 'font-medium text-gray-700 dark:text-gray-300'
                          }
                        >
                          {remaining}
                        </span>{' '}
                        次
                      </span>
                      {onUpgrade && (
                        <button
                          onClick={onUpgrade}
                          className="text-primary-500 hover:text-primary-600 font-medium"
                        >
                          升级
                        </button>
                      )}
                    </div>
                  )}
                  <button
                    onClick={handleClearWithConfirm}
                    disabled={messages.length === 0}
                    className="rounded-lg p-2 text-gray-400 hover:bg-black/5 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-white/10"
                    title="清空对话"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-gray-400 hover:bg-black/5 hover:text-gray-600 dark:hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages area */}
              <div className="relative flex flex-1 flex-col overflow-hidden">
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
                className={`shrink-0 p-4 ${headerBorder} ${voiceError ? 'border-t-0' : 'border-t'}`}
              >
                {/* Quick Commands */}
                <div className="mb-3 flex flex-wrap gap-2">
                  {[
                    { label: '📋 今日任务', message: '我现在有哪些任务？' },
                    { label: '💪 加油打气', message: '给我一些鼓励吧！' },
                    { label: '🍅 开始专注', message: '帮我开始一个番茄钟' },
                  ].map((cmd) => (
                    <button
                      key={cmd.label}
                      onClick={() => handleSend(cmd.message)}
                      disabled={isLoading}
                      className={`px-4 py-1.5 text-xs transition-all duration-200 ${quickCommandStyle}`}
                    >
                      {cmd.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {/* Voice Input Button - Pro Only */}
                  {isVoiceSupported && (
                    <div className="group relative">
                      <button
                        onClick={() => {
                          if (!user) {
                            setGateFeature(lang === 'zh' ? '语音输入' : 'Voice Input')
                            setShowLoginGate(true)
                            return
                          }
                          if (!isPro) {
                            setGateFeature(lang === 'zh' ? '语音输入' : 'Voice Input')
                            setShowUpgradeGate(true)
                            return
                          }
                          if (isListening) {
                            stopListening()
                          } else {
                            startListening()
                          }
                        }}
                        className={`relative rounded-full p-2 transition-colors ${
                          isListening
                            ? 'animate-pulse bg-red-100 text-red-500'
                            : voiceError
                              ? 'text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={
                          !isPro
                            ? lang === 'zh'
                              ? '语音输入 (Pro)'
                              : 'Voice Input (Pro)'
                            : voiceError === 'not-allowed'
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
                        {/* Pro badge */}
                        {!isPro && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[8px] font-bold text-white">
                            P
                          </span>
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
                    className={`max-h-[120px] flex-1 resize-none rounded-lg border bg-white px-4 py-2 text-sm outline-none focus:ring-2 disabled:opacity-50 dark:bg-gray-800 ${
                      isListening
                        ? 'border-red-300 dark:border-red-700'
                        : isCartoon
                          ? 'border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:ring-0 dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                          : isWarm
                            ? 'border-[#ECE8E0] focus:border-[#C27B4A] focus:ring-[#C27B4A]'
                            : isGreen
                              ? 'border-[#E2E8E2] focus:border-[#7A9F7A] focus:ring-[#7A9F7A]'
                              : isBlue
                                ? 'border-[#D1E3F3] focus:border-[#5B84B1] focus:ring-[#5B84B1]'
                                : 'focus:border-primary-500 focus:ring-primary-500/20 border-gray-300 dark:border-gray-700'
                    }`}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className={`h-fit self-end rounded-lg px-4 py-2 transition-all disabled:opacity-50 ${sendBtnStyle}`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login Gate Modal */}
      <FeatureGateModal
        isOpen={showLoginGate}
        onClose={() => setShowLoginGate(false)}
        type="login"
        feature={gateFeature}
        onAction={() => {
          onLogin?.()
          onClose()
        }}
      />

      {/* Upgrade Gate Modal */}
      <FeatureGateModal
        isOpen={showUpgradeGate}
        onClose={() => setShowUpgradeGate(false)}
        type="upgrade"
        feature={gateFeature}
        onAction={() => {
          onUpgrade?.()
          onClose()
        }}
      />
    </>
  )
}
