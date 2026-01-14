'use client'

import { useState } from 'react'
import { BuBuFloatingButton } from './BuBuFloatingButton'
import { BuBuChatModal } from './BuBuChatModal'

export const BuBu = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <BuBuFloatingButton onClick={() => setIsOpen(true)} />
      <BuBuChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
