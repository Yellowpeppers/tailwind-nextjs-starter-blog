import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'
import { isEqual } from 'lodash'
import {
  BrainDumpItem,
  readBrainDumpStorage,
  fetchCloudBrainDump,
  saveBrainDump,
  createBrainDumpItem,
} from '../brainDumpStorage'

export const useBrainDump = () => {
  const { language: lang } = useTranslation()
  const { user } = useAuth()

  // State
  const [leftItems, setLeftItems] = useState<BrainDumpItem[]>([])
  const [rightItems, setRightItems] = useState<BrainDumpItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Refs
  const dataOwnerId = useRef<string | undefined>(undefined)
  const remoteUpdateRef = useRef(false)

  // -- Init --
  useEffect(() => {
    const init = async () => {
      // 1. Try Cloud First if User
      if (user) {
        const cloud = await fetchCloudBrainDump(user)
        if (cloud && (cloud.left.length > 0 || cloud.right.length > 0)) {
          setLeftItems(cloud.left)
          setRightItems(cloud.right)
          setIsLoaded(true)
          dataOwnerId.current = user.id
          return
        }
      }

      // 2. Fallback to Local (Only if Guest)
      if (!user) {
        const local = readBrainDumpStorage()
        if (local.left.length > 0 || local.right.length > 0) {
          const generateUUID = () => {
            if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              const r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8
              return v.toString(16)
            })
          }

          const sanitize = (list: BrainDumpItem[]) =>
            list.map((item) => {
              const isValidUUID =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)
              return isValidUUID ? item : { ...item, id: generateUUID() }
            })

          setLeftItems(sanitize(local.left))
          setRightItems(sanitize(local.right))
        }
      }

      dataOwnerId.current = user?.id
      setIsLoaded(true)
    }

    init()
  }, [user])

  // -- Persistence --
  useEffect(() => {
    if (!isLoaded) return

    if (user?.id !== dataOwnerId.current) {
      if (!user && dataOwnerId.current === undefined) {
        // OK
      } else {
        return // Mismatch
      }
    }

    if (remoteUpdateRef.current) {
      remoteUpdateRef.current = false
      return
    }

    const save = async () => {
      await saveBrainDump({ left: leftItems, right: rightItems }, user)
    }
    const timeout = setTimeout(save, 1000)
    return () => clearTimeout(timeout)
  }, [leftItems, rightItems, user, isLoaded])

  // -- Broadcast Channel --
  useEffect(() => {
    if (!isLoaded) return
    if (typeof BroadcastChannel === 'undefined') return

    const channel = new BroadcastChannel('focus-lab-brain-dump-channel')

    const handleMessage = async () => {
      try {
        const updatedData = readBrainDumpStorage(user?.id)

        if (isEqual(updatedData.left, leftItems) && isEqual(updatedData.right, rightItems)) {
          return
        }

        remoteUpdateRef.current = true
        setLeftItems(updatedData.left)
        setRightItems(updatedData.right)
      } catch (error) {
        console.error('[Brain Dump] Failed to reload data:', error)
      }
    }

    channel.addEventListener('message', handleMessage)
    return () => {
      channel.removeEventListener('message', handleMessage)
      channel.close()
    }
  }, [user, leftItems, rightItems, isLoaded])

  // -- Actions --

  const addItem = useCallback(
    (text: string, image?: string | null) => {
      const newItem = createBrainDumpItem(text, image || undefined)
      if (leftItems.length <= rightItems.length) {
        setLeftItems((prev) => [newItem, ...prev])
      } else {
        setRightItems((prev) => [newItem, ...prev])
      }
    },
    [leftItems.length, rightItems.length]
  )

  const clearAll = useCallback(() => {
    if (
      window.confirm(
        lang === 'en' ? 'Clear all notes? This cannot be undone.' : '清空所有便签？此操作无法撤销。'
      )
    ) {
      setLeftItems([])
      setRightItems([])
    }
  }, [lang])

  const deleteItem = useCallback((id: string, column: 'left' | 'right') => {
    if (column === 'left') {
      setLeftItems((prev) => prev.filter((i) => i.id !== id))
    } else {
      setRightItems((prev) => prev.filter((i) => i.id !== id))
    }
  }, [])

  const updateItemText = useCallback((id: string, text: string, column: 'left' | 'right') => {
    const setter = column === 'left' ? setLeftItems : setRightItems
    setter((prev) => prev.map((i) => (i.id === id ? { ...i, text: text.trim() } : i)))
  }, [])

  const handlePasteImage = useCallback(
    async (blob: File) => {
      const supabase = createClient()

      if (user) {
        try {
          const fileExt = blob.type.split('/')[1] || 'png'
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from('brain-dump')
            .upload(fileName, blob, { upsert: true, contentType: blob.type })

          if (!uploadError) {
            const { data } = supabase.storage.from('brain-dump').getPublicUrl(fileName)
            return data.publicUrl
          }
        } catch (e) {
          console.error('Upload failed', e)
        }
      } else {
        // Guest: Convert to Base64
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
      }
      return null
    },
    [user]
  )

  return {
    state: {
      leftItems,
      rightItems,
      isLoaded,
    },
    actions: {
      setLeftItems,
      setRightItems,
      addItem,
      clearAll,
      deleteItem,
      updateItemText,
      handlePasteImage,
    },
  }
}

export type UseBrainDumpResult = ReturnType<typeof useBrainDump>
