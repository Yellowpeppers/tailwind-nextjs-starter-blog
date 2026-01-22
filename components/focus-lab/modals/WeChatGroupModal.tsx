import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon } from '@/components/focus-lab/icons'

export const WeChatGroupModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-auto relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XIcon className="h-5 w-5" />
              </button>
              <div className="flex flex-col items-center gap-4 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">加入微信交流群</h3>
                <p className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="block">扫码加入 Focus Lab 官方交流群</span>
                  <span className="block">获取更多使用技巧与内测福利</span>
                </p>
                <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/static/images/focuslab/qr/latest.jpg?v=2"
                    alt="WeChat Group QR"
                    className="h-64 w-64 object-cover"
                  />
                </div>
                <p className="text-xs text-gray-400">扫码识别或截图保存识别</p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
