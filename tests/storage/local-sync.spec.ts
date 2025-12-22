import { test, expect } from '@playwright/test'

import {
  createFocusItem,
  readStationStorage,
  saveStationItems,
} from '@/components/focus-lab/focusStationStorage'
import {
  createBrainDumpItem,
  readBrainDumpStorage,
  saveBrainDump,
} from '@/components/focus-lab/brainDumpStorage'
import { readDopamineStorage, saveDopamine } from '@/components/focus-lab/dopamineStorage'
import {
  createToDoItem,
  readToDoStorage,
  writeToDoStorage,
} from '@/components/focus-lab/todoStorage'

type Listener = (event: { type: string; detail?: unknown }) => void

const setupDomMocks = () => {
  const listeners = new Map<string, Listener[]>()
  const storage = new Map<string, string>()

  const mockWindow = {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
    addEventListener: (type: string, listener: Listener) => {
      const list = listeners.get(type) ?? []
      list.push(listener)
      listeners.set(type, list)
    },
    removeEventListener: (type: string, listener: Listener) => {
      const list = listeners.get(type) ?? []
      listeners.set(
        type,
        list.filter((l) => l !== listener)
      )
    },
    dispatchEvent: (event: { type: string; detail?: unknown }) => {
      const list = listeners.get(event.type) ?? []
      list.forEach((l) => l(event))
    },
  } as unknown as Window

  class MockCustomEvent<T> {
    type: string
    detail?: T
    constructor(type: string, init?: { detail?: T }) {
      this.type = type
      this.detail = init?.detail
    }
  }

  class MockBroadcastChannel {
    name: string
    onmessage: ((event: MessageEvent) => void) | null = null
    messages: unknown[] = []
    constructor(name: string) {
      this.name = name
    }
    postMessage(data: unknown) {
      this.messages.push(data)
      this.onmessage?.({ data } as MessageEvent)
    }
    close() {}
  }

  globalThis.window = mockWindow
  // @ts-expect-error mock
  globalThis.CustomEvent = MockCustomEvent
  // @ts-expect-error mock
  globalThis.BroadcastChannel = MockBroadcastChannel
  // 确保 IndexedDB 缓存逻辑走 fallback 分支
  // @ts-expect-error mock
  globalThis.indexedDB = undefined
}

const resetDomMocks = () => {
  // @ts-expect-error cleanup
  delete globalThis.window
  // @ts-expect-error cleanup
  delete globalThis.CustomEvent
  // @ts-expect-error cleanup
  delete globalThis.BroadcastChannel
  // @ts-expect-error cleanup
  delete globalThis.indexedDB
}

test.describe('数据层本地缓存', () => {
  test.beforeEach(() => {
    setupDomMocks()
  })

  test.afterEach(() => {
    resetDomMocks()
  })

  test('Focus Station 本地读写与事件分发', async () => {
    const item = createFocusItem('text', 'demo')
    await saveStationItems([item])
    const restored = readStationStorage()
    expect(restored[0]?.content).toBe('demo')
    expect(restored[0]?.completed).toBe(false)
    expect(globalThis.window?.localStorage.getItem('focus-lab-station-items')).toContain('demo')
  })

  test('Brain Dump 本地读写与左右列回填', async () => {
    const left = [createBrainDumpItem('L1')]
    const right = [createBrainDumpItem('R1')]
    await saveBrainDump({ left, right })
    const restored = readBrainDumpStorage()
    expect(restored.left[0]?.text).toBe('L1')
    expect(restored.right[0]?.text).toBe('R1')
    expect(globalThis.window?.localStorage.getItem('focus-lab-brain-dump')).toContain('L1')
  })

  test('Dopamine 列表本地读写', async () => {
    await saveDopamine(['a', 'b'], 'en')
    const restored = readDopamineStorage('en')
    expect(restored).toEqual(['a', 'b'])
  })

  test('ToDo 本地读写与事件', async () => {
    const task = createToDoItem('todo-1')
    const events: unknown[] = []
    globalThis.window?.addEventListener('focus-lab-todo-updated', (e) => events.push(e.detail))
    await writeToDoStorage([task])
    const restored = readToDoStorage()
    expect(restored[0]?.text).toBe('todo-1')
    expect(events[0]).toEqual([task])
  })
})
