import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export const DOPAMINE_STORAGE_KEY_PREFIX = 'focus-lab-dopamine-options-'
export const LEGACY_KEY = 'focus-lab-dopamine-options'

// Dopamine Menu is just a list of strings
export type DopamineState = string[]

export const readDopamineStorage = (lang: string): DopamineState | null => {
  if (typeof window === 'undefined') return null
  try {
    const key = `${DOPAMINE_STORAGE_KEY_PREFIX}${lang}`
    const saved = window.localStorage.getItem(key)
    const legacy = window.localStorage.getItem(LEGACY_KEY)

    if (saved) return JSON.parse(saved)
    if (!saved && legacy) return JSON.parse(legacy) // Fallback/Migrate

    return null // Let caller handle defaults
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
  // Local Save
  if (typeof window !== 'undefined') {
    const key = `${DOPAMINE_STORAGE_KEY_PREFIX}${lang}`
    window.localStorage.setItem(key, JSON.stringify(options))
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
