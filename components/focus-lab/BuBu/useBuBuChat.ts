import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase'
import {
  createFocusItem,
  saveStationItems,
  readStationStorage,
} from '@/components/focus-lab/focusStationStorage'
import {
  createBrainDumpItem,
  saveBrainDump,
  readBrainDumpStorage,
} from '@/components/focus-lab/brainDumpStorage'
import type { ChatMessage, PersonalityType, BuBuApiResponse, BuBuAction } from './types'

export const useBuBuChat = () => {
  const { language } = useTranslation()
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient() // Initialize Supabase client

  // Load personality from localStorage
  const [personality, setPersonalityState] = useState<PersonalityType>(() => {
    if (typeof window === 'undefined') return 'gentle'
    const saved = localStorage.getItem('bubu-personality')
    return (saved as PersonalityType) || 'gentle'
  })

  // Save personality to localStorage when changed
  const setPersonality = useCallback((newPersonality: PersonalityType) => {
    setPersonalityState(newPersonality)
    if (typeof window !== 'undefined') {
      localStorage.setItem('bubu-personality', newPersonality)
    }
  }, [])

  // Load messages from Supabase on mount
  useEffect(() => {
    if (!user) return

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('bubu_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }) // Get latest first
          .limit(20) // Limit to last 20 messages (10 interactions)

        if (error) throw error

        if (data) {
          // Reverse back to chronological order for display
          const history = data.reverse().map((msg) => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(msg.created_at).getTime(),
            action: msg.action,
          }))
          setMessages(history)
        }
      } catch (err) {
        console.error('Failed to load chat history:', err)
        // Ensure error doesn't break the UI, just log it
      }
    }

    loadMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Save message to Supabase
  const saveMessageToCloud = useCallback(
    async (role: 'user' | 'assistant', content: string, action?: BuBuAction) => {
      if (!user) return

      try {
        await supabase.from('bubu_messages').insert({
          user_id: user.id,
          role,
          content,
          action,
        })
      } catch (err) {
        console.error('Failed to save message to cloud:', err)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  )

  // Send message to BuBu API
  const sendMessage = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setError(null)

      // Save user message to cloud (fire and forget)
      saveMessageToCloud('user', text)

      try {
        const response = await fetch('/api/bubu/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: messages.slice(-20).map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            personality,
            language,
            // Add Context Awareness
            context: await (async () => {
              const tasks = await readStationStorage(user?.id)
              const ideas = await readBrainDumpStorage(user?.id)
              console.log('[useBuBuChat] Context loaded:', { taskCount: tasks.length, ideas })
              return { tasks, ideas }
            })(),
          }),
        })
        console.log('[useBuBuChat] Sending message with personality:', personality)

        const data: BuBuApiResponse = await response.json()

        if (!data.success) {
          throw new Error(data.error)
        }

        // Ensure reply is a string (API might return object in some edge cases)
        const replyContent =
          typeof data.data.reply === 'string' ? data.data.reply : JSON.stringify(data.data.reply)

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: replyContent,
          timestamp: Date.now(),
          action: data.data.action
            ? {
                ...data.data.action,
                status: 'pending',
              }
            : undefined,
        }

        setMessages((prev) => [...prev, assistantMessage])

        // Save assistant message to cloud
        saveMessageToCloud('assistant', data.data.reply, data.data.action)
      } catch (err) {
        setError(err instanceof Error ? err.message : '发送失败，请重试')
      } finally {
        setIsLoading(false)
      }
    },

    [messages, personality, language, saveMessageToCloud, user?.id]
  )

  // Confirm action (add tasks or idea) - WITH ACTUAL INTEGRATION
  const confirmAction = useCallback(
    async (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId)
      if (!message || !message.action) return

      try {
        if (message.action.type === 'add_tasks') {
          // Add tasks to Focus Station
          const tasks = message.action.payload as string[]
          const currentItems = await readStationStorage(user?.id)

          // Create new focus items
          const newItems = tasks.map((task) => createFocusItem('text', task))
          const updatedItems = [...currentItems, ...newItems]

          // Save to storage
          await saveStationItems(updatedItems, user)

          // Trigger sync event for FocusStation component
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('focus-station-sync'))
          }

          console.log(`[BuBu] Added ${tasks.length} tasks to Focus Station`)
        } else if (message.action.type === 'add_idea') {
          // Add idea to Brain Dump (left column)
          const idea = message.action.payload as string
          const currentState = await readBrainDumpStorage(user?.id)

          // Create new item and add to left column
          const newItem = createBrainDumpItem(idea)
          const updatedState = {
            left: [newItem, ...currentState.left],
            right: currentState.right,
          }

          // Save to storage
          await saveBrainDump(updatedState, user)

          // Trigger sync event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('brain-dump-sync'))
          }

          console.log('[BuBu] Added idea to Brain Dump')
        } else if (message.action.type === 'complete_task') {
          // Mark tasks as completed (supports array)
          const tasksToComplete = message.action.payload as string[]
          const currentItems = await readStationStorage(user?.id)

          // Find and mark the tasks as completed
          const updatedItems = currentItems.map((item) =>
            tasksToComplete.includes(item.content) ? { ...item, completed: true } : item
          )

          // Save to storage
          await saveStationItems(updatedItems, user)

          // Trigger sync event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('focus-station-sync'))
          }

          console.log(`[BuBu] Marked ${tasksToComplete.length} task(s) as completed`)
        } else if (message.action.type === 'delete_task') {
          // Delete tasks from list (supports array)
          const tasksToDelete = message.action.payload as string[]
          const currentItems = await readStationStorage(user?.id)

          // Filter out the tasks
          const updatedItems = currentItems.filter((item) => !tasksToDelete.includes(item.content))

          // Save to storage
          await saveStationItems(updatedItems, user)

          // Trigger sync event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('focus-station-sync'))
          }

          console.log(`[BuBu] Deleted ${tasksToDelete.length} task(s)`)
        }

        // Update message status to confirmed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId && msg.action
              ? { ...msg, action: { ...msg.action, status: 'confirmed' } }
              : msg
          )
        )
      } catch (error) {
        console.error('[BuBu] Failed to save:', error)
        setError('保存失败，请重试')
      }
    },
    [messages, user]
  )

  // Cancel action
  const cancelAction = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.action
          ? { ...msg, action: { ...msg.action, status: 'cancelled' } }
          : msg
      )
    )
  }, [])

  // Remove individual task from preview
  const removeTaskFromPreview = useCallback((messageId: string, taskIndex: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.action?.type === 'add_tasks') {
          const tasks = msg.action.payload as string[]
          const newTasks = tasks.filter((_, i) => i !== taskIndex)

          // If no tasks left, cancel the action
          if (newTasks.length === 0) {
            return { ...msg, action: { ...msg.action, status: 'cancelled' } }
          }

          return {
            ...msg,
            action: {
              ...msg.action,
              payload: newTasks,
            },
          }
        }
        return msg
      })
    )
  }, [])

  // Clear conversation history
  const clearHistory = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  // Retry last message
  const retry = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === 'user')
    if (lastUserMessage) {
      // Remove failed assistant message if exists
      setMessages((prev) => {
        const lastUserIndex = prev.findLastIndex((msg) => msg.id === lastUserMessage.id)
        return prev.slice(0, lastUserIndex + 1)
      })
      sendMessage(lastUserMessage.content)
    }
  }, [messages, sendMessage])

  return {
    messages,
    isLoading,
    error,
    personality,
    setPersonality,
    sendMessage,
    confirmAction,
    cancelAction,
    removeTaskFromPreview,
    clearHistory,
    retry,
  }
}
