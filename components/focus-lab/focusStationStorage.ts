'use client'

import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export const STATION_STORAGE_KEY = 'focus-lab-station-items'
export const STATION_SYNC_EVENT = 'focus-lab-station-updated'

export type FocusItemType = 'text' | 'image'

export type FocusItem = {
  id: string
  type: FocusItemType
  content: string // Text content or Image URL/Path
  completed: boolean
  position: number
  created_at?: string
}

// ... helper ...
const fallbackId = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const createFocusItem = (type: FocusItemType, content: string): FocusItem => {
  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : fallbackId(),
    type,
    content,
    completed: false,
    position: Date.now(), // simple positioning
  }
}

export const readStationStorage = (): FocusItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const storage = window.localStorage
    const value = storage.getItem(STATION_STORAGE_KEY)
    if (!value) return []
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.map((item: Record<string, unknown>) => ({
      ...item,
      completed: (item.completed as boolean) ?? false, // Ensure completed field exists, default to false
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
    completed: d.is_completed || false, // Map from DB
  }))
}

export const saveStationItems = async (items: FocusItem[], user?: User | null) => {
  try {
    // Local Write (Only if Guest)
    if (typeof window !== 'undefined' && !user) {
      window.localStorage.setItem(STATION_STORAGE_KEY, JSON.stringify(items))
      window.dispatchEvent(new CustomEvent(STATION_SYNC_EVENT, { detail: items }))
    }

    // Cloud Write
    if (user) {
      const supabase = createClient()

      // We need to map our simple object to DB columns
      const dbPayload = items.map((item, index) => ({
        id: item.id,
        user_id: user.id,
        type: item.type,
        content: item.content,
        is_completed: item.completed, // Map to DB column
        position: index, // Update position based on array order
        updated_at: new Date().toISOString(),
      }))

      // Upsert all.
      // Note: This approach replaces the user's list on THIS device's state.
      // A more robust sync would be complex (CRDTs), but for a single user simple override is okay
      // provided we don't wipe out other data.
      // To safely "sync", we usually fetch first, merge, then save.
      // Here we assume "Client is Truth" for the list order/content.

      try {
        const { error } = await supabase.from('focus_items').upsert(dbPayload, { onConflict: 'id' })
        if (error) console.error('Cloud save error (focus_items):', error.message || error)

        // Also, we might want to delete items that are NOT in this list?
        // For now, let's just upsert. Implementation detail: Deletion logic needed if we want full sync.
        // A simple strategy for a list: Delete all for user, then Insert all. (Heavy but safe for order)
        // or Upsert + separate delete.
        // Let's stick to Upsert. If user deleted an item locally, it won't be in `items`.
        // We need to actually delete it from DB.

        // Strategy: Get all IDs from `items`. Delete from DB where user_id = me AND id NOT IN (ids)
        if (items.length > 0) {
          const ids = items.map((i) => i.id)
          await supabase
            .from('focus_items')
            .delete()
            .eq('user_id', user.id)
            .not('id', 'in', `(${ids.join(',')})`)
        } else {
          // If items is empty, delete all
          await supabase.from('focus_items').delete().eq('user_id', user.id)
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

  // We assume bucket 'focus-assets' exists
  const { error: uploadError, data } = await supabase.storage
    .from('focus-assets')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Upload error', uploadError)
    return null
  }

  // Get Public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('focus-assets').getPublicUrl(fileName)

  return publicUrl
}

// Sync function for initial login
export const syncLocalToCloud = async (user: User) => {
  if (typeof window === 'undefined') return
  const localItems = readStationStorage()
  if (localItems.length === 0) return

  // Just trigger a save
  await saveStationItems(localItems, user)
}
