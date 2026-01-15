'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { debounce } from 'lodash'
import {
  GRID_PRESETS,
  DEFAULT_LAYOUTS,
  EMPTY_HIDDEN,
  LAYOUT_VERSION,
} from '@/components/focus-lab/constants'
import { GridItem, LayoutPreset } from '@/components/focus-lab/types'
import {
  cloneLayout,
  mergeLayoutWithDefaults,
  isCollapsedLayout,
  isLayoutValid,
} from '@/components/focus-lab/utils'

export interface LayoutsByPreset {
  desktop: GridItem[]
  triple: GridItem[]
  double: GridItem[]
}

export interface FocusLabLayoutState {
  layoutsByPreset: LayoutsByPreset
  activePreset: LayoutPreset
  hiddenByPreset: Record<LayoutPreset, Set<string>>
  isLayoutLocked: boolean
  columns: number
}

export interface FocusLabLayoutActions {
  setActivePreset: (preset: LayoutPreset) => void
  handleLayoutChange: (preset: LayoutPreset, newLayout: GridItem[]) => void
  handleResetLayout: () => void
  handleToggleHidden: (preset: LayoutPreset, id: string) => void
  setIsLayoutLocked: (locked: boolean) => void
}

interface UseFocusLabLayoutOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateSettings?: (key: string, value: any) => void
  isSettingsLoaded?: boolean
}

/**
 * Hook for managing FocusLab grid layout state with persistence
 */
export const useFocusLabLayout = (options: UseFocusLabLayoutOptions = {}) => {
  const { settings, updateSettings, isSettingsLoaded = false } = options

  // --- State ---
  const [layoutsByPreset, setLayoutsByPreset] =
    useState<Record<LayoutPreset, GridItem[]>>(DEFAULT_LAYOUTS)
  const [hiddenByPreset, setHiddenByPreset] =
    useState<Record<LayoutPreset, Set<string>>>(EMPTY_HIDDEN)
  const [activePreset, setActivePreset] = useState<LayoutPreset>('desktop')
  const [isLayoutLocked, setIsLayoutLocked] = useState(true)
  const hasHydratedLayout = useRef(false)

  // --- Sync from Settings ---
  useEffect(() => {
    // If settings not loaded, or already hydrated, skip
    if (!isSettingsLoaded || !settings || !settings.focus_lab || hasHydratedLayout.current === true)
      return

    const defaults: Record<LayoutPreset, GridItem[]> = {
      desktop: cloneLayout(GRID_PRESETS.desktop.layout),
      triple: cloneLayout(GRID_PRESETS.triple.layout),
      double: cloneLayout(GRID_PRESETS.double.layout),
    }

    const emptyHidden: Record<LayoutPreset, Set<string>> = {
      desktop: new Set(),
      triple: new Set(),
      double: new Set(),
    }

    const storedVersion = settings.focus_lab.layout_version
    const forceDefaults = storedVersion !== LAYOUT_VERSION

    const nextLayouts: Record<LayoutPreset, GridItem[]> = { ...defaults }
    let shouldPersistLayout = false

    ;(['desktop', 'triple', 'double'] as LayoutPreset[]).forEach((preset) => {
      const saved = settings.focus_lab?.layout?.[preset]
      const collapsed = isCollapsedLayout(saved)
      const invalid = !isLayoutValid(preset, saved)
      if (forceDefaults || collapsed || invalid) {
        nextLayouts[preset] = defaults[preset]
        shouldPersistLayout = true
      } else {
        nextLayouts[preset] = mergeLayoutWithDefaults(preset, saved)
      }
    })

    setLayoutsByPreset(nextLayouts)

    const nextHidden: Record<LayoutPreset, Set<string>> = { ...emptyHidden }
    ;(['desktop', 'triple', 'double'] as LayoutPreset[]).forEach((preset) => {
      const hiddenArr = settings.focus_lab?.hidden_cards?.[preset]
      if (Array.isArray(hiddenArr)) {
        nextHidden[preset] = new Set(hiddenArr.filter(Boolean))
      }
    })
    setHiddenByPreset(nextHidden)

    if (shouldPersistLayout || forceDefaults) {
      if (updateSettings) {
        updateSettings('focus_lab.layout', {
          desktop: nextLayouts.desktop,
          triple: nextLayouts.triple,
          double: nextLayouts.double,
        })
        updateSettings('focus_lab.hidden_cards', {
          desktop: [],
          triple: [],
          double: [],
        })
        updateSettings('focus_lab.layout_version', LAYOUT_VERSION)
        updateSettings('focus_lab.layout_saved_at', Date.now())
      }
    }

    hasHydratedLayout.current = true
  }, [isSettingsLoaded, settings, updateSettings])

  // --- Persistence (Debounced) ---
  const debouncePersistLayout = useRef(
    debounce((nextLayouts: Record<LayoutPreset, GridItem[]>) => {
      if (updateSettings) {
        updateSettings('focus_lab.layout', {
          desktop: nextLayouts.desktop,
          triple: nextLayouts.triple,
          double: nextLayouts.double,
        })
        updateSettings('focus_lab.layout_version', LAYOUT_VERSION)
        updateSettings('focus_lab.layout_saved_at', Date.now())
      }
    }, 300)
  ).current

  useEffect(() => {
    return () => {
      debouncePersistLayout.cancel()
    }
  }, [debouncePersistLayout])

  // Persist Layout Changes
  useEffect(() => {
    if (!hasHydratedLayout.current) return
    debouncePersistLayout(layoutsByPreset)
  }, [layoutsByPreset, debouncePersistLayout])

  // Persist Hidden Changes
  useEffect(() => {
    if (!hasHydratedLayout.current || !updateSettings) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toArray = (set: Set<string>) => Array.from(set || []) as any[]
    updateSettings('focus_lab.hidden_cards', {
      desktop: toArray(hiddenByPreset.desktop),
      triple: toArray(hiddenByPreset.triple),
      double: toArray(hiddenByPreset.double),
    })
    updateSettings('focus_lab.layout_saved_at', Date.now())
  }, [hiddenByPreset, updateSettings])

  // --- Actions ---
  const handleLayoutChange = useCallback((preset: LayoutPreset, newLayout: GridItem[]) => {
    setLayoutsByPreset((prev) => {
      const next = { ...prev, [preset]: cloneLayout(newLayout) }
      return next
    })
  }, [])

  const handleResetLayout = useCallback(() => {
    const nextLayouts: Record<LayoutPreset, GridItem[]> = {
      desktop: cloneLayout(GRID_PRESETS.desktop.layout),
      triple: cloneLayout(GRID_PRESETS.triple.layout),
      double: cloneLayout(GRID_PRESETS.double.layout),
    }
    setLayoutsByPreset(nextLayouts)
    setHiddenByPreset({
      desktop: new Set(),
      triple: new Set(),
      double: new Set(),
    })
  }, [])

  const handleToggleHidden = useCallback((preset: LayoutPreset, id: string) => {
    setHiddenByPreset((prev) => {
      const next = { ...prev }
      const set = new Set(prev[preset])
      if (set.has(id)) {
        set.delete(id)
      } else {
        set.add(id)
      }
      next[preset] = set
      return next
    })
  }, [])

  const state: FocusLabLayoutState = {
    layoutsByPreset: layoutsByPreset as LayoutsByPreset,
    activePreset,
    hiddenByPreset,
    isLayoutLocked,
    columns: GRID_PRESETS[activePreset].columns,
  }

  const actions: FocusLabLayoutActions = {
    setActivePreset,
    handleLayoutChange,
    handleResetLayout,
    handleToggleHidden,
    setIsLayoutLocked,
  }

  return { state, actions }
}
