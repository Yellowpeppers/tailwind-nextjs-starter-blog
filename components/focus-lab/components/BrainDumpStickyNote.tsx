import React, { useRef, useEffect, memo } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { BrainDumpItem } from '../brainDumpStorage'
import { XIcon } from '../icons'

export const BrainDumpStickyNote = memo(
  ({
    item,
    onMove,
    onDelete,
    column,
    isEditing,
    editValue,
    onEditStartAction,
    onEditChangeAction,
    onEditSaveAction,
    onEditCancelAction,
    isDragging,
  }: {
    item: BrainDumpItem
    onMove?: (item: BrainDumpItem, from: 'left' | 'right') => void
    onDelete?: (id: string, col: 'left' | 'right') => void
    column: 'left' | 'right'
    isEditing?: boolean
    editValue?: string
    onEditStartAction?: (id: string, text: string, column: 'left' | 'right') => void
    onEditChangeAction?: (value: string) => void
    onEditSaveAction?: (id: string, column: 'left' | 'right') => void
    onEditCancelAction?: () => void
    isDragging?: boolean
  }) => {
    const { t } = useTranslation()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-focus and resize textarea when entering edit mode
    useEffect(() => {
      if (isEditing && textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
        // Auto-resize
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
      }
    }, [isEditing])

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onEditSaveAction?.(item.id, column)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onEditCancelAction?.()
      }
      // Note: Enter creates new line in textarea, so we don't save on Enter
    }

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onEditChangeAction?.(e.target.value)
      // Auto-resize
      e.target.style.height = 'auto'
      e.target.style.height = e.target.scrollHeight + 'px'
    }

    return (
      <div
        className={`group ring-primary-100/50 dark:ring-primary-900/40 relative break-inside-avoid ${isEditing ? 'cursor-text' : 'cursor-grab active:cursor-grabbing'} rounded-t-none rounded-b-xl shadow-sm ring-1 transition-[opacity,shadow] duration-200 ${!isDragging ? 'hover:shadow-md' : ''} [&[data-dragging="true"]]:opacity-50 [&[data-dragging="true"]]:shadow-lg ${
          item.image ? 'bg-white dark:bg-gray-800' : 'bg-yellow-100 dark:bg-yellow-900/30'
        }`}
      >
        {/* Header Bar - Always draggable */}
        <div
          className={`h-3 w-full ${
            item.image
              ? 'bg-primary-100 dark:bg-primary-900/40'
              : 'bg-yellow-200/50 dark:bg-yellow-900/50'
          } `}
        />

        <div className="p-2.5 pt-2">
          {item.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt="Brain dump"
              className="mb-2 w-full rounded-lg object-cover"
            />
          )}

          {/* Text Content - Editable */}
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={handleTextareaChange}
              onBlur={() => onEditSaveAction?.(item.id, column)}
              onKeyDown={handleKeyDown}
              className="w-full resize-none border-none bg-transparent p-0 text-xs leading-relaxed font-medium text-gray-800 shadow-none ring-0 outline-none focus:border-none focus:shadow-none focus:ring-0 focus:outline-none dark:text-gray-200"
              rows={1}
              onClick={(e) => e.stopPropagation()}
            />
          ) : item.text ? (
            <p
              className="text-xs leading-relaxed font-medium whitespace-pre-wrap text-gray-800 select-none dark:text-gray-200"
              onDoubleClick={(e) => {
                e.stopPropagation()
                onEditStartAction?.(item.id, item.text, column)
              }}
            >
              {item.text}
            </p>
          ) : null}

          {/* Actions - Only delete, since drag-to-move works now */}
          {!isEditing && (
            <div
              className={`mt-2 flex justify-end gap-2 opacity-0 transition-opacity ${!isDragging ? 'group-hover:opacity-100' : ''}`}
            >
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(item.id, column)
                  }}
                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                  title={t.focusLab.widgets.brainDump.accessibility.deleteNote}
                  aria-label={t.focusLab.widgets.brainDump.accessibility.deleteNote}
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

BrainDumpStickyNote.displayName = 'BrainDumpStickyNote'
