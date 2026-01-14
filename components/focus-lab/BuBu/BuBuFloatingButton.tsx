'use client'

import { motion } from 'framer-motion'
import { useThemeColor } from '@/context/ThemeColorContext'

interface BuBuFloatingButtonProps {
  onClick: () => void
  hasNewFeature?: boolean
}

export const BuBuFloatingButton = ({ onClick, hasNewFeature = true }: BuBuFloatingButtonProps) => {
  const { uiStyle } = useThemeColor()

  // Theme-specific styles
  const getButtonStyles = () => {
    if (uiStyle === 'cartoon') {
      return 'border-4 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
    }

    // Gradient styles for other themes
    const gradients = {
      default: 'from-primary-500 to-primary-600',
      warm: 'from-[#C27B4A] to-[#A6663E]',
      green: 'from-[#7A9F7A] to-[#688868]',
      blue: 'from-[#5B84B1] to-[#4A6E94]',
    }

    const gradient = gradients[uiStyle as keyof typeof gradients] || gradients.default

    return `bg-gradient-to-tr ${gradient} text-white shadow-2xl hover:scale-110 active:scale-95`
  }

  return (
    <motion.button
      onClick={onClick}
      className={`fixed right-6 bottom-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 sm:right-4 sm:bottom-20 md:right-6 md:bottom-6 ${getButtonStyles()} `}
      whileHover={{ scale: uiStyle === 'cartoon' ? 1 : 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* BuBu Icon (using emoji for now，later can be replaced with custom SVG) */}
      <span className="text-3xl">💬</span>

      {/* NEW badge */}
      {hasNewFeature && (
        <motion.div
          className="absolute -top-1 -right-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          NEW
        </motion.div>
      )}

      {/* Pulse animation ring */}
      <motion.div
        className="border-primary-400 absolute inset-0 rounded-full border-2 opacity-0"
        animate={{
          scale: [1, 1.3, 1.3],
          opacity: [0.5, 0, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      />
    </motion.button>
  )
}
