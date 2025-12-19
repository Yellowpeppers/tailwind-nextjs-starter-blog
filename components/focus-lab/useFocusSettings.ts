'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { debounce, merge, cloneDeep } from 'lodash'

type GridItem = {
  id: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

type ActiveTrack = {
  id: string
  volume: number
  isPlaying: boolean
}

export type Settings = {
  theme?: {
    mode?: string
    color?: string
  }
  focus_lab?: {
    layout?: Record<string, GridItem[]> // desktop, mobile, etc.
    hide_headers?: boolean
    sound?: {
      enabled?: boolean
      master_volume?: number
      active_tracks?: Record<string, ActiveTrack>
    }
    stats?: {
      goal_hours?: number
      goal_tasks?: number
    }
    timer?: {
      custom_duration?: number
    }
    // Reserved for future
  }
}

const STORAGE_KEY = 'focus-lab-settings-v1'

const defaultSettings: Settings = {
  theme: { mode: 'system', color: 'blue' },
  focus_lab: {
    layout: {},
    hide_headers: false,
    sound: { master_volume: 0.8, active_tracks: {} },
    stats: {},
    timer: { custom_duration: 1500 },
  },
}

export function useFocusSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)
  const isSyncing = useRef(false)

  // 1. Load Settings (Local or Cloud)
  useEffect(() => {
    const loadSettings = async () => {
      const loadedSettings = cloneDeep(defaultSettings)

      // Try LocalStorage first (cache/fast load)
      try {
        if (typeof window !== 'undefined') {
          // Scope key to user if logged in, else use Guest key
          const localKey = user ? `${STORAGE_KEY}-${user.id}` : STORAGE_KEY
          const local = window.localStorage.getItem(localKey)
          if (local) {
            merge(loadedSettings, JSON.parse(local))
          }
        }
      } catch (e) {
        console.error('Failed to load local settings', e)
      }

      // If User, merge Cloud
      if (user) {
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('profiles')
            .select('settings')
            .eq('id', user.id)
            .single()

          if (data && data.settings) {
            // Deep merge cloud over local
            // Note: In a real conflict resolution we might check timestamps,
            // but here we assume Cloud is Truth if logged in.
            merge(loadedSettings, data.settings)
          }
        } catch (e) {
          console.error('Failed to load cloud settings', e)
        }
      }

      setSettings(loadedSettings)
      setIsLoaded(true)
    }

    loadSettings()
  }, [user])

  // 2. Debounced Save Function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveToCloud = useCallback(
    debounce(async (newSettings: Settings, userId: string) => {
      if (isSyncing.current) return
      isSyncing.current = true
      try {
        const supabase = createClient()
        // We update the WHOLE settings JSON to avoid complex partial patching on DB side for now.
        // Profiles table 'settings' column is JSONB.
        const { error } = await supabase
          .from('profiles')
          .update({ settings: newSettings })
          .eq('id', userId)

        if (error) throw error
        console.log('Settings synced to cloud')
      } catch (e) {
        console.error('Cloud save failed', e)
      } finally {
        isSyncing.current = false
      }
    }, 1000),
    []
  )

  // 3. Update Function exposed to components
  const updateSettings = useCallback(
    (path: string, value: unknown) => {
      setSettings((prev) => {
        const next = cloneDeep(prev)

        // Simple path traverser
        const parts = path.split('.')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any = next
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {}
          current = current[parts[i]]
        }
        current[parts[parts.length - 1]] = value

        // Save to LocalStorage immediately
        // Scope key to user if logged in, ensuring Guest and User settings never collide
        if (typeof window !== 'undefined') {
          const localKey = user ? `${STORAGE_KEY}-${user.id}` : STORAGE_KEY
          window.localStorage.setItem(localKey, JSON.stringify(next))
        }

        // Trigger Cloud Save (Debounced)
        if (user) {
          saveToCloud(next, user.id)
        }

        return next
      })
    },
    [user, saveToCloud]
  )

  return {
    settings,
    updateSettings,
    isLoaded,
  }
}
