import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useThemeColor, UIStyle } from '@/context/ThemeColorContext'
import { useAuth } from '@/context/AuthContext'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { animations } from '@formkit/drag-and-drop'
import { isEqual } from 'lodash'
import { BrainDumpItem } from '../brainDumpStorage'
import { BrainDumpCard } from '../components/BrainDumpCard'
import { UseBrainDumpResult } from '../hooks/useBrainDump'
import { TrashIcon, PlusIcon } from '../icons'

export const BrainDumpWidget = ({
  brainDump, // Hook result
  uiStyle,
}: {
  brainDump: UseBrainDumpResult
  uiStyle?: UIStyle
}) => {
  const isWarm = uiStyle === 'warm'
  const isGreen = uiStyle === 'green'
  const isBlue = uiStyle === 'blue'
  const isCartoon = uiStyle === 'cartoon'
  const { t, language: lang } = useTranslation()
  const { user } = useAuth()

  const { state, actions } = brainDump
  const { leftItems, rightItems } = state
  const {
    setLeftItems,
    setRightItems,
    addItem,
    clearAll,
    deleteItem,
    updateItemText,
    handlePasteImage,
  } = actions

  const [inputValue, setInputValue] = useState('')
  const [pendingImage, setPendingImage] = useState<string | null>(null)

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

  // FormKit Drag and Drop
  const [leftParent, leftList, setLeftList] = useDragAndDrop<HTMLDivElement, BrainDumpItem>(
    leftItems,
    {
      group: 'brain-dump',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      plugins: [animations(), dragStatePlugin as any],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleEnd: (data: any) => {
        setIsDragging(false)
        if (data.values) {
          setLeftItems((prev) => {
            const newValues = data.values as BrainDumpItem[]
            if (isEqual(prev, newValues)) return prev // Avoid loop
            return newValues
          })
        }
      },
    }
  )

  const [rightParent, rightList, setRightList] = useDragAndDrop<HTMLDivElement, BrainDumpItem>(
    rightItems,
    {
      group: 'brain-dump',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      plugins: [animations(), dragStatePlugin as any],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleEnd: (data: any) => {
        setIsDragging(false)
        if (data.values) {
          setRightItems((prev) => {
            const newValues = data.values as BrainDumpItem[]
            if (isEqual(prev, newValues)) return prev
            return newValues
          })
        }
      },
    }
  )

  // Sync FormKit when master items change
  useEffect(() => {
    setLeftList(leftItems)
  }, [leftItems, setLeftList])

  useEffect(() => {
    setRightList(rightItems)
  }, [rightItems, setRightList])

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editColumn, setEditColumn] = useState<'left' | 'right'>('left')

  const handleEditStart = useCallback((id: string, text: string, column: 'left' | 'right') => {
    setEditingId(id)
    setEditValue(text)
    setEditColumn(column)
  }, [])

  const handleEditChange = useCallback((value: string) => {
    setEditValue(value)
  }, [])

  const handleEditSave = useCallback(
    (id: string, column: 'left' | 'right') => {
      updateItemText(id, editValue, column)
      setEditingId(null)
      setEditValue('')
    },
    [editValue, updateItemText]
  )

  const handleEditCancel = useCallback(() => {
    setEditingId(null)
    setEditValue('')
  }, [])

  const handleAddSubmit = () => {
    if (!inputValue.trim() && !pendingImage) return
    addItem(inputValue.trim(), pendingImage)
    setInputValue('')
    setPendingImage(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to add
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleAddSubmit()
    }
  }

  const onPaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()
        const blob = item.getAsFile()
        if (blob) {
          const url = await handlePasteImage(blob)
          if (url) setPendingImage(url)
        }
      }
    }
  }

  return (
    <div className="flex h-full min-w-0 flex-col gap-3">
      {/* Input Area */}
      <div className="flex min-w-0 shrink-0 gap-2">
        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={onPaste}
            placeholder={
              lang === 'zh'
                ? '想法、任务... (Cmd+Enter 添加, 支持粘贴图片)'
                : 'Ideas, tasks... (Cmd+Enter to add, Paste image)'
            }
            className={`w-full rounded-xl border py-2 pr-2 pl-4 text-sm text-gray-900 placeholder:text-gray-500 focus:ring-1 focus:outline-none dark:text-gray-100 ${
              isWarm
                ? 'border-[#ECE8E0] bg-[#F5F2EC] focus:border-[#C27B4A] focus:bg-[#F5F2EC] focus:ring-[#C27B4A] dark:border-gray-700 dark:bg-gray-800'
                : isGreen
                  ? 'border-[#E2E8E2] bg-[#F8F9F7] text-gray-900 placeholder:text-gray-400 focus:border-[#7A9F7A] focus:ring-[#7A9F7A]'
                  : isBlue
                    ? 'border-[#D1E3F3] bg-[#E0EEF8] text-gray-900 placeholder:text-gray-400 focus:border-[#5B84B1] focus:ring-[#5B84B1]'
                    : isCartoon
                      ? 'border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-500 focus:ring-0 dark:border-white dark:bg-gray-900 dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                      : 'focus:border-primary-500 focus:ring-primary-500 border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:bg-gray-800'
            }`}
          />
          {pendingImage && (
            <div className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingImage} alt="Pending" className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        <button
          onClick={handleAddSubmit}
          disabled={!inputValue.trim() && !pendingImage}
          className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-50 ${
            isWarm
              ? 'bg-[#C27B4A] text-white hover:bg-[#A6663E]'
              : isGreen
                ? 'bg-[#7A9F7A] text-white hover:bg-[#688868]'
                : isBlue
                  ? 'bg-[#5B84B1] text-white hover:bg-[#4A6E94]'
                  : isCartoon
                    ? 'border-2 border-black bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] dark:hover:bg-black dark:hover:text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          <PlusIcon className="h-5 w-5" />
        </button>

        <button
          onClick={clearAll}
          className={`hidden h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-red-50 hover:text-red-500 @sm:flex dark:hover:bg-red-900/20 dark:hover:text-red-400 ${
            isWarm
              ? 'border border-[#ECE8E0] bg-[#F5F2EC] text-gray-600'
              : isGreen
                ? 'text-[#7A9F7A] hover:bg-[#E2E8E2] hover:text-[#5e7c5e]'
                : isBlue
                  ? 'text-[#5B84B1] hover:bg-[#E0EEF8] hover:text-[#4A6E94]'
                  : isCartoon
                    ? 'border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-50 hover:text-red-500 dark:border-white dark:bg-gray-900 dark:text-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          }`}
          title={lang === 'en' ? 'Clear all' : '清空全部'}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Columns */}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto rounded-xl border border-dashed border-gray-200 p-2 dark:border-gray-700 [&::-webkit-scrollbar]:hidden">
        <div className="grid h-full grid-cols-2 gap-4">
          <div ref={leftParent} className="flex min-h-full flex-col gap-3">
            {leftList.map((item) => (
              <BrainDumpCard
                key={item.id}
                item={item}
                column="left"
                onDelete={deleteItem}
                isEditing={editingId === item.id}
                editValue={editingId === item.id ? editValue : undefined}
                onEditStartAction={handleEditStart}
                onEditChangeAction={handleEditChange}
                onEditSaveAction={handleEditSave}
                onEditCancelAction={handleEditCancel}
                isDragging={isDragging}
              />
            ))}
          </div>

          <div ref={rightParent} className="flex min-h-full flex-col gap-3">
            {rightList.map((item) => (
              <BrainDumpCard
                key={item.id}
                item={item}
                column="right"
                onDelete={deleteItem}
                isEditing={editingId === item.id}
                editValue={editingId === item.id ? editValue : undefined}
                onEditStartAction={handleEditStart}
                onEditChangeAction={handleEditChange}
                onEditSaveAction={handleEditSave}
                onEditCancelAction={handleEditCancel}
                isDragging={isDragging}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
