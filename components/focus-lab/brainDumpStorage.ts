import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { openSharedIdb } from '@/components/focus-lab/idb'

const BRAIN_DUMP_STORAGE_KEY = 'focus-lab-brain-dump'
const BRAIN_DUMP_CHANNEL = 'focus-lab-brain-dump-channel'
const IDB_NAME = 'focus-lab-cache'
const IDB_STORE = 'brain-dump'

export type BrainDumpLane = 'left' | 'right'

export type BrainDumpItem = {
  id: string
  text: string
  image?: string
  lane?: BrainDumpLane
}

export type BrainDumpState = {
  items: BrainDumpItem[]
}

const fallbackId = () => {
  // Basic UUID v4 generator for fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Helper to standardise IDs
export const createBrainDumpItem = (
  text: string,
  image?: string,
  lane: BrainDumpLane = 'left'
): BrainDumpItem => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : fallbackId(),
  text,
  image,
  lane,
})

type BrainDumpBundle = { state: BrainDumpState; updatedAt: number }

const getStorageKey = (userId?: string) =>
  userId ? `${BRAIN_DUMP_STORAGE_KEY}-${userId}` : BRAIN_DUMP_STORAGE_KEY
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

const persistToIdb = async (key: string, bundle: BrainDumpBundle) => {
  const db = await openSharedIdb()
  if (!db) return
  try {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(bundle, key)
  } catch (error) {
    console.error('IndexedDB write failed for Brain Dump cache', error)
  }
}

const readFromIdb = async (key: string): Promise<BrainDumpBundle | null> => {
  const db = await openSharedIdb()
  if (!db) return null
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get(key)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => {
        console.error('IndexedDB read failed for Brain Dump cache', req.error)
        resolve(null)
      }
    } catch (error) {
      console.error('IndexedDB transaction failed for Brain Dump cache', error)
      resolve(null)
    }
  })
}

const brainDumpChannel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(BRAIN_DUMP_CHANNEL) : null
let channelInitialized = false

const writeLocalBundle = (
  key: string,
  state: BrainDumpState,
  updatedAt: number,
  options: { skipBroadcast?: boolean; skipIdb?: boolean } = {}
) => {
  const { left, right } = splitBrainDumpItems(state.items)
  window.localStorage.setItem(key, JSON.stringify(state))
  window.localStorage.setItem(getMetaKey(key), JSON.stringify({ updatedAt }))
  if (!options.skipIdb) void persistToIdb(key, { state, updatedAt })
  if (!options.skipBroadcast) brainDumpChannel?.postMessage({ key, state, updatedAt })

  // 兼容旧版 left/right 独立 key，便于降级读取
  window.localStorage.setItem(
    `${BRAIN_DUMP_STORAGE_KEY}-left${key.replace(BRAIN_DUMP_STORAGE_KEY, '')}`,
    JSON.stringify(left)
  )
  window.localStorage.setItem(
    `${BRAIN_DUMP_STORAGE_KEY}-right${key.replace(BRAIN_DUMP_STORAGE_KEY, '')}`,
    JSON.stringify(right)
  )
}

const hydrateFromIdbIfStale = async (key: string, localUpdatedAt: number) => {
  const cached = await readFromIdb(key)
  if (cached && cached.updatedAt > localUpdatedAt) {
    const cachedState =
      cached.state && 'items' in cached.state
        ? { items: dedupeBrainDumpItems(cached.state.items) }
        : {
            items: mergeBrainDumpColumns(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (cached.state as any)?.left || [],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (cached.state as any)?.right || []
            ),
          }
    writeLocalBundle(key, cachedState, cached.updatedAt, {
      skipBroadcast: true,
    })
  }
}

const initChannel = () => {
  if (channelInitialized || !brainDumpChannel || typeof window === 'undefined') return
  brainDumpChannel.onmessage = (message: MessageEvent<BrainDumpBundle & { key: string }>) => {
    const payload = message.data
    if (!payload || !payload.key) return
    const localUpdatedAt = readLocalMeta(payload.key)
    if (payload.updatedAt && payload.updatedAt > localUpdatedAt) {
      const nextState =
        payload.state && 'items' in payload.state
          ? { items: dedupeBrainDumpItems(payload.state.items) }
          : {
              items: mergeBrainDumpColumns(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (payload.state as any)?.left || [],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (payload.state as any)?.right || []
              ),
            }
      writeLocalBundle(payload.key, nextState, payload.updatedAt, {
        skipBroadcast: true,
      })
    }
  }
  channelInitialized = true
}

const normalizeLane = (item: BrainDumpItem): BrainDumpLane =>
  item.lane === 'right' ? 'right' : 'left'

export const dedupeBrainDumpItems = (items: BrainDumpItem[]) => {
  const seen = new Set<string>()
  const deduped: BrainDumpItem[] = []
  for (let i = items.length - 1; i >= 0; i -= 1) {
    const item = items[i]
    if (!item?.id) continue
    if (seen.has(item.id)) continue
    seen.add(item.id)
    deduped.push({ ...item, lane: normalizeLane(item) })
  }
  deduped.reverse()
  return deduped
}

export const splitBrainDumpItems = (items: BrainDumpItem[]) => {
  const left: BrainDumpItem[] = []
  const right: BrainDumpItem[] = []
  items.forEach((item) => {
    const lane = normalizeLane(item)
    if (lane === 'right') right.push({ ...item, lane })
    else left.push({ ...item, lane })
  })
  return { left, right }
}

export const mergeBrainDumpColumns = (left: BrainDumpItem[], right: BrainDumpItem[]) =>
  dedupeBrainDumpItems([
    ...left.map((item) => ({ ...item, lane: 'left' as const })),
    ...right.map((item) => ({ ...item, lane: 'right' as const })),
  ])

export const getNextBrainDumpLane = (items: BrainDumpItem[]): BrainDumpLane => {
  const { left, right } = splitBrainDumpItems(items)
  return left.length <= right.length ? 'left' : 'right'
}

export const readBrainDumpStorage = (userId?: string): BrainDumpState => {
  if (typeof window === 'undefined') return { items: [] }
  initChannel()
  try {
    const key = getStorageKey(userId)
    const raw = window.localStorage.getItem(key)
    const localUpdatedAt = readLocalMeta(key)
    void hydrateFromIdbIfStale(key, localUpdatedAt)

    // 兼容旧的左右 key
    const suffix = userId ? `-${userId}` : ''
    const fallbackLeft = window.localStorage.getItem(`${BRAIN_DUMP_STORAGE_KEY}-left${suffix}`)
    const fallbackRight = window.localStorage.getItem(`${BRAIN_DUMP_STORAGE_KEY}-right${suffix}`)

    if (!raw && !fallbackLeft && !fallbackRight) return { items: [] }
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed.items)) {
          return { items: dedupeBrainDumpItems(parsed.items) }
        }
        const left = Array.isArray(parsed.left) ? parsed.left : []
        const right = Array.isArray(parsed.right) ? parsed.right : []
        return { items: mergeBrainDumpColumns(left, right) }
      } catch (e) {
        console.warn('BrainDump storage corrupted or invalid JSON, ignoring.', e)
      }
    }

    const left = fallbackLeft ? JSON.parse(fallbackLeft) : []
    const right = fallbackRight ? JSON.parse(fallbackRight) : []
    return { items: mergeBrainDumpColumns(left, right) }
  } catch (error) {
    console.error('Failed to read Brain Dump storage', error)
    return { items: [] }
  }
}

export const fetchCloudBrainDump = async (user: User): Promise<BrainDumpState | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('brain_dump_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Fetch cloud brain dump error:', error.message)
    return null
  }

  if (!data) return { items: [] }

  const left: BrainDumpItem[] = []
  const right: BrainDumpItem[] = []

  data.forEach((item) => {
    let text = item.content
    let image: string | undefined = undefined

    try {
      if (item.content.startsWith('{') && item.content.includes('"type":')) {
        const parsed = JSON.parse(item.content)
        if (parsed.text !== undefined) text = parsed.text
        if (parsed.image !== undefined) image = parsed.image
      } else if (item.content.startsWith('data:image') || item.content.startsWith('http')) {
        text = ''
        image = item.content
      }
    } catch (e) {
      // Not JSON, treat as plain text
    }

    const bdItem: BrainDumpItem = {
      id: item.id,
      text: text,
      image: image,
    }
    if (item.bucket === 'left') left.push(bdItem)
    else right.push(bdItem)
  })

  return { items: mergeBrainDumpColumns(left, right) }
}

export const saveBrainDump = async (
  state: BrainDumpState | { left: BrainDumpItem[]; right: BrainDumpItem[] },
  user?: User | null
) => {
  const items = 'items' in state ? state.items : mergeBrainDumpColumns(state.left, state.right)
  const normalizedItems = dedupeBrainDumpItems(items)
  const { left, right } = splitBrainDumpItems(normalizedItems)
  const updatedAt = Date.now()
  if (typeof window !== 'undefined') {
    const key = getStorageKey(user?.id)
    initChannel()
    writeLocalBundle(key, { items: normalizedItems }, updatedAt)
  }

  // Cloud Save
  if (user) {
    const supabase = createClient()
    // Ensure the client has the current session to avoid RLS mismatch
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session || session.user.id !== user.id) {
      console.warn('BrainDump sync skipped: Session mismatch or not ready')
      return
    }

    // Helper: Convert Data URI to Blob
    const dataURItoBlob = (dataURI: string) => {
      const split = dataURI.split(',')
      const byteString = atob(split[1])
      const mimeString = split[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      return new Blob([ab], { type: mimeString })
    }

    // Helper: Upload base64 image and return public URL
    const processItemForCloud = async (item: BrainDumpItem): Promise<BrainDumpItem> => {
      let imageUrl = item.image
      if (item.image && item.image.startsWith('data:')) {
        try {
          const blob = dataURItoBlob(item.image)
          const fileExt =
            item.image.substring('data:image/'.length, item.image.indexOf(';base64')) || 'png'
          // Unique filename per item per user
          const fileName = `${user.id}/${item.id}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('brain-dump')
            .upload(fileName, blob, { upsert: true, contentType: blob.type })

          if (!uploadError) {
            const { data } = supabase.storage.from('brain-dump').getPublicUrl(fileName)
            imageUrl = data.publicUrl
          }
        } catch (e) {
          console.error('Failed to upload image', e)
        }
      }
      return { ...item, image: imageUrl }
    }

    // Helper to serialize content
    const serializeContent = (item: BrainDumpItem) => {
      if (item.text && item.image) {
        // Both exist: User JSON format
        return JSON.stringify({ text: item.text, image: item.image, type: 'composite' })
      }
      // Prefer text if exists, else image
      return item.text || item.image || ''
    }

    // Process items (upload images)
    const leftItems = await Promise.all(left.map(processItemForCloud))
    const rightItems = await Promise.all(right.map(processItemForCloud))

    // Prepare payloads
    const leftPayload = leftItems.map((item) => ({
      id: item.id,
      user_id: user.id,
      content: serializeContent(item),
      bucket: 'left',
      created_at: new Date().toISOString(),
    }))

    const rightPayload = rightItems.map((item) => ({
      id: item.id,
      user_id: user.id,
      content: serializeContent(item),
      bucket: 'right',
      created_at: new Date().toISOString(),
    }))

    const allItems = [...leftPayload, ...rightPayload]
    const allIds = allItems.map((i) => i.id)

    try {
      // Upsert
      if (allItems.length > 0) {
        const { error } = await supabase
          .from('brain_dump_items')
          .upsert(allItems, { onConflict: 'id' })
        if (error) console.error('Cloud save error (brain_dump):', error.message)
      }

      // Clean up deleted items
      // This delete logic assumes "Client is Master"
      if (allIds.length > 0) {
        // Delete anything not in the current list
        await supabase
          .from('brain_dump_items')
          .delete()
          .eq('user_id', user.id)
          .not('id', 'in', `(${allIds.join(',')})`)
      } else {
        // Delete all if empty
        await supabase.from('brain_dump_items').delete().eq('user_id', user.id)
      }
    } catch (e) {
      console.error('Brain dump sync failed:', e)
    }
  }
}

export const syncBrainDump = async (user: User) => {
  if (typeof window === 'undefined') return
  const state = readBrainDumpStorage()
  if (state.items.length === 0) return

  await saveBrainDump(state, user)
}
