'use client'

import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export const TODO_STORAGE_KEY = 'focus-lab-todo-list'
export const TODO_SYNC_EVENT = 'focus-lab-todo-updated'

export type ToDoStorageItem = {
  id: string
  text: string
  completed: boolean
}

// ... helper ...
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

export const readToDoStorage = (userId?: string): ToDoStorageItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const storage = window.localStorage
    const key = userId ? `${TODO_STORAGE_KEY}-${userId}` : TODO_STORAGE_KEY
    const value = storage.getItem(key)
    if (!value) return []
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch (error) {
    console.error('Failed to read Focus Lab To-Do storage', error)
    return []
  }
}

export const writeToDoStorage = async (tasks: ToDoStorageItem[], user?: User | null) => {
  try {
    // Local Write (For both Guest keys and User keys)
    if (typeof window !== 'undefined') {
      const key = user ? `${TODO_STORAGE_KEY}-${user.id}` : TODO_STORAGE_KEY
      window.localStorage.setItem(key, JSON.stringify(tasks))
      window.dispatchEvent(new CustomEvent(TODO_SYNC_EVENT, { detail: tasks }))
    }

    // Cloud Write (Sync Strategy: Overwrite cloud with current state)
    // NOTE: Real sync is hard. This is a simple "Save State" approach.
    if (user) {
      const supabase = createClient()
      // We can't easily sync massive lists.
      // Strategy: We will just Upsert individual items or replace all?
      // Replacing all is safest for maintaining order and consistency for now (MVP).
      // But deleting and re-inserting is expensive.

      // Let's rely on Upsert by ID.
      // And we need to handle deletions.
      // For MVP: We just insert/update all current tasks.
      // Deletions are not propagated if we only Upsert.
      // Ideally we should soft-delete or have a 'deleted' flag.

      // Simpler implementation for this request:
      // Just save tasks. If it's too complex, maybe we just save to local.
      // But user asked for cloud save.

      // Let's iterate and Upsert.
      const header = tasks.map((t) => ({
        id: t.id,
        user_id: user.id,
        text: t.text,
        completed: t.completed,
        updated_at: new Date().toISOString(),
      }))

      if (header.length > 0) {
        const { error } = await supabase.from('todo_tasks').upsert(header)
        if (error) console.error('Cloud save error (todo):', error.message)
      }
    }
  } catch (error) {
    console.error('Failed to write Focus Lab To-Do storage', error)
    throw error
  }
}

export const fetchCloudTasks = async (user: User) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('todo_tasks')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) {
    console.error('Fetch cloud tasks error', error.message)
    return []
  }
  return data.map((t: { id: string; text: string; completed: boolean }) => ({
    id: t.id,
    text: t.text,
    completed: t.completed,
  })) as ToDoStorageItem[]
}

export const syncToDo = async (user: User) => {
  if (typeof window === 'undefined') return
  const tasks = readToDoStorage()
  if (tasks.length === 0) return

  const supabase = createClient()
  let hasUpdates = false

  // Validate IDs: UUID check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  const records = tasks.map((t) => {
    // If ID is not a valid UUID, generate a new one
    if (!uuidRegex.test(t.id)) {
      const newId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `10000000-1000-4000-8000-${Date.now().toString(16).padEnd(12, '0')}` // Simple fallback
      t.id = newId
      hasUpdates = true
    }

    return {
      id: t.id,
      user_id: user.id,
      text: t.text,
      completed: t.completed,
      updated_at: new Date().toISOString(),
    }
  })

  // If we fixed any IDs, save back to local storage so we don't have issues next time
  if (hasUpdates) {
    console.log('Migrated legacy IDs to UUIDs')
    writeToDoStorage(tasks) // This updates local storage with new IDs
  }

  const { error } = await supabase.from('todo_tasks').upsert(records, { onConflict: 'id' })
  if (error) {
    console.error('ToDo sync error:', error.message || error)
  } else {
    console.log(`Synced ${records.length} tasks to cloud`)
  }
}
