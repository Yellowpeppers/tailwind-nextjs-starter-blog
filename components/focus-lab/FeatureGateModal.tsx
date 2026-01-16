'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslation } from '@/context/LanguageContext'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface FeatureGateModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'login' | 'upgrade'
  feature: string // e.g., 'BuBu AI', 'Voice Input', 'Task Breaker'
  onAction: () => void // Login or Upgrade action
}

export const FeatureGateModal = ({
  isOpen,
  onClose,
  type,
  feature,
  onAction,
}: FeatureGateModalProps) => {
  const { language: lang } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const isLogin = type === 'login'

  // 温馨的文案
  const content = isLogin
    ? {
        icon: '🔐',
        title: lang === 'zh' ? '登录后解锁更多功能' : 'Login to Unlock More Features',
        subtitle:
          lang === 'zh'
            ? `${feature} 是我们为注册用户准备的贴心功能`
            : `${feature} is a feature prepared for registered users`,
        description:
          lang === 'zh'
            ? '注册或登录后，你可以享受 AI 助手、任务拆解、云端同步等专属功能，让专注更高效 ✨'
            : 'After registration, you can enjoy AI assistant, task breakdown, cloud sync and more ✨',
        actionText: lang === 'zh' ? '立即登录 / 注册' : 'Login / Sign Up',
        cancelText: lang === 'zh' ? '稍后再说' : 'Maybe Later',
      }
    : {
        icon: '⭐',
        title: lang === 'zh' ? '升级解锁 Pro 功能' : 'Upgrade to Unlock Pro Features',
        subtitle:
          lang === 'zh'
            ? `${feature} 是 Pro 会员专属功能`
            : `${feature} is a Pro member exclusive feature`,
        description:
          lang === 'zh'
            ? '升级 Pro 后，你可以无限使用 AI 助手、享受语音输入、查看详细报表，还能解锁更多性格模式 🚀'
            : 'Upgrade to Pro for unlimited AI, voice input, detailed reports, and more personality modes 🚀',
        actionText: lang === 'zh' ? '查看 Pro 权益' : 'View Pro Benefits',
        cancelText: lang === 'zh' ? '继续免费使用' : 'Continue Free',
      }

  if (!isOpen || !mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="p-8 text-center">
              {/* Icon */}
              <div className="mb-4 text-6xl">{content.icon}</div>

              {/* Title */}
              <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                {content.title}
              </h3>

              {/* Subtitle */}
              <p className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                {content.subtitle}
              </p>

              {/* Description */}
              <p className="mb-6 text-gray-600 dark:text-gray-300">{content.description}</p>

              {/* Feature highlights */}
              {isLogin ? (
                <div className="mb-6 flex flex-wrap justify-center gap-2">
                  {[
                    lang === 'zh' ? '🤖 AI 助手' : '🤖 AI Assistant',
                    lang === 'zh' ? '📋 任务拆解' : '📋 Task Breakdown',
                    lang === 'zh' ? '☁️ 云端同步' : '☁️ Cloud Sync',
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mb-6 flex flex-wrap justify-center gap-2">
                  {[
                    lang === 'zh' ? '♾️ 无限 AI' : '♾️ Unlimited AI',
                    lang === 'zh' ? '🎤 语音输入' : '🎤 Voice Input',
                    lang === 'zh' ? '📊 详细报表' : '📊 Detailed Reports',
                    lang === 'zh' ? '🎭 全部性格' : '🎭 All Personalities',
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    onAction()
                    onClose()
                  }}
                  className={`w-full rounded-xl py-3 text-center font-semibold text-white transition-all ${
                    isLogin
                      ? 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                  }`}
                >
                  {content.actionText}
                </button>
                <button
                  onClick={onClose}
                  className="w-full rounded-xl py-3 text-center font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  {content.cancelText}
                </button>
              </div>
            </div>

            {/* Bottom decoration */}
            <div
              className={`h-1 w-full ${
                isLogin
                  ? 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300'
                  : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
              }`}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
