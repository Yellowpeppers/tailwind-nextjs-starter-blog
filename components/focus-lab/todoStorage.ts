'use client'

import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { openSharedIdb } from './idb'

export const TODO_STORAGE_KEY = 'focus-lab-todo-list'
export const TODO_SYNC_EVENT = 'focus-lab-todo-updated'
const TODO_CHANNEL = 'focus-lab-todo-channel'
const IDB_STORE = 'todo'

export type ToDoStorageItem = {
  id: string
  text: string
  completed: boolean
  updated_at?: string
}

const fallbackId = () => `todo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const getStorageKey = (userId?: string) =>
  userId ? `${TODO_STORAGE_KEY}-${userId}` : TODO_STORAGE_KEY
const getMetaKey = (key: string) => `${key}::meta`

const readLocalMeta = (key: string) => {
  try {
    const raw = window.localStorage.getItem(getMetaKey(key))
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    return typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0
  } catch {
    return 0
  }
}

const openIdb = () => openSharedIdb()

const persistToIdb = async (key: string, tasks: ToDoStorageItem[], updatedAt: number) => {
  const db = await openIdb()
  if (!db || !db.objectStoreNames.contains(IDB_STORE)) return
  try {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put({ tasks, updatedAt }, key)
  } catch (error) {
    console.error('IndexedDB write failed for ToDo cache', error)
  }
}

const readFromIdb = async (
  key: string
): Promise<{ tasks: ToDoStorageItem[]; updatedAt: number } | null> => {
  const db = await openIdb()
  if (!db || !db.objectStoreNames.contains(IDB_STORE)) return null
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get(key)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => {
        console.error('IndexedDB read failed for ToDo cache', req.error)
        resolve(null)
      }
    } catch (error) {
      console.error('IndexedDB transaction failed for ToDo cache', error)
      resolve(null)
    }
  })
}

const todoChannel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(TODO_CHANNEL) : null
let channelInitialized = false

const writeLocalBundle = (
  key: string,
  tasks: ToDoStorageItem[],
  updatedAt: number,
  options: { skipBroadcast?: boolean; skipIdb?: boolean } = {}
) => {
  window.localStorage.setItem(key, JSON.stringify(tasks))
  window.localStorage.setItem(getMetaKey(key), JSON.stringify({ updatedAt }))
  window.dispatchEvent(new CustomEvent(TODO_SYNC_EVENT, { detail: tasks }))
  if (!options.skipIdb) void persistToIdb(key, tasks, updatedAt)
  if (!options.skipBroadcast) todoChannel?.postMessage({ key, tasks, updatedAt })
}

const hydrateFromIdbIfStale = async (key: string, localUpdatedAt: number) => {
  const cached = await readFromIdb(key)
  if (cached && cached.updatedAt > localUpdatedAt) {
    writeLocalBundle(key, cached.tasks || [], cached.updatedAt, { skipBroadcast: true })
  }
}

const initChannel = () => {
  if (channelInitialized || !todoChannel || typeof window === 'undefined') return
  todoChannel.onmessage = (
    message: MessageEvent<{ key: string; tasks: ToDoStorageItem[]; updatedAt: number }>
  ) => {
    const payload = message.data
    if (!payload?.key) return
    const localUpdatedAt = readLocalMeta(payload.key)
    if (payload.updatedAt > localUpdatedAt) {
      writeLocalBundle(payload.key, payload.tasks || [], payload.updatedAt, { skipBroadcast: true })
    }
  }
  channelInitialized = true
}

export const createToDoItem = (text: string): ToDoStorageItem => {
  const trimmedText = text.trim()
  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : fallbackId(),
    text: trimmedText,
    completed: false,
    updated_at: new Date().toISOString(),
  }
}

export const readToDoStorage = (userId?: string): ToDoStorageItem[] => {
  if (typeof window === 'undefined') return []
  initChannel()
  try {
    const key = getStorageKey(userId)
    const value = window.localStorage.getItem(key)
    const localUpdatedAt = readLocalMeta(key)
    void hydrateFromIdbIfStale(key, localUpdatedAt)
    if (!value) return []
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.map((t) => ({
      ...t,
      updated_at: t.updated_at || new Date().toISOString(),
    }))
  } catch (error) {
    console.error('Failed to read Focus Lab To-Do storage', error)
    return []
  }
}

export const writeToDoStorage = async (tasks: ToDoStorageItem[], user?: User | null) => {
  try {
    const updatedAt = Date.now()
    if (typeof window !== 'undefined') {
      const key = getStorageKey(user?.id)
      initChannel()
      writeLocalBundle(key, tasks, updatedAt)
    }

    if (user) {
      const supabase = createClient()
      const nowIso = new Date().toISOString()
      const header = tasks.map((t) => ({
        id: t.id,
        user_id: user.id,
        text: t.text,
        completed: t.completed,
        updated_at: t.updated_at || nowIso,
      }))

      if (header.length > 0) {
        const { error } = await supabase.from('todo_tasks').upsert(header, { onConflict: 'id' })
        if (error) console.error('Cloud save error (todo):', error.message)

        const ids = header.map((h) => h.id)
        await supabase
          .from('todo_tasks')
          .delete()
          .eq('user_id', user.id)
          .not('id', 'in', `(${ids.join(',')})`)
      } else {
        await supabase.from('todo_tasks').delete().eq('user_id', user.id)
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
  return data.map((t: { id: string; text: string; completed: boolean; updated_at?: string }) => ({
    id: t.id,
    text: t.text,
    completed: t.completed,
    updated_at: t.updated_at || new Date().toISOString(),
  })) as ToDoStorageItem[]
}

export const syncToDo = async (user: User) => {
  if (typeof window === 'undefined') return
  const tasks = readToDoStorage(user.id)
  if (tasks.length === 0) return

  const supabase = createClient()
  let hasUpdates = false

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  const records = tasks.map((t) => {
    if (!uuidRegex.test(t.id)) {
      const newId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `10000000-1000-4000-8000-${Date.now().toString(16).padEnd(12, '0')}`
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

  if (hasUpdates) {
    await writeToDoStorage(tasks, user)
  }

  const { error } = await supabase.from('todo_tasks').upsert(records, { onConflict: 'id' })
  if (error) {
    console.error('ToDo sync error:', error.message || error)
  }
}
