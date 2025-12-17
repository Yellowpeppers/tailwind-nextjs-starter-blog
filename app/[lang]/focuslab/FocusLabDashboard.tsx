'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { FocusLabLanding } from '@/components/focus-lab/FocusLabLanding'
import { FocusSettingsProvider } from '@/components/focus-lab/FocusSettingsContext'

// Lazy load the heavy dashboard application
const FocusLabAppLazy = dynamic(
  () => import('@/components/focus-lab/FocusLabApp').then((mod) => mod.FocusLabApp),
  {
    loading: () => null,
    ssr: false, // Dashboard relies heavily on browser APIs
  }
)

export const FocusLabDashboard = () => {
  const [isFocusMode, setIsFocusMode] = useState(false)

  return (
    <div className="relative min-h-screen font-sans">
      <AnimatePresence mode="wait">
        {!isFocusMode ? (
          <motion.div
            key="landing"
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-0"
          >
            <FocusLabLanding onEnter={() => setIsFocusMode(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-10"
          >
            <FocusSettingsProvider>
              <FocusLabAppLazy />
            </FocusSettingsProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
