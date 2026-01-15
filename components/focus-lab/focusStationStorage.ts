'use client'

import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { openSharedIdb } from '@/components/focus-lab/idb'

export const STATION_STORAGE_KEY = 'focus-lab-station-items'
export const STATION_SYNC_EVENT = 'focus-lab-station-updated'

export type FocusItemType = 'text' | 'image'

export type FocusItem = {
  id: string
  type: FocusItemType
  content: string // Text content or Image URL/Path
  completed: boolean
  completed_at?: number | null
  position: number
  created_at?: string
}

const fallbackId = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const IDB_NAME = 'focus-lab-cache'
const IDB_STORE = 'focus-station'
const STATION_CHANNEL_NAME = 'focus-lab-station-channel'

type PersistedBundle = { items: FocusItem[]; updatedAt: number }

const getStorageKey = (userId?: string) =>
  userId ? `${STATION_STORAGE_KEY}-${userId}` : STATION_STORAGE_KEY
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

const writeLocalBundle = (
  key: string,
  items: FocusItem[],
  updatedAt: number,
  options: { skipBroadcast?: boolean; skipIdb?: boolean } = {}
) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(items))
  window.localStorage.setItem(getMetaKey(key), JSON.stringify({ updatedAt }))
  window.dispatchEvent(new CustomEvent(STATION_SYNC_EVENT, { detail: items }))

  if (!options.skipIdb) {
    void persistToIdb(key, { items, updatedAt })
  }
  if (!options.skipBroadcast) {
    stationChannel?.postMessage({ key, items, updatedAt })
  }
}

const persistToIdb = async (key: string, bundle: PersistedBundle) => {
  const db = await openSharedIdb()
  if (!db) return
  try {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(bundle, key)
  } catch (error) {
    console.error('IndexedDB write failed for Focus Station cache', error)
  }
}

const readFromIdb = async (key: string): Promise<PersistedBundle | null> => {
  const db = await openSharedIdb()
  if (!db) return null
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get(key)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => {
        console.error('IndexedDB read failed for Focus Station cache', req.error)
        resolve(null)
      }
    } catch (error) {
      console.error('IndexedDB transaction failed for Focus Station cache', error)
      resolve(null)
    }
  })
}

const stationChannel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(STATION_CHANNEL_NAME) : null
let channelInitialized = false

const initStationChannel = () => {
  if (channelInitialized || !stationChannel || typeof window === 'undefined') return
  stationChannel.onmessage = (message: MessageEvent<PersistedBundle & { key: string }>) => {
    const payload = message.data
    if (!payload || !payload.key) return
    const localUpdatedAt = readLocalMeta(payload.key)
    if (payload.updatedAt && payload.updatedAt > localUpdatedAt) {
      writeLocalBundle(payload.key, payload.items || [], payload.updatedAt, {
        skipBroadcast: true,
      })
    }
  }
  channelInitialized = true
}

const hydrateFromIdbIfStale = async (key: string, localUpdatedAt: number) => {
  const cached = await readFromIdb(key)
  if (cached && cached.updatedAt > localUpdatedAt) {
    writeLocalBundle(key, cached.items || [], cached.updatedAt, { skipBroadcast: true })
  }
}

export const createFocusItem = (type: FocusItemType, content: string): FocusItem => {
  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : fallbackId(),
    type,
    content,
    completed: false,
    completed_at: null,
    position: Date.now(),
  }
}

export const readStationStorage = (userId?: string): FocusItem[] => {
  if (typeof window === 'undefined') return []
  initStationChannel()
  try {
    const key = getStorageKey(userId)
    const value = window.localStorage.getItem(key)
    const localUpdatedAt = readLocalMeta(key)

    // 异步从 IDB 回填更“新”的缓存（不阻塞同步返回）
    void hydrateFromIdbIfStale(key, localUpdatedAt)

    if (!value) return []
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.map((item: Record<string, unknown>) => ({
      ...item,
      completed: (item.completed as boolean) ?? false,
      completed_at: (item.completed_at as number) ?? null,
    })) as FocusItem[]
  } catch (error) {
    console.error('Failed to read Focus Station storage', error)
    return []
  }
}

export const fetchCloudItems = async (user: User): Promise<FocusItem[] | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('focus_items')
    .select('*')
    .eq('user_id', user.id)
    .order('position', { ascending: true })

  if (error) {
    console.error('Fetch cloud items error:', error)
    return null
  }

  if (!data) return []

  return data.map((d) => ({
    id: d.id,
    type: d.type as 'text' | 'image',
    content: d.content,
    position: d.position,
    completed: d.is_completed || false,
    completed_at: d.completed_at ? new Date(d.completed_at).getTime() : null,
  }))
}

export const saveStationItems = async (items: FocusItem[], user?: User | null) => {
  try {
    const updatedAt = Date.now()
    if (typeof window !== 'undefined') {
      const key = getStorageKey(user?.id)
      initStationChannel()
      writeLocalBundle(key, items, updatedAt)
    }

    if (user) {
      const supabase = createClient()
      const dbPayload = items.map((item, index) => ({
        id: item.id,
        user_id: user.id,
        type: item.type,
        content: item.content,
        is_completed: item.completed,
        completed_at: item.completed_at ? new Date(item.completed_at).toISOString() : null,
        position: index,
        updated_at: new Date().toISOString(),
      }))

      try {
        const { error } = await supabase.from('focus_items').upsert(dbPayload, { onConflict: 'id' })

        // 1. Handle missing column error by retrying without 'completed_at'
        if (
          error &&
          error.message &&
          error.message.includes("Could not find the 'completed_at' column")
        ) {
          console.warn('Schema mismatch: Retrying sync without completed_at field...')
          const fallbackPayload = dbPayload.map(({ completed_at, ...rest }) => rest)
          const { error: retryError } = await supabase
            .from('focus_items')
            .upsert(fallbackPayload, { onConflict: 'id' })
          if (retryError) {
            console.error('Cloud save fallback error:', retryError.message)
          }
        } else if (error) {
          console.error('Cloud save error (focus_items):', error.message || error)
        }

        // 2. Cleanup old items (only if sync was successful or partially successful)
        if (!error || (error.message && error.message.includes('completed_at'))) {
          if (items.length > 0) {
            const ids = items.map((i) => i.id)
            await supabase
              .from('focus_items')
              .delete()
              .eq('user_id', user.id)
              .not('id', 'in', `(${ids.join(',')})`)
          } else {
            await supabase.from('focus_items').delete().eq('user_id', user.id)
          }
        }
      } catch (err) {
        console.error('Sync failed', err)
      }
    }
  } catch (error) {
    console.error('Failed to write Focus Station storage', error)
    throw error
  }
}

export const uploadImage = async (file: File, user: User): Promise<string | null> => {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage.from('focus-assets').upload(fileName, file)

  if (uploadError) {
    console.error('Upload error', uploadError)
    return null
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('focus-assets').getPublicUrl(fileName)

  return publicUrl
}

export const syncLocalToCloud = async (user: User) => {
  if (typeof window === 'undefined') return
  const localItems = readStationStorage(user.id)
  if (localItems.length === 0) return
  await saveStationItems(localItems, user)
}
