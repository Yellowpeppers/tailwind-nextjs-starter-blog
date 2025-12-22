'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useTranslation } from '@/context/LanguageContext'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

import {
  STATION_SYNC_EVENT,
  createFocusItem,
  readStationStorage,
  saveStationItems,
  fetchCloudItems,
  uploadImage,
  type FocusItem,
} from './focusStationStorage'
import PlanComparisonModal from '@/components/auth/PlanComparisonModal'

const UpgradeModal = PlanComparisonModal

// Simple Upgrade Modal
// Simple Upgrade Modal Replaced by PlanComparisonModal

// --- Icons ---
const PlusIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--add-circle-outline] ${className}`} />
)

const TrashIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--trash-bin-minimalistic-outline] ${className}`} />
)

const CheckIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--check-read-linear] ${className}`} />
)

const TargetIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--target-outline] ${className}`} />
)

const XIcon = ({ className }: { className?: string }) => (
  <span className={`icon-[solar--close-circle-outline] ${className}`} />
)

export const FocusStation = ({
  cols = 1,
  onStartFocus,
  focusedTaskId,
}: {
  cols?: number
  onStartFocus?: (task: string, id: string) => void
  focusedTaskId?: string | null
}) => {
  const { t, language: lang } = useTranslation()
  const { user } = useAuth()
  const [items, setItems] = useState<FocusItem[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  // Upgrade modal state - keep it just in case, but triggered properly
  const [showUpgrade, setShowUpgrade] = useState(false)
  const ITEM_LIMIT = 20
  const isLimitReached = items.length >= ITEM_LIMIT

  // Track which user the current items belong to.
  // This prevents "Guest Items" from being saved to "New User" immediately upon login
  // before the load effect has a chance to fetch the user's actual data.
  const dataOwnerId = useRef<string | undefined>(undefined)

  // Load logic
  useEffect(() => {
    const loadItems = async () => {
      try {
        if (user) {
          const cloudItems = await fetchCloudItems(user)
          if (cloudItems) {
            setItems(cloudItems)
          } else {
            setItems(readStationStorage(user.id))
          }
          dataOwnerId.current = user.id
        } else {
          setItems(readStationStorage())
          dataOwnerId.current = undefined
        }
      } catch (e) {
        console.error('Failed to load station items:', e)
      } finally {
        setIsLoaded(true)
      }
    }
    loadItems()
  }, [user])

  // Save logic
  useEffect(() => {
    if (!isLoaded) return

    // Safety Check: Don't save if the current data doesn't belong to the current user.
    // This happens during the split second of login/logout switching.
    if (user?.id !== dataOwnerId.current) {
      if (!user && dataOwnerId.current === undefined) {
        // Guest saving Guest data -> OK
      } else {
        // Mismatch (e.g. User logged in, but dataOwner is still undefined/Guest) -> ABORT
        return
      }
    }

    try {
      saveStationItems(items, user)
    } catch (e) {
      console.error('Failed to save items:', e)
    }
  }, [items, isLoaded, user])

  // Sync logic
  useEffect(() => {
    if (!isLoaded) return
    const handleSync = (event: Event) => {
      if (user) return
      const detail = (event as CustomEvent<FocusItem[]>).detail
      if (Array.isArray(detail)) {
        setItems(detail)
      }
    }

    if (!user) {
      window.addEventListener(STATION_SYNC_EVENT, handleSync as EventListener)
      return () => window.removeEventListener(STATION_SYNC_EVENT, handleSync as EventListener)
    }
  }, [isLoaded, user])

  const addTextItem = () => {
    if (!inputValue.trim()) return

    // Check limit for PRO upselling (Limit Guests Only)
    if (isLimitReached && !user) {
      setShowUpgrade(true)
      return
    }

    const newItem = createFocusItem('text', inputValue.trim())
    setItems((prev) => [...prev, newItem]) // Original was append to bottom
    setInputValue('')
  }

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }

  const handleClearAll = () => {
    if (items.length === 0) return
    const confirmMsg = lang === 'en' ? 'Clear all tasks?' : '清空所有任务？'
    if (confirm(confirmMsg)) {
      setItems([])
    }
  }

  const isWide = cols >= 5

  return (
    <>
      <div className="flex h-full flex-col gap-3">
        {/* Input Area */}
        <div className="relative flex shrink-0 items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTextItem()}
              placeholder={t.focusLab.widgets.todo.placeholder}
              className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pr-12 pl-4 text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:bg-gray-800"
            />
            <button
              onClick={addTextItem}
              disabled={!inputValue.trim()}
              className="text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1.5 transition-colors disabled:text-gray-300 dark:disabled:text-gray-600"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Clear All Button (Replaces Trash in header, per user provided original code logic, but wait, user image showed trash in header?
             User Image arrow (1) points to input area right side. But text says "Here behind has a trash can".
             User provided code puts trash can HERE, next to input. 
             "这里后面有个垃圾桶" -> pointing to the input row.
             I will place it NEXT to the input, as per the code snippet the user asked me to follow.
          */}
          <button
            onClick={handleClearAll}
            disabled={items.length === 0}
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 disabled:hover:bg-gray-100 disabled:hover:text-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            title={lang === 'en' ? 'Clear all tasks' : '清空所有任务'}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="scrollbar-none -mx-1 flex-1 overflow-y-auto px-1 pt-2 pb-2 [&::-webkit-scrollbar]:hidden">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center text-gray-400 dark:border-gray-800 dark:bg-gray-900/20">
              <p className="text-sm">{t.focusLab.widgets.todo.emptyTitle}</p>
              <p className="text-xs opacity-60">{t.focusLab.widgets.todo.emptySubtitle}</p>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={items}
              onReorder={setItems}
              className={`grid gap-2 ${isWide ? 'grid-cols-2' : 'grid-cols-1'}`}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((item) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className={`group relative flex cursor-pointer items-center gap-3 rounded-xl bg-white p-2.5 shadow-sm transition-all hover:shadow-md dark:bg-gray-900/40 ${
                      focusedTaskId === item.id
                        ? 'border-primary-500 ring-primary-500 dark:border-primary-400 dark:ring-primary-400 border ring-1'
                        : 'ring-primary-100/50 hover:border-primary-200 dark:ring-primary-900/30 border border-transparent ring-1'
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    {/* Checkbox (Click toggle) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleItem(item.id)
                      }}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        item.completed
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'hover:border-primary-400 border-primary-200 dark:border-primary-800/50 bg-white/50 dark:bg-gray-800/50'
                      }`}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      {item.completed && <CheckIcon className="h-3.5 w-3.5" />}
                    </button>

                    {/* Content */}
                    <span
                      className={`flex-1 text-left text-sm transition-all ${
                        item.completed
                          ? 'text-gray-400 line-through decoration-gray-300 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-300' // Changed from hover:text-primary to plain gray per user request "This text color ... should be gray"
                      }`}
                    >
                      {item.content}
                    </span>

                    {/* Actions Group */}
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      {/* Focus Button (Target Icon) */}
                      {onStartFocus && !item.completed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onStartFocus(item.content, item.id)
                          }}
                          className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                            focusedTaskId === item.id
                              ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                              : 'hover:text-primary-500 dark:hover:text-primary-400 text-gray-400 hover:bg-gray-100 dark:text-gray-600 dark:hover:bg-gray-800'
                          }`}
                          title="Focus on this"
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <TargetIcon className="h-4 w-4" />
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeItem(item.id)
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title="Delete"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          )}
        </div>
      </div>

      {showUpgrade && <UpgradeModal isOpen={true} onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
