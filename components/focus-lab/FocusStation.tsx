'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/context/LanguageContext'
import Image from 'next/image'
import Link from 'next/link'

import { useAuth } from '@/context/AuthContext'
import isEqual from 'lodash/isEqual'

// FormKit imports
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { animations } from '@formkit/drag-and-drop'

import {
  STATION_SYNC_EVENT,
  createFocusItem,
  readStationStorage,
  saveStationItems,
  fetchCloudItems,
  uploadImage,
  type FocusItem,
} from './focusStationStorage'
import { useThemeColor, type UIStyle } from '@/context/ThemeColorContext'
import PlanComparisonModal from '@/components/auth/PlanComparisonModal'

const UpgradeModal = PlanComparisonModal

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

// Presentation Component (Pure)
export const FocusTaskCard = memo(
  ({
    item,
    isWarm,
    isGreen,
    isBlue,
    isCartoon,
    focusedTaskId,
    onToggle,
    onStartFocus,
    onRemove,
    isEditing,
    editValue,
    onEditStart,
    onEditChange,
    onEditSave,
    onEditCancel,
    isDragging,
    variant = 'default',
  }: {
    item: FocusItem
    isWarm: boolean
    isGreen: boolean
    isBlue: boolean
    isCartoon: boolean
    focusedTaskId?: string | null
    onToggle: (id: string) => void
    onStartFocus?: (task: string, id: string) => void
    onRemove: (id: string) => void
    isEditing?: boolean
    editValue?: string
    onEditStart?: (id: string, content: string) => void
    onEditChange?: (value: string) => void
    onEditSave?: (id: string) => void
    onEditCancel?: () => void
    isDragging?: boolean
    variant?: 'default' | 'reward'
  }) => {
    const { t } = useTranslation()
    const inputRef = useRef<HTMLInputElement>(null)

    // Auto-focus input when entering edit mode
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, [isEditing])

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onEditSave?.(item.id)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onEditCancel?.()
      }
    }

    return (
      <div
        className={`group relative flex ${
          variant === 'reward'
            ? 'h-full flex-col items-center justify-between gap-4 border-none bg-transparent py-3 shadow-none'
            : 'items-center gap-3 rounded-xl bg-white p-2.5 shadow-sm dark:bg-gray-900/40'
        } ${isEditing ? 'cursor-text' : 'cursor-grab active:cursor-grabbing'} transition-[opacity,shadow] duration-200 [&[data-dragging="true"]]:opacity-50 [&[data-dragging="true"]]:shadow-lg ${
          !isDragging && variant !== 'reward' ? 'hover:shadow-md' : ''
        } ${
          variant !== 'reward' && focusedTaskId === item.id
            ? isWarm
              ? 'border border-[#C27B4A] bg-[#F5F2EC] ring-1 ring-[#C27B4A]'
              : isGreen
                ? 'border border-[#7A9F7A] bg-[#F8F9F7] ring-1 ring-[#7A9F7A]'
                : isBlue
                  ? 'border border-[#5B84B1] bg-[#E0EEF8] ring-1 ring-[#5B84B1]'
                  : isCartoon
                    ? 'border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ring-0 dark:border-white dark:bg-gray-900 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
                    : 'border-primary-500 ring-primary-500 dark:border-primary-400 dark:ring-primary-400 border ring-1'
            : variant !== 'reward' && isCartoon
              ? `border-2 border-transparent ${!isDragging ? 'hover:border-black dark:hover:border-white' : ''}`
              : variant !== 'reward'
                ? `ring-primary-100/50 ${!isDragging ? 'hover:border-primary-200' : ''} dark:ring-primary-900/30 border border-transparent ring-1`
                : ''
        }`}
      >
        {/* Checkbox - Only show if NOT reward variant */}
        {variant !== 'reward' && (
          <button
            onClick={() => {
              if (!isEditing) onToggle(item.id)
            }}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
              item.completed
                ? isWarm
                  ? 'border-[#C27B4A] bg-[#C27B4A] text-white'
                  : isGreen
                    ? 'border-[#7A9F7A] bg-[#7A9F7A] text-white'
                    : isBlue
                      ? 'border-[#5B84B1] bg-[#5B84B1] text-white'
                      : isCartoon
                        ? 'border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-primary-500 bg-primary-500 text-white'
                : isWarm
                  ? 'border-[#C27B4A]/50 bg-white/50 hover:border-[#C27B4A] dark:bg-gray-800/50'
                  : isGreen
                    ? 'border-[#7A9F7A]/50 bg-white/50 hover:border-[#7A9F7A] dark:bg-gray-800/50'
                    : isBlue
                      ? 'border-[#5B84B1]/50 bg-white/50 hover:border-[#5B84B1] dark:bg-gray-800/50'
                      : isCartoon
                        ? 'border-2 border-black bg-white hover:bg-gray-100 dark:border-white dark:bg-gray-900'
                        : 'hover:border-primary-400 border-primary-200 dark:border-primary-800/50 bg-white/50 dark:bg-gray-800/50'
            }`}
          >
            {item.completed && <CheckIcon className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Content - Editable */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => onEditChange?.(e.target.value)}
            onBlur={() => onEditSave?.(item.id)}
            onKeyDown={handleKeyDown}
            className="flex-1 border-none bg-transparent p-0 text-sm text-gray-700 shadow-none ring-0 outline-none focus:border-none focus:shadow-none focus:ring-0 focus:outline-none dark:text-gray-300"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className={`${variant === 'reward' ? 'flex w-full flex-1 items-center justify-center px-2 py-4' : 'min-w-0 flex-1'}`}
          >
            <span
              className={`break-words transition-all select-none ${
                variant === 'reward'
                  ? 'text-center text-4xl leading-tight font-bold'
                  : 'block truncate text-left text-sm'
              } ${
                item.completed
                  ? 'text-gray-400 line-through decoration-gray-300 dark:text-gray-500'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
              onDoubleClick={(e) => {
                e.stopPropagation()
                onEditStart?.(item.id, item.content)
              }}
            >
              {item.content}
            </span>
          </div>
        )}

        {/* Actions */}
        {!isEditing && (
          <div
            className={`${variant === 'reward' ? 'flex' : 'flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100'}`}
          >
            {onStartFocus && !item.completed && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onStartFocus(item.content, item.id)
                }}
                className={`flex items-center justify-center rounded-lg transition-colors ${
                  variant === 'reward'
                    ? `h-10 w-full px-4 py-2 text-sm font-bold shadow-lg transition-all active:scale-95 disabled:active:scale-100 ${
                        isWarm
                          ? 'rounded-lg bg-[#C27B4A] text-white shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
                          : isGreen
                            ? 'rounded-xl bg-[#7A9F7A] text-white shadow-lg shadow-[#7A9F7A]/25 hover:bg-[#688868] hover:shadow-[#7A9F7A]/40'
                            : isBlue
                              ? 'rounded-xl bg-[#5B84B1] text-white shadow-lg shadow-[#5B84B1]/25 hover:bg-[#4A6E94] hover:shadow-[#5B84B1]/40'
                              : isCartoon
                                ? 'rounded-xl bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                                : 'bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/40 rounded-xl text-white'
                      }`
                    : 'hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 h-6 w-6 text-gray-400'
                }`}
                title="Start Focus"
              >
                {variant === 'reward' ? (
                  <span className="flex items-center gap-2">
                    <span className="icon-[solar--play-circle-outline] h-6 w-6" />
                    {t.focusLab.widgets.todo.startFocus || 'Start Focus'}
                  </span>
                ) : (
                  <TargetIcon className="h-4 w-4" />
                )}
              </button>
            )}
            {variant !== 'reward' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(item.id)
                }}
                className="flex h-6 w-6 items-center justify-center rounded text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                title="Delete"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    )
  }
)
FocusTaskCard.displayName = 'FocusTaskCard'

export const FocusStation = ({
  cols = 1,
  onStartFocus,
  focusedTaskId,
  onTaskComplete,
}: {
  cols?: number
  onStartFocus?: (task: string, id: string) => void
  focusedTaskId?: string | null
  onTaskComplete?: () => void
}) => {
  const { uiStyle } = useThemeColor()
  const isWarm = uiStyle === 'warm'
  const isGreen = uiStyle === 'green'
  const isBlue = uiStyle === 'blue'
  const isCartoon = uiStyle === 'cartoon'
  const { t, language: lang } = useTranslation()
  const { user } = useAuth()

  // Master state
  const [items, setItems] = useState<FocusItem[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  // FormKit Drag and Drop
  // We use this logic:
  // 1. We have our 'items' state which is the "Source of Truth" (loaded from DB/Storage).
  // 2. We pass 'items' to useDragAndDrop.
  // 3. When 'items' updates (e.g. initial load, or sync event), we update FormKit's list via setListItems.
  // 4. When Drag happens, FormKit updates its own list and calls handleEnd. We then sync back to our 'items' state to trigger persistence.

  // Dragging state to disable hover effects
  const [isDragging, setIsDragging] = useState(false)

  const dragStatePlugin = useCallback((parent: HTMLElement) => {
    const handleDragStart = () => setIsDragging(true)
    const handleDragEnd = () => setIsDragging(false)

    parent.addEventListener('dragstart', handleDragStart)
    parent.addEventListener('dragend', handleDragEnd)

    return {
      teardown: () => {
        parent.removeEventListener('dragstart', handleDragStart)
        parent.removeEventListener('dragend', handleDragEnd)
      },
    }
  }, [])

  const [parent, listItems, setListItems] = useDragAndDrop<HTMLDivElement, FocusItem>(items, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [animations(), dragStatePlugin as any],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleEnd: (data: any) => {
      // Sync back to master state when drag ends
      // Check if order actually changed to avoid loop?
      // FormKit returns the new list in data.values
      // We should update our master 'items' state so it gets saved to storage/DB
      if (data.values) {
        setItems((prev) => {
          const newValues = data.values as FocusItem[]
          if (isEqual(prev, newValues)) return prev
          return newValues
        })
      }
    },
  })

  // Sync FormKit when master items change (e.g. loaded from DB)
  // But be careful not to create a loop if handleEnd updates items -> items update list -> ...
  // useDragAndDrop handles updates gracefully usually.
  useEffect(() => {
    setListItems(items)
  }, [items, setListItems])

  // Upgrade modal state
  const [showUpgrade, setShowUpgrade] = useState(false)
  const ITEM_LIMIT = 20
  const isLimitReached = items.length >= ITEM_LIMIT
  const dataOwnerId = useRef<string | undefined>(undefined)

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleEditStart = useCallback((id: string, content: string) => {
    setEditingId(id)
    setEditValue(content)
  }, [])

  const handleEditChange = useCallback((value: string) => {
    setEditValue(value)
  }, [])

  const handleEditSave = useCallback(
    (id: string) => {
      if (editValue.trim()) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, content: editValue.trim() } : item))
        )
      }
      setEditingId(null)
      setEditValue('')
    },
    [editValue]
  )

  const handleEditCancel = useCallback(() => {
    setEditingId(null)
    setEditValue('')
  }, [])

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

  // Save logic with Debounce
  useEffect(() => {
    if (!isLoaded) return

    // Safety Check
    if (user?.id !== dataOwnerId.current) {
      if (!user && dataOwnerId.current === undefined) {
        // Guest saving Guest data -> OK
      } else {
        return
      }
    }

    const timer = setTimeout(() => {
      try {
        saveStationItems(items, user)
      } catch (e) {
        console.error('Failed to save items:', e)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [items, isLoaded, user])

  // Sync logic
  useEffect(() => {
    if (!isLoaded) return
    const handleSync = (event: Event) => {
      const detail = (event as CustomEvent<FocusItem[]>).detail
      if (Array.isArray(detail)) {
        setItems((currentItems) => {
          if (isEqual(currentItems, detail)) return currentItems
          return detail
        })
      }
    }

    window.addEventListener(STATION_SYNC_EVENT, handleSync as EventListener)
    return () => window.removeEventListener(STATION_SYNC_EVENT, handleSync as EventListener)
  }, [isLoaded])

  /* Handlers wrapped in useCallback for performance */
  const addTextItem = useCallback(() => {
    if (!inputValue.trim()) return

    if (isLimitReached && !user) {
      setShowUpgrade(true)
      return
    }

    const newItem = createFocusItem('text', inputValue.trim())

    setItems((prev) => {
      const updated = [...prev, newItem]
      const active = updated.filter((t) => !t.completed)
      const completed = updated.filter((t) => t.completed)
      return [...active, ...completed]
    })
    setInputValue('')
  }, [inputValue, isLimitReached, user])

  const itemsRef = useRef(items)
  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const toggleItemStable = useCallback(
    (id: string) => {
      const currentItems = itemsRef.current
      const itemToToggle = currentItems.find((t) => t.id === id)
      if (itemToToggle && !itemToToggle.completed && onTaskComplete) {
        onTaskComplete()
      }

      setItems((prev) => {
        const updatedItems = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        // Re-sort: Active then Completed
        const active = updatedItems.filter((t) => !t.completed)
        const completed = updatedItems.filter((t) => t.completed)
        return [...active, ...completed]
      })
    },
    [onTaskComplete]
  )

  const removeItemStable = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const handleClearAll = useCallback(() => {
    if (itemsRef.current.length === 0) return
    if (confirm(lang === 'en' ? 'Clear all tasks?' : '清空所有任务？')) {
      setItems([])
    }
  }, [lang])

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
              onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && addTextItem()}
              placeholder={t.focusLab.widgets.todo.placeholder}
              className={`w-full rounded-xl border py-2 pr-12 pl-4 text-sm text-gray-900 placeholder:text-gray-500 focus:ring-1 focus:outline-none dark:text-gray-100 ${
                isWarm
                  ? 'border-[#ECE8E0] bg-[#F5F2EC] focus:border-[#C27B4A] focus:bg-[#F5F2EC] focus:ring-[#C27B4A] dark:border-gray-700 dark:bg-gray-800'
                  : isGreen
                    ? 'border-[#E2E8E2] bg-[#F8F9F7] text-gray-900 placeholder:text-gray-400 focus:border-[#7A9F7A] focus:ring-[#7A9F7A]'
                    : isBlue
                      ? 'border-[#D1E3F3] bg-[#E0EEF8] text-gray-900 placeholder:text-gray-400 focus:border-[#5B84B1] focus:ring-[#5B84B1]'
                      : isCartoon
                        ? 'border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-500 focus:ring-0 dark:border-white dark:bg-gray-900 dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                        : 'focus:border-primary-500 focus:ring-primary-500 border-gray-100 bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:bg-gray-800'
              }`}
            />
            <button
              onClick={addTextItem}
              disabled={!inputValue.trim()}
              className={`${isWarm ? 'text-[#C27B4A] hover:bg-[#F5F2EC]' : isGreen ? 'text-[#7A9F7A] hover:bg-[#F8F9F7]' : isBlue ? 'text-[#5B84B1] hover:bg-[#E0EEF8]' : isCartoon ? 'text-black dark:text-white' : 'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'} absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1.5 transition-colors disabled:text-gray-300 dark:disabled:text-gray-600`}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={handleClearAll}
            disabled={items.length === 0}
            className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 disabled:hover:text-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 ${
              isWarm
                ? 'border border-[#ECE8E0] bg-[#F5F2EC] text-gray-600'
                : isGreen
                  ? 'text-[#7A9F7A] hover:bg-[#E2E8E2] hover:text-[#5e7c5e]'
                  : isBlue
                    ? 'text-[#5B84B1] hover:bg-[#E0EEF8] hover:hover:text-[#4A6E94]'
                    : isCartoon
                      ? 'border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] dark:hover:bg-white dark:hover:text-black'
                      : 'bg-gray-100 text-gray-500 disabled:hover:bg-gray-100'
            }`}
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
            /* FormKit Parent Element with ref */
            <div ref={parent} className="flex flex-col gap-2">
              {listItems.map((item) => (
                <FocusTaskCard
                  key={item.id}
                  item={item}
                  isWarm={isWarm}
                  isGreen={isGreen}
                  isBlue={isBlue}
                  isCartoon={isCartoon}
                  focusedTaskId={focusedTaskId}
                  onToggle={toggleItemStable}
                  onStartFocus={onStartFocus}
                  onRemove={removeItemStable}
                  isEditing={editingId === item.id}
                  editValue={editingId === item.id ? editValue : ''}
                  onEditStart={handleEditStart}
                  onEditChange={handleEditChange}
                  onEditSave={handleEditSave}
                  onEditCancel={handleEditCancel}
                  isDragging={isDragging}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showUpgrade && <UpgradeModal isOpen={true} onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
