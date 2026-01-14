'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { BuBuFloatingButton } from './BuBuFloatingButton'
import { BuBuChatModal } from './BuBuChatModal'

export const BuBu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <>
      <BuBuFloatingButton onClick={() => setIsOpen(true)} />
      <BuBuChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>,
    document.body
  )
}
