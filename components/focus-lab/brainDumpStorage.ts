import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

const BRAIN_DUMP_STORAGE_KEY_LEFT = 'focus-lab-brain-dump-left'
const BRAIN_DUMP_STORAGE_KEY_RIGHT = 'focus-lab-brain-dump-right'

export type BrainDumpItem = {
  id: string
  text: string
  image?: string
}

export type BrainDumpState = {
  left: BrainDumpItem[]
  right: BrainDumpItem[]
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
export const createBrainDumpItem = (text: string, image?: string): BrainDumpItem => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : fallbackId(),
  text,
  image,
})

export const readBrainDumpStorage = (userId?: string): BrainDumpState => {
  if (typeof window === 'undefined') return { left: [], right: [] }
  try {
    const suffix = userId ? `-${userId}` : ''
    const left = window.localStorage.getItem(BRAIN_DUMP_STORAGE_KEY_LEFT + suffix)
    const right = window.localStorage.getItem(BRAIN_DUMP_STORAGE_KEY_RIGHT + suffix)

    return {
      left: left ? JSON.parse(left) : [],
      right: right ? JSON.parse(right) : [],
    }
  } catch (error) {
    console.error('Failed to read Brain Dump storage', error)
    return { left: [], right: [] }
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

  if (!data) return { left: [], right: [] }

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

  return { left, right }
}

export const saveBrainDump = async (state: BrainDumpState, user?: User | null) => {
  // Local Save (Always save to local cache, scoped)
  if (typeof window !== 'undefined') {
    const suffix = user ? `-${user.id}` : ''
    window.localStorage.setItem(BRAIN_DUMP_STORAGE_KEY_LEFT + suffix, JSON.stringify(state.left))
    window.localStorage.setItem(BRAIN_DUMP_STORAGE_KEY_RIGHT + suffix, JSON.stringify(state.right))
  }

  // Cloud Save
  if (user) {
    const supabase = createClient()

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
    const leftItems = await Promise.all(state.left.map(processItemForCloud))
    const rightItems = await Promise.all(state.right.map(processItemForCloud))

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
  if (state.left.length === 0 && state.right.length === 0) return

  await saveBrainDump(state, user)
}
