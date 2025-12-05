'use client'

export const TODO_STORAGE_KEY = 'focus-lab-todo-list'
export const TODO_SYNC_EVENT = 'focus-lab-todo-updated'

export type ToDoStorageItem = {
  id: string
  text: string
  completed: boolean
}

const parseStoredTasks = (value: string | null): ToDoStorageItem[] => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (task): task is ToDoStorageItem =>
        typeof task?.id === 'string' &&
        typeof task?.text === 'string' &&
        typeof task?.completed === 'boolean'
    )
  } catch (error) {
    console.error('Failed to parse Focus Lab To-Do storage', error)
    return []
  }
}

const getStorage = () => {
  if (typeof window === 'undefined') {
    throw new Error('To-Do storage unavailable on the server')
  }
  return window.localStorage
}

const fallbackId = () => `todo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const createToDoItem = (text: string): ToDoStorageItem => {
  const trimmedText = text.trim()
  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : fallbackId(),
    text: trimmedText,
    completed: false,
  }
}

export const readToDoStorage = (): ToDoStorageItem[] => {
  try {
    const storage = getStorage()
    return parseStoredTasks(storage.getItem(TODO_STORAGE_KEY))
  } catch (error) {
    console.error('Failed to read Focus Lab To-Do storage', error)
    return []
  }
}

export const writeToDoStorage = (tasks: ToDoStorageItem[]) => {
  try {
    const storage = getStorage()
    storage.setItem(TODO_STORAGE_KEY, JSON.stringify(tasks))
    window.dispatchEvent(new CustomEvent(TODO_SYNC_EVENT, { detail: tasks }))
  } catch (error) {
    console.error('Failed to write Focus Lab To-Do storage', error)
    throw error
  }
}
