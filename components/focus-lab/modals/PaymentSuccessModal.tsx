'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useTranslation } from '@/context/LanguageContext'
import { X } from 'lucide-react'

interface PaymentSuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PaymentSuccessModal = ({ isOpen, onClose }: PaymentSuccessModalProps) => {
  const { language: lang } = useTranslation()
  const [countdown, setCountdown] = useState(5)

  // Trigger confetti on mount
  useEffect(() => {
    if (isOpen) {
      // Fire confetti
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 }

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min
      }

      const interval: ReturnType<typeof setInterval> = setInterval(function () {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-5xl">
                🎉
              </div>

              <h2 className="mb-2 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-2xl font-bold text-transparent">
                {lang === 'zh' ? '欢迎加入 Pro 会员！' : 'Welcome to Focus Lab Pro!'}
              </h2>

              <p className="mb-8 text-gray-500 dark:text-gray-400">
                {lang === 'zh'
                  ? '您的账户已成功升级。现在您可以尽情享受无限 AI 对话、语音输入和高级报表功能了！'
                  : 'Your account has been successfully upgraded. Enjoy unlimited AI chats, voice input, and advanced analytics now!'}
              </p>

              <button
                onClick={onClose}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] hover:shadow-amber-500/40 active:scale-95"
              >
                {lang === 'zh' ? '开始专注' : 'Start Focusing'}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
