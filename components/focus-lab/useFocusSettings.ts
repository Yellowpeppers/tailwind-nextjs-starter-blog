'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { debounce, merge, cloneDeep } from 'lodash'
import { type CardAnimationPreset } from '@/components/focus-lab/types'

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
    hidden_cards?: {
      desktop?: string[]
      triple?: string[]
      double?: string[]
    }
    layout_version?: string
    layout_saved_at?: number
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
    motion?: {
      enabled?: boolean
      preset?: CardAnimationPreset
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
    hidden_cards: { desktop: [], triple: [], double: [] },
    layout_version: undefined,
    layout_saved_at: 0,
    sound: { master_volume: 0.8, active_tracks: {} },
    stats: {},
    timer: { custom_duration: 1500 },
    motion: { enabled: true, preset: 'float' },
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
      const hiddenFallback = {
        desktop: [] as string[],
        triple: [] as string[],
        double: [] as string[],
      }
      const localSettings = cloneDeep(defaultSettings)
      let cloudSettings: Settings | null = null

      // Try LocalStorage first (cache/fast load)
      try {
        if (typeof window !== 'undefined') {
          // Scope key to user if logged in, else use Guest key
          const localKey = user ? `${STORAGE_KEY}-${user.id}` : STORAGE_KEY
          const local = window.localStorage.getItem(localKey)
          if (local) {
            merge(localSettings, JSON.parse(local))
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
            cloudSettings = cloneDeep(data.settings) as Settings
          }
        } catch (e) {
          console.error('Failed to load cloud settings', e)
        }
      }

      // Base merge：默认 -> 本地 -> 云端（其它设置字段按云端优先）
      const merged = cloneDeep(defaultSettings)
      merge(merged, localSettings)
      if (cloudSettings) merge(merged, cloudSettings)

      // 针对布局/隐藏采用“最新时间戳优先”，避免云端写入失败时覆盖本地修改
      const localTs = localSettings.focus_lab?.layout_saved_at ?? 0
      const cloudTs = cloudSettings?.focus_lab?.layout_saved_at ?? 0
      const pickCloud = cloudTs > localTs
      const pickLocal = localTs > cloudTs

      merged.focus_lab = merged.focus_lab || { layout: {}, hide_headers: false }
      if (pickCloud && cloudSettings?.focus_lab) {
        merged.focus_lab.layout = cloudSettings.focus_lab.layout ?? merged.focus_lab.layout ?? {}
        merged.focus_lab.hidden_cards =
          cloudSettings.focus_lab.hidden_cards ?? merged.focus_lab.hidden_cards ?? hiddenFallback
        merged.focus_lab.layout_version =
          cloudSettings.focus_lab.layout_version ?? merged.focus_lab.layout_version
        merged.focus_lab.layout_saved_at = cloudTs
      } else if (pickLocal && localSettings.focus_lab) {
        merged.focus_lab.layout = localSettings.focus_lab.layout ?? merged.focus_lab.layout ?? {}
        merged.focus_lab.hidden_cards =
          localSettings.focus_lab.hidden_cards ?? merged.focus_lab.hidden_cards ?? hiddenFallback
        merged.focus_lab.layout_version =
          localSettings.focus_lab.layout_version ?? merged.focus_lab.layout_version
        merged.focus_lab.layout_saved_at = localTs
      } else {
        merged.focus_lab.hidden_cards = merged.focus_lab.hidden_cards ?? hiddenFallback
        merged.focus_lab.layout_saved_at =
          merged.focus_lab.layout_saved_at ?? Math.max(localTs, cloudTs)
      }

      setSettings(merged)
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
