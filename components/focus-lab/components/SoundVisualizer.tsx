import React from 'react'
import { motion } from 'framer-motion'
import { UIStyle } from '@/context/ThemeColorContext' // Assuming this is where it is from or we need to check imports

export const SoundVisualizer = ({
  activeCount,
  uiStyle,
}: {
  activeCount: number
  uiStyle?: UIStyle
}) => {
  const isWarm = uiStyle === 'warm'
  const isGreen = uiStyle === 'green'
  const isBlue = uiStyle === 'blue'
  const isCartoon = uiStyle === 'cartoon'

  if (activeCount === 0) {
    return (
      <div className="flex h-12 items-center justify-center gap-1 opacity-30" aria-hidden="true">
        <div className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
      </div>
    )
  }

  return (
    <div className="flex h-12 items-center justify-center gap-1" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, index) => (
        <motion.div
          key={index}
          className={`${isWarm ? 'bg-[#C27B4A]/80' : isGreen ? 'bg-[#7A9F7A]/80' : isBlue ? 'bg-[#5B84B1]/80' : isCartoon ? 'bg-black/80 dark:bg-white/80' : 'bg-primary-500/80'} w-1.5 rounded-full`}
          animate={{
            height: [12, 32 + Math.random() * 16, 12],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.8 + Math.random() * 0.5,
            delay: index * 0.05,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
