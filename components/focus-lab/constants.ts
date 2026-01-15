import { GridItem, LayoutPreset, SoundOption } from './types'

export const SOUND_LIBRARY: SoundOption[] = []

// --- Grid System ---

export const INITIAL_LAYOUT: GridItem[] = [
  // 第一行：白噪音（3x3）、多巴胺（3x3）、任务拆解（4x5）、右侧 Attention Hub（6x9）
  { id: 'sonic', x: 0, y: 0, w: 3, h: 3, minW: 3, minH: 3 },
  { id: 'dopamine', x: 3, y: 0, w: 3, h: 3, minW: 3, minH: 3 },
  { id: 'breaker', x: 6, y: 0, w: 4, h: 5, minW: 3, minH: 5 },
  { id: 'brain', x: 10, y: 0, w: 6, h: 9, minW: 3, minH: 3 },

  // 第二行：Today’s Tasks（6x6）、Focus Timer（4x4）
  { id: 'todo', x: 0, y: 3, w: 6, h: 6, minW: 3, minH: 3 },
  { id: 'timer', x: 6, y: 5, w: 4, h: 4, minW: 3, minH: 3 },
]

export const TRIPLE_LAYOUT: GridItem[] = [
  { id: 'sonic', x: 0, y: 0, w: 3, h: 3, minW: 3, minH: 3 },
  { id: 'dopamine', x: 3, y: 0, w: 3, h: 3, minW: 3, minH: 3 },
  { id: 'breaker', x: 6, y: 0, w: 3, h: 5, minW: 3, minH: 5 },
  { id: 'brain', x: 9, y: 0, w: 3, h: 9, minW: 3, minH: 3 },
  { id: 'todo', x: 0, y: 3, w: 6, h: 6, minW: 3, minH: 3 },
  { id: 'timer', x: 6, y: 5, w: 3, h: 4, minW: 3, minH: 3 },
]

export const DOUBLE_LAYOUT: GridItem[] = [
  { id: 'sonic', x: 0, y: 0, w: 4, h: 3, minW: 3, minH: 3 },
  { id: 'dopamine', x: 4, y: 0, w: 4, h: 3, minW: 3, minH: 3 },
  { id: 'breaker', x: 0, y: 3, w: 4, h: 5, minW: 3, minH: 5 },
  { id: 'brain', x: 4, y: 3, w: 4, h: 9, minW: 3, minH: 3 },
  { id: 'todo', x: 0, y: 8, w: 4, h: 6, minW: 3, minH: 3 },
  { id: 'timer', x: 4, y: 12, w: 4, h: 4, minW: 3, minH: 3 },
]

export const GRID_PRESETS: Record<LayoutPreset, { columns: number; layout: GridItem[] }> = {
  desktop: { columns: 16, layout: INITIAL_LAYOUT },
  triple: { columns: 12, layout: TRIPLE_LAYOUT },
  double: { columns: 8, layout: DOUBLE_LAYOUT },
}

export const LAYOUT_VERSION = 'focuslab-layout-v10'

export const SIDEBAR_BTN_BASE =
  'group flex w-full min-h-[44px] items-center gap-3 rounded-2xl px-3 py-2.5 text-base font-semibold text-gray-700 transition-all hover:bg-white/90 hover:shadow-sm dark:text-gray-200 dark:hover:bg-white/5'

export const COL_WIDTH = 54
export const ROW_HEIGHT = 54
export const GAP = 22
export const GRID_WIDTH_DESKTOP = 16 * ROW_HEIGHT + (16 - 1) * GAP
export const CONTROL_BUTTON_BASE =
  'relative flex h-12 px-5 min-w-[150px] items-center justify-center rounded-full border text-sm font-semibold transition-all text-center'

const cloneLayout = (items: GridItem[]) => items.map((item) => ({ ...item }))

export const DEFAULT_LAYOUTS: Record<LayoutPreset, GridItem[]> = {
  desktop: cloneLayout(GRID_PRESETS.desktop.layout),
  triple: cloneLayout(GRID_PRESETS.triple.layout),
  double: cloneLayout(GRID_PRESETS.double.layout),
}

export const EMPTY_HIDDEN: Record<LayoutPreset, Set<string>> = {
  desktop: new Set(),
  triple: new Set(),
  double: new Set(),
}

export const INCENTIVE_MESSAGES = {
  zh: [
    '太棒了！离目标更近了一步！',
    '专注的你闪闪发光 ✨',
    '今天的努力都算数！',
    '干得漂亮！保持这个节奏！',
    '效率满分！为你点赞 👍',
    '你真的很自律！',
    '坚持就是胜利，继续加油！',
    '休息一下，整装待发！',
    '已完成！成就感满满 🎉',
    '你的进步肉眼可见！',
  ],
  en: [
    'Great job! One step closer!',
    "You're on fire today! 🔥",
    'Focus looks good on you!',
    'Well done! Keep the momentum.',
    'Crushing it! 🚀',
    'Proud of your progress!',
    'Efficiency level: Expert!',
    'Stay awesome!',
    'Goal smashed! 🎉',
    'Making it happen!',
  ],
}
