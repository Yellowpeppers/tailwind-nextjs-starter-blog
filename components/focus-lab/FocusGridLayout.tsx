'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ResponsiveGridLayout, type Layout } from 'react-grid-layout'

type RLayouts = Record<string, Layout>
import isEqual from 'lodash/isEqual'
import { useFocusSettingsContext } from '@/components/focus-lab/FocusSettingsContext'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

// RGL v2 已直接导出 ResponsiveGridLayout（已含 WidthProvider）

export type LayoutPreset = 'desktop' | 'triple' | 'double'

export type GridItem = {
  id: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
}

type RenderArgs = {
  item: GridItem
  isFocused: boolean
  onRemove: () => void
  onToggleFocus: () => void
}

type Props = {
  activePreset: LayoutPreset
  layouts: Record<LayoutPreset, GridItem[]>
  onLayoutChange: (preset: LayoutPreset, layout: GridItem[]) => void
  onRemoveItem: (preset: LayoutPreset, id: string) => void
  isFocusMode?: boolean
  focusedCardIds?: Set<string>
  onToggleFocusCard?: (id: string) => void
  rowHeight?: number
  margin?: [number, number]
  containerPadding?: [number, number]
  breakpoints?: Record<LayoutPreset, number>
  cols?: Record<LayoutPreset, number>
  renderItem: (args: RenderArgs) => React.ReactNode
  /** 布局版本 key，变化时强制重新挂载 ResponsiveGridLayout */
  layoutKey?: number
  /** 强制使用指定预设，忽略 RGL 的断点切换 */
  forcePreset?: LayoutPreset
  /** 是否锁定布局 (禁止拖拽和调整大小) */
  isLayoutLocked?: boolean
}

const defaultBreakpoints: Record<LayoutPreset, number> = {
  desktop: 900,
  triple: 640,
  double: 0,
}

const defaultCols: Record<LayoutPreset, number> = {
  desktop: 16,
  triple: 12,
  double: 8,
}

const toRglLayout = (items: GridItem[], locked: boolean): Layout =>
  items.map((item) => ({
    i: item.id,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: item.minW,
    minH: item.minH,
    static: locked, // Force static (no drag/resize) if locked
  })) as unknown as Layout

const fromRglLayout = (items: Layout): GridItem[] =>
  items.map((item) => ({
    id: String(item.i),
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: item.minW,
    minH: item.minH,
  }))

export function FocusGridLayout({
  activePreset,
  layouts,
  onLayoutChange,
  onRemoveItem,
  isFocusMode = false,
  focusedCardIds = new Set(),
  onToggleFocusCard,
  rowHeight = 54,
  margin = [22, 22],
  containerPadding = [0, 0],
  breakpoints = defaultBreakpoints,
  cols = defaultCols,
  renderItem,
  layoutKey = 0,
  forcePreset,
  isLayoutLocked = false,
}: Props) {
  const { isLoaded } = useFocusSettingsContext()
  const [currentBreakpoint, setCurrentBreakpoint] = useState<LayoutPreset>(
    forcePreset ?? activePreset
  )
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setCurrentBreakpoint(forcePreset ?? activePreset)
  }, [activePreset, forcePreset])

  // 仅当已加载设置后再渲染，避免布局抖动
  const canRender = isLoaded

  // 固定栅格宽度，避免随窗口宽度拉伸（类似 Notion 的固定列宽体验）
  const gridWidthByPreset = useMemo(() => {
    const gapX = margin[0] ?? 0
    const calc = (preset: LayoutPreset) => cols[preset] * 54 + (cols[preset] - 1) * gapX
    return {
      desktop: calc('desktop'),
      triple: calc('triple'),
      double: calc('double'),
    }
  }, [cols, margin])

  // 只在焦点模式时过滤可见卡片
  const visibleLayouts = useMemo(() => {
    if (!isFocusMode || focusedCardIds.size === 0) {
      return {
        desktop: toRglLayout(layouts.desktop, isLayoutLocked),
        triple: toRglLayout(layouts.triple, isLayoutLocked),
        double: toRglLayout(layouts.double, isLayoutLocked),
      } as RLayouts
    }

    const filterItems = (items: GridItem[]) => items.filter((i) => focusedCardIds.has(i.id))
    return {
      desktop: toRglLayout(filterItems(layouts.desktop), isLayoutLocked),
      triple: toRglLayout(filterItems(layouts.triple), isLayoutLocked),
      double: toRglLayout(filterItems(layouts.double), isLayoutLocked),
    } as RLayouts
  }, [focusedCardIds, isFocusMode, layouts, isLayoutLocked])

  const gridItemsForRender = useMemo(() => {
    const makeMap = (items: Layout) => {
      const gridItems = fromRglLayout(items)
      const map = new Map<string, GridItem>()
      gridItems.forEach((item) => map.set(item.id, item))
      return map
    }
    return {
      desktop: makeMap(visibleLayouts.desktop || []),
      triple: makeMap(visibleLayouts.triple || []),
      double: makeMap(visibleLayouts.double || []),
    }
  }, [visibleLayouts])

  const handleLayoutChange = (currentLayout: Layout) => {
    const mapped = fromRglLayout(currentLayout)
    const previous = layouts[currentBreakpoint] || []
    if (isEqual(previous, mapped)) return
    onLayoutChange(currentBreakpoint, mapped)
  }

  const gridWidth = gridWidthByPreset[currentBreakpoint]
  const effectiveBreakpoints = forcePreset
    ? ({ [forcePreset]: 0 } as Record<LayoutPreset, number>)
    : breakpoints
  const effectiveCols = forcePreset
    ? ({ [forcePreset]: cols[forcePreset] } as Record<LayoutPreset, number>)
    : cols
  const effectiveLayouts = forcePreset
    ? ({ [forcePreset]: visibleLayouts[forcePreset] } as RLayouts)
    : visibleLayouts

  // Cast to any to avoid strict prop type errors (e.g. draggableHandle)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ResponsiveGridLayoutAny = ResponsiveGridLayout as any

  return (
    <div
      className="w-full"
      ref={containerRef}
      style={{ minWidth: gridWidth, width: gridWidth, margin: '0 auto' }}
    >
      {canRender && (
        <ResponsiveGridLayoutAny
          key={`rgl-${layoutKey}-${isLayoutLocked}`}
          width={gridWidth}
          className="focuslab-grid"
          breakpoints={effectiveBreakpoints}
          cols={effectiveCols}
          layouts={effectiveLayouts}
          rowHeight={rowHeight}
          margin={margin}
          draggableHandle=".focuslab-drag-handle"
          draggableCancel=".focuslab-no-drag"
          containerPadding={containerPadding}
          isDraggable={!isFocusMode || focusedCardIds.size === 0}
          isResizable={!isFocusMode || focusedCardIds.size === 0}
          compactType={null}
          preventCollision={false}
          onBreakpointChange={(bp) => setCurrentBreakpoint((forcePreset ?? bp) as LayoutPreset)}
          onLayoutChange={handleLayoutChange}
          measureBeforeMount
          useCSSTransforms
        >
          {(visibleLayouts[currentBreakpoint] || []).map((item) => {
            const gridItem = gridItemsForRender[currentBreakpoint].get(String(item.i))
            if (!gridItem) return null
            return (
              <div
                key={item.i}
                id={`widget-${item.i}`}
                data-grid={{
                  i: String(item.i),
                  x: gridItem.x,
                  y: gridItem.y,
                  w: gridItem.w,
                  h: gridItem.h,
                  minW: gridItem.minW,
                  minH: gridItem.minH,
                }}
                className="h-full"
              >
                {renderItem({
                  item: gridItem,
                  isFocused: focusedCardIds.has(String(item.i)),
                  onRemove: () => onRemoveItem(currentBreakpoint, String(item.i)),
                  onToggleFocus: () => onToggleFocusCard?.(String(item.i)),
                })}
              </div>
            )
          })}
        </ResponsiveGridLayoutAny>
      )}
    </div>
  )
}
