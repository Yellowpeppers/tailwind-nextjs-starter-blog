import React, { useMemo } from 'react'
import GridLayout from 'react-grid-layout'
// @ts-expect-error - react-grid-layout types are incomplete
import WidthProvider from 'react-grid-layout/build/components/WidthProvider'
import { UseFocusGridResult } from '../hooks/useFocusGrid'

// Use any to bypass type issues with react-grid-layout's Responsive export
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ResponsiveGridLayout = WidthProvider(GridLayout) as any

const ROW_HEIGHT = 40

export const FocusGridLayout = ({
  grid,
  className,
  children,
  isDraggable = true,
  isResizable = true,
}: {
  grid: UseFocusGridResult
  className?: string
  children: React.ReactNode
  isDraggable?: boolean
  isResizable?: boolean
}) => {
  const { state, actions } = grid
  const { layout } = state
  const { handleLayoutChange } = actions

  // Convert GridItem[] to Layout[] for react-grid-layout
  const rglLayout = useMemo(() => {
    return layout.map((item) => ({
      i: item.id,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: item.minW,
      minH: item.minH,
    }))
  }, [layout])

  return (
    <ResponsiveGridLayout
      className={className}
      layouts={{ lg: rglLayout, md: rglLayout, sm: rglLayout }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={ROW_HEIGHT}
      margin={[16, 16]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onLayoutChange={(currentLayout: any) => handleLayoutChange(currentLayout)}
      isDraggable={isDraggable}
      isResizable={isResizable}
      draggableHandle=".drag-handle"
      resizeHandles={['se']}
      preventCollision={false}
    >
      {children}
    </ResponsiveGridLayout>
  )
}
