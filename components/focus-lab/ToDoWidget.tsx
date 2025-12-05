'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useTranslation } from '@/context/LanguageContext'
import {
  TODO_SYNC_EVENT,
  createToDoItem,
  readToDoStorage,
  type ToDoStorageItem,
  writeToDoStorage,
} from './todoStorage'

type ToDoItem = ToDoStorageItem

export const ToDoWidget = ({ cols = 1 }: { cols?: number }) => {
  const { t, language: lang } = useTranslation()
  const [tasks, setTasks] = useState<ToDoItem[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      setTasks(readToDoStorage())
    } catch (e) {
      console.error('Failed to load todo list:', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return
    try {
      writeToDoStorage(tasks)
    } catch (e) {
      console.error('Failed to save todo list:', e)
    }
  }, [tasks, isLoaded])

  // Respond to external sync events
  useEffect(() => {
    if (!isLoaded) return
    const handleSync = (event: Event) => {
      const detail = (event as CustomEvent<ToDoItem[]>).detail
      if (Array.isArray(detail)) {
        setTasks(detail)
      } else {
        setTasks(readToDoStorage())
      }
    }

    window.addEventListener(TODO_SYNC_EVENT, handleSync as EventListener)
    return () => window.removeEventListener(TODO_SYNC_EVENT, handleSync as EventListener)
  }, [isLoaded])

  const addTask = () => {
    if (!inputValue.trim()) return
    const newTask = createToDoItem(inputValue.trim())
    setTasks((prev) => [...prev, newTask])
    setInputValue('')
  }

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const handleClearAll = () => {
    if (tasks.length === 0) return
    if (
      window.confirm(
        lang === 'en' ? 'Clear all tasks? This cannot be undone.' : '清空所有任务？此操作无法撤销。'
      )
    ) {
      setTasks([])
    }
  }

  // Determine if we should use 2 columns (if width > 2 units)
  const isWide = cols > 3

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Input Area */}
      <div className="relative flex shrink-0 items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder={t.focusLab.widgets.todo.placeholder}
            className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
          <button
            onClick={addTask}
            disabled={!inputValue.trim()}
            className="hover:text-primary-500 dark:hover:text-primary-400 absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-white p-1.5 text-gray-400 shadow-sm transition-colors disabled:opacity-50 dark:bg-gray-800 dark:text-gray-500"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {/* Clear All Button */}
        <button
          onClick={handleClearAll}
          disabled={tasks.length === 0}
          className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500 dark:hover:border-red-900/30 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          title={lang === 'en' ? 'Clear all tasks' : '清空所有任务'}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>

      {/* Task List */}
      <div className="scrollbar-none -mx-2 flex-1 overflow-y-auto px-2 pb-2 [&::-webkit-scrollbar]:hidden">
        {tasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-2 text-center text-gray-400 dark:border-gray-800 dark:bg-gray-900/20">
            <p className="text-sm">{t.focusLab.widgets.todo.emptyTitle}</p>
            <p className="text-xs opacity-60">{t.focusLab.widgets.todo.emptySubtitle}</p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={tasks}
            onReorder={setTasks}
            className={`grid gap-2 ${isWide ? 'grid-cols-2' : 'grid-cols-1'}`}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {tasks.map((task) => (
                <Reorder.Item
                  key={task.id}
                  value={task}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="group relative flex cursor-pointer items-center gap-3 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md dark:bg-gray-900/40 dark:ring-gray-800"
                  onClick={() => toggleTask(task.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTask(task.id)
                    }}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      task.completed
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'hover:border-primary-400 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
                    }`}
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on checkbox
                  >
                    {task.completed && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>

                  <span
                    className={`flex-1 text-sm transition-all ${
                      task.completed
                        ? 'text-gray-400 line-through decoration-gray-300 dark:text-gray-600'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {task.text}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTask(task.id)
                    }}
                    className="text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
                    aria-label="Delete task"
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on delete button
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
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>
    </div>
  )
}
