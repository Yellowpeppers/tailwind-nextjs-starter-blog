'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/context/LanguageContext'

export interface ResetConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ResetConfirmModal = ({ isOpen, onClose, onConfirm }: ResetConfirmModalProps) => {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm dark:bg-black/40"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
          >
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              {t.focusLab.controls.resetLayout || 'Reset Layout?'}
            </h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {t.focusLab.controls.resetConfirm ||
                'This will restore the default layout arrangement. Your custom changes will be lost.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t.focusLab.common?.cancel || 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                {t.focusLab.controls.resetLayout || 'Reset'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
