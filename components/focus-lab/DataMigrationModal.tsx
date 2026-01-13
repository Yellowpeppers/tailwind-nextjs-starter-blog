'use client'

import { useTranslation } from '@/context/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'

interface DataMigrationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  isMigrating?: boolean
}

export default function DataMigrationModal({
  isOpen,
  onConfirm,
  onCancel,
  isMigrating = false,
}: DataMigrationModalProps) {
  const { t, language } = useTranslation()

  if (!isOpen) return null

  const isEn = language === 'en'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-primary-900/30 fixed inset-0 backdrop-blur-sm"
          onClick={isMigrating ? undefined : onCancel}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="no-scrollbar relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
        >
          <div className="p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              {isEn ? 'Sync Local Data?' : '同步本地数据？'}
            </h3>

            <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {isEn
                ? 'We found existing data (tasks, settings) on this device. Would you like to merge it into your account?'
                : '我们在当前设备上发现了现有的数据（任务、设置）。您想将其合并到您的账户中吗？'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isMigrating}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {isEn ? 'No, Start Fresh' : '不，重新开始'}
              </button>

              <button
                onClick={onConfirm}
                disabled={isMigrating}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all dark:shadow-blue-900/20"
              >
                {isMigrating ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isEn ? 'Syncing...' : '同步中...'}
                  </>
                ) : isEn ? (
                  'Yes, Sync Data'
                ) : (
                  '是的，同步数据'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
