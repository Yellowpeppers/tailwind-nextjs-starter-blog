'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { BuBuFloatingButton } from './BuBuFloatingButton'
import { BuBuChatModal } from './BuBuChatModal'

interface BuBuProps {
  stats?: { todayMinutes: number; completedTaskCount: number }
  isPro?: boolean
  onUpgrade?: () => void
  onLogin?: () => void
}

export const BuBu = ({ stats, isPro = false, onUpgrade, onLogin }: BuBuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <>
      <BuBuFloatingButton onClick={() => setIsOpen(true)} />
      <BuBuChatModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        stats={stats}
        isPro={isPro}
        onUpgrade={onUpgrade}
        onLogin={onLogin}
      />
    </>,
    document.body
  )
}
