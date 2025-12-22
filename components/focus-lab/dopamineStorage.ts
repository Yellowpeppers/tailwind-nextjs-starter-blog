import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { openSharedIdb } from '@/components/focus-lab/idb'

export const DOPAMINE_STORAGE_KEY_PREFIX = 'focus-lab-dopamine-options-'
export const LEGACY_KEY = 'focus-lab-dopamine-options'
const DOPAMINE_CHANNEL = 'focus-lab-dopamine-channel'
const IDB_NAME = 'focus-lab-cache'
const IDB_STORE = 'dopamine'

// Dopamine Menu is just a list of strings
export type DopamineState = string[]

type DopamineBundle = { options: DopamineState; updatedAt: number }

const getStorageKey = (lang: string, userId?: string) =>
  `${userId ? `${DOPAMINE_STORAGE_KEY_PREFIX}${userId}-` : DOPAMINE_STORAGE_KEY_PREFIX}${lang}`
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

const persistToIdb = async (key: string, bundle: DopamineBundle) => {
  const db = await openSharedIdb()
  if (!db) return
  try {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(bundle, key)
  } catch (error) {
    console.error('IndexedDB write failed for Dopamine cache', error)
  }
}

const readFromIdb = async (key: string): Promise<DopamineBundle | null> => {
  const db = await openSharedIdb()
  if (!db) return null
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get(key)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => {
        console.error('IndexedDB read failed for Dopamine cache', req.error)
        resolve(null)
      }
    } catch (error) {
      console.error('IndexedDB transaction failed for Dopamine cache', error)
      resolve(null)
    }
  })
}

const dopamineChannel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(DOPAMINE_CHANNEL) : null
let channelInitialized = false

const writeLocalBundle = (
  key: string,
  options: DopamineState,
  updatedAt: number,
  opts: { skipBroadcast?: boolean; skipIdb?: boolean } = {}
) => {
  window.localStorage.setItem(key, JSON.stringify(options))
  window.localStorage.setItem(getMetaKey(key), JSON.stringify({ updatedAt }))
  if (!opts.skipIdb) void persistToIdb(key, { options, updatedAt })
  if (!opts.skipBroadcast) dopamineChannel?.postMessage({ key, options, updatedAt })
}

const hydrateFromIdbIfStale = async (key: string, localUpdatedAt: number) => {
  const cached = await readFromIdb(key)
  if (cached && cached.updatedAt > localUpdatedAt) {
    writeLocalBundle(key, cached.options || [], cached.updatedAt, { skipBroadcast: true })
  }
}

const initChannel = () => {
  if (channelInitialized || !dopamineChannel || typeof window === 'undefined') return
  dopamineChannel.onmessage = (message: MessageEvent<DopamineBundle & { key: string }>) => {
    const payload = message.data
    if (!payload?.key) return
    const localUpdatedAt = readLocalMeta(payload.key)
    if (payload.updatedAt > localUpdatedAt) {
      writeLocalBundle(payload.key, payload.options || [], payload.updatedAt, {
        skipBroadcast: true,
      })
    }
  }
  channelInitialized = true
}

export const readDopamineStorage = (lang: string, userId?: string): DopamineState | null => {
  if (typeof window === 'undefined') return null
  initChannel()
  try {
    const key = getStorageKey(lang, userId)
    const saved = window.localStorage.getItem(key)
    const legacy = window.localStorage.getItem(LEGACY_KEY)
    const localUpdatedAt = readLocalMeta(key)
    void hydrateFromIdbIfStale(key, localUpdatedAt)

    if (saved) return JSON.parse(saved)
    if (!saved && legacy && !userId) return JSON.parse(legacy)

    return null
  } catch (e) {
    return null
  }
}

export const fetchCloudDopamine = async (user: User): Promise<DopamineState | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('dopamine_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Fetch cloud dopamine error:', error.message)
    return null
  }

  if (!data || data.length === 0) return null

  return data.map((d) => d.content)
}

export const saveDopamine = async (options: DopamineState, lang: string, user?: User | null) => {
  const updatedAt = Date.now()
  if (typeof window !== 'undefined') {
    const key = getStorageKey(lang, user?.id)
    initChannel()
    writeLocalBundle(key, options, updatedAt)
  }

  // Cloud Save
  if (user) {
    const supabase = createClient()

    // Strategy: Dopamine items in DB don't have stable IDs from the frontend
    // currently because the frontend just stores an array of strings ['Walk', 'Coffee'].
    // To sync this to a table with IDs, we have a challenge.
    // Simplest approach for "List of Strings":
    // Delete all for user -> Insert all.
    // Pros: Simple, guaranteed consistent.
    // Cons: ID churn.
    // Given this is a small list (usually < 20 items), Delete+Insert is acceptable performance.

    try {
      // 1. Delete all existing (Full Replace Strategy)
      const { error: delError } = await supabase
        .from('dopamine_items')
        .delete()
        .eq('user_id', user.id)

      if (delError) throw delError

      // 2. Insert new
      if (options.length > 0) {
        const payload = options.map((content) => ({
          user_id: user.id,
          content,
        }))

        const { error: insError } = await supabase.from('dopamine_items').insert(payload)

        if (insError) throw insError
      }
    } catch (e) {
      console.error('Dopamine sync failed:', e)
    }
  }
}

export const syncDopamine = async (user: User, lang: string) => {
  if (typeof window === 'undefined') return
  const options = readDopamineStorage(lang, user.id)
  if (!options || options.length === 0) return

  await saveDopamine(options, lang, user)
}
