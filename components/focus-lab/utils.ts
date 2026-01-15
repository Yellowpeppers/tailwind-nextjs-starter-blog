import { GreetingInfo, GridItem, LayoutPreset } from './types'
import { GRID_PRESETS } from './constants'

export const getSecondsUntilTarget = (timeStr: string) => {
  if (!timeStr) return 0
  const [hours, minutes] = timeStr.split(':').map((value) => parseInt(value, 10))
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0
  const now = new Date()
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)
  if (target <= now) {
    target.setDate(target.getDate() + 1)
  }
  return Math.max(Math.round((target.getTime() - now.getTime()) / 1000), 0)
}

export const playClickSound = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // High pitch beep
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1) // Drop pitch

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.1)
}

export const computeGreeting = (lang: string, userName?: string): GreetingInfo => {
  const hour = new Date().getHours()
  const isMorning = hour >= 5 && hour < 12
  const isAfternoon = hour >= 12 && hour < 18
  // Removed Evening as per request, merged into Night/Afternoon partition

  const nameSuffix = userName ? `, ${userName}` : ''

  if (isMorning) {
    return {
      title: (lang === 'zh' ? '早上好' : 'Good Morning') + nameSuffix,
      subtitle: lang === 'zh' ? '开启今天的专注旅程吧' : "Let's start fresh today",
      iconClass: 'icon-[solar--sunrise-bold-duotone]',
      emoji: '☀️',
    }
  }
  if (isAfternoon) {
    return {
      title: (lang === 'zh' ? '下午好' : 'Good Afternoon') + nameSuffix,
      subtitle: lang === 'zh' ? '保持节奏，继续推进' : 'Keep the momentum going',
      iconClass: 'icon-[solar--sun-2-bold-duotone]',
      emoji: '🌤️',
    }
  }
  // Night (18:00 - 05:00)
  return {
    title: (lang === 'zh' ? '晚安' : 'Good Night') + nameSuffix,
    subtitle: lang === 'zh' ? '好好休息，明天见' : 'Rest well and recharge',
    iconClass: 'icon-[solar--moon-stars-bold-duotone]',
    emoji: '🌙',
  }
}

export const mergeLayoutWithDefaults = (
  preset: LayoutPreset,
  incoming: GridItem[] | null | undefined
) => {
  const defaults = GRID_PRESETS[preset].layout
  const map = new Map<string, GridItem>()
  defaults.forEach((d) => map.set(d.id, { ...d }))
  if (Array.isArray(incoming)) {
    incoming.forEach((item) => {
      if (!item || !item.id) return
      const target = map.get(item.id)
      if (!target) return
      const defMinW = target.minW
      const defMinH = target.minH
      map.set(item.id, {
        ...target,
        x: Number.isFinite(item.x) ? item.x : target.x,
        y: Number.isFinite(item.y) ? item.y : target.y,
        w: Number.isFinite(item.w) ? item.w : target.w,
        h: Number.isFinite(item.h) ? item.h : target.h,
        // 统一使用最新默认最小值，避免旧缓存把 minH/minW 锁大
        minW: defMinW ?? item.minW ?? target.minW,
        minH: defMinH ?? item.minH ?? target.minH,
      })
    })
  }
  return Array.from(map.values())
}

export const isCollapsedLayout = (items: GridItem[] | null | undefined) => {
  if (!Array.isArray(items) || items.length === 0) return true
  return items.every((i) => (i?.x ?? 0) === 0 && (i?.y ?? 0) === 0)
}

export const isLayoutValid = (preset: LayoutPreset, items: GridItem[] | null | undefined) => {
  if (!Array.isArray(items)) return false
  const defaults = GRID_PRESETS[preset].layout
  const maxCols = GRID_PRESETS[preset].columns
  const maxY = 40 // 防止异常极大位移导致回到原点或全部重叠
  if (items.length !== defaults.length) return false

  const allowedIds = new Set(defaults.map((d) => d.id))
  return items.every((item) => {
    if (!item || !allowedIds.has(item.id)) return false
    const { x, y, w, h } = item
    if (![x, y, w, h].every(Number.isFinite)) return false
    if (x < 0 || y < 0 || w <= 0 || h <= 0) return false
    if (x + w > maxCols) return false
    if (y > maxY) return false
    return true
  })
}

export const cloneLayout = (items: GridItem[]) => items.map((item) => ({ ...item }))

export const getLayoutStorageKey = (preset: LayoutPreset) => `focus-lab-layout-${preset}-v1`

export const normalizeLayout = (
  preset: LayoutPreset,
  layout: GridItem[] | null | undefined,
  options: { fillMissing?: boolean } = {}
) => {
  const fillMissing = options.fillMissing ?? true
  const defaults = GRID_PRESETS[preset].layout
  const safeList = Array.isArray(layout) ? layout : []

  const byId = new Map<string, GridItem>()

  safeList.forEach((item) => {
    if (!item || !item.id) return
    const def = defaults.find((d) => d.id === item.id)
    const normalized: GridItem = {
      ...def,
      ...item,
      x: Number.isFinite(item.x) ? item.x : (def?.x ?? 0),
      y: Number.isFinite(item.y) ? item.y : (def?.y ?? 0),
      w: Number.isFinite(item.w) ? item.w : (def?.w ?? 2),
      h: Number.isFinite(item.h) ? item.h : (def?.h ?? 2),
      minW: item.minW ?? def?.minW ?? 1,
      minH: item.minH ?? def?.minH ?? 1,
    }
    byId.set(item.id, normalized)
  })

  if (fillMissing) {
    defaults.forEach((def) => {
      if (!byId.has(def.id)) {
        byId.set(def.id, { ...def })
      }
    })
  }

  return Array.from(byId.values())
}
