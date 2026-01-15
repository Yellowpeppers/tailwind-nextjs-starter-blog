import { useState, useCallback, useEffect, useRef } from 'react'
import { debounce } from 'lodash'
import { useFocusSettingsContext } from '@/components/focus-lab/FocusSettingsContext'
import { LayoutPreset, GridItem } from '../types'

// RGL Layout item type (react-grid-layout's Layout type)
interface RGLLayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  static?: boolean
  isDraggable?: boolean
  isResizable?: boolean
}
import { GRID_PRESETS, DEFAULT_LAYOUTS, EMPTY_HIDDEN } from '../constants'
import { normalizeLayout, isLayoutValid, mergeLayoutWithDefaults, cloneLayout } from '../utils'

export const useFocusGrid = () => {
  const { settings, updateSettings, isLoaded: isSettingsLoaded } = useFocusSettingsContext()

  // State
  const [activePreset, setActivePreset] = useState<LayoutPreset>('desktop')
  const [layout, setLayout] = useState<GridItem[]>(GRID_PRESETS.desktop.layout)

  const [hiddenByPreset, setHiddenByPreset] =
    useState<Record<LayoutPreset, Set<string>>>(EMPTY_HIDDEN)

  // Initialization Refs
  const isLayoutLoaded = useRef(false)
  const prevLayoutSettings = useRef<{
    preset?: string
    layouts?: Record<string, GridItem[]>
    hidden?: Record<string, string[]>
  }>({})
  const isRemoteUpdate = useRef(false)

  // 1. Load Layout from Settings
  useEffect(() => {
    if (!isSettingsLoaded) return

    const storedPreset = settings.focus_lab?.layout?.preset as LayoutPreset | undefined
    const storedLayouts = settings.focus_lab?.layout?.layouts as
      | Record<string, GridItem[]>
      | undefined
    const storedHidden = settings.focus_lab?.layout?.hidden as Record<string, string[]> | undefined

    const prev = prevLayoutSettings.current
    if (
      storedPreset === prev.preset &&
      storedLayouts === prev.layouts &&
      storedHidden === prev.hidden
    ) {
      if (isLayoutLoaded.current) return
    }

    isRemoteUpdate.current = true

    // A. Active Preset
    if (storedPreset && GRID_PRESETS[storedPreset]) {
      setActivePreset(storedPreset)
    }

    // B. Hidden Items
    if (storedHidden) {
      const nextHidden: Record<LayoutPreset, Set<string>> = {
        desktop: new Set(),
        triple: new Set(),
        double: new Set(),
      }
      Object.keys(storedHidden).forEach((key) => {
        const k = key as LayoutPreset
        if (Array.isArray(storedHidden[k])) {
          nextHidden[k] = new Set(storedHidden[k])
        }
      })
      setHiddenByPreset(nextHidden)
    }

    // C. Layout Items
    const targetPreset = storedPreset && GRID_PRESETS[storedPreset] ? storedPreset : activePreset

    let targetLayout = GRID_PRESETS[targetPreset].layout

    if (storedLayouts && Array.isArray(storedLayouts[targetPreset])) {
      const raw = storedLayouts[targetPreset]
      if (isLayoutValid(targetPreset, raw)) {
        targetLayout = mergeLayoutWithDefaults(targetPreset, raw) as GridItem[]
      }
    }

    const finalLayout = normalizeLayout(targetPreset, targetLayout)
    setLayout(finalLayout)

    prevLayoutSettings.current = {
      preset: storedPreset,
      layouts: storedLayouts,
      hidden: storedHidden,
    }

    isLayoutLoaded.current = true
    setTimeout(() => {
      isRemoteUpdate.current = false
    }, 50)
  }, [isSettingsLoaded, settings.focus_lab?.layout, activePreset])

  // 2. Persist Layout Changes (Debounced)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveLayoutSettings = useCallback(
    debounce(
      (
        preset: LayoutPreset,
        currentLayout: GridItem[],
        hidden: Record<LayoutPreset, Set<string>>
      ) => {
        const hiddenInfo: Record<string, string[]> = {}
        Object.keys(hidden).forEach((k) => {
          hiddenInfo[k] = Array.from(hidden[k as LayoutPreset])
        })

        updateSettings(`focus_lab.layout.layouts.${preset}`, currentLayout)
        updateSettings(`focus_lab.layout.hidden`, hiddenInfo)
        updateSettings(`focus_lab.layout.preset`, preset)
      },
      1000
    ),
    [updateSettings]
  )

  // 3. Sync State -> Persistence
  useEffect(() => {
    if (isLayoutLoaded.current && !isRemoteUpdate.current && isSettingsLoaded) {
      saveLayoutSettings(activePreset, layout, hiddenByPreset)
    }
  }, [layout, activePreset, hiddenByPreset, isSettingsLoaded, saveLayoutSettings])

  // -- Actions --

  const handleLayoutChange = useCallback((currentLayout: RGLLayoutItem[]) => {
    setLayout((prev) => {
      const next = prev.map((item) => {
        const match = currentLayout.find((l) => l.i === item.id)
        if (match) {
          return {
            ...item,
            x: match.x,
            y: match.y,
            w: match.w,
            h: match.h,
          }
        }
        return item
      })
      return next
    })
  }, [])

  const handleToggleHidden = useCallback((preset: LayoutPreset, id: string) => {
    setHiddenByPreset((prev) => {
      const next = { ...prev }
      const set = new Set(next[preset])
      if (set.has(id)) {
        set.delete(id)
      } else {
        set.add(id)
      }
      next[preset] = set
      return next
    })
  }, [])

  const handleResetLayout = useCallback(() => {
    const defaults = cloneLayout(GRID_PRESETS[activePreset].layout)
    setLayout(defaults)
    setHiddenByPreset((prev) => {
      const next = { ...prev }
      next[activePreset] = new Set()
      return next
    })
  }, [activePreset])

  const changePreset = useCallback(
    (preset: LayoutPreset) => {
      setActivePreset(preset)

      const storedLayouts = settings.focus_lab?.layout?.layouts as
        | Record<string, GridItem[]>
        | undefined
      let targetLayout = GRID_PRESETS[preset].layout

      if (storedLayouts && Array.isArray(storedLayouts[preset])) {
        if (isLayoutValid(preset, storedLayouts[preset])) {
          targetLayout = mergeLayoutWithDefaults(preset, storedLayouts[preset]) as GridItem[]
        }
      }
      setLayout(normalizeLayout(preset, targetLayout))
    },
    [settings.focus_lab?.layout?.layouts]
  )

  return {
    state: {
      layout,
      activePreset,
      hiddenByPreset,
      hiddenIds: hiddenByPreset[activePreset] || new Set(),
    },
    actions: {
      handleLayoutChange,
      handleToggleHidden,
      handleResetLayout,
      changePreset,
    },
  }
}

export type UseFocusGridResult = ReturnType<typeof useFocusGrid>
