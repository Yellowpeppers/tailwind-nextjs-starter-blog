'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type EncouragementToastProps = {
  message: string | null
  onClose: () => void
}

export const EncouragementToast = ({ message, onClose }: EncouragementToastProps) => {
  console.log('[Debug] EncouragementToast rendered, message:', message)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (message) {
      console.log('Toast showing message:', message)
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [message, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {message && (
        <div
          className="pointer-events-none fixed right-0 bottom-20 left-0 z-[10000] flex justify-center px-4"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <motion.div
            key="encouragement-toast"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-gray-100 bg-white/95 px-6 py-3 font-medium text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/95 dark:text-gray-100 dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]"
          >
            <span className="text-xl">🎉</span>
            <span>{message}</span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
