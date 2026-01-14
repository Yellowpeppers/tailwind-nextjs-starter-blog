import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import type { ChatMessage, PersonalityType, BuBuApiResponse } from './types'

export const useBuBuChat = () => {
  const { language } = useTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          }),
        })

        const data: BuBuApiResponse = await response.json()

        if (!data.success) {
          throw new Error(data.error)
        }

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.data.reply,
          timestamp: Date.now(),
          action: data.data.action
            ? {
                ...data.data.action,
                status: 'pending',
              }
            : undefined,
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (err) {
        setError(err instanceof Error ? err.message : '发送失败，请重试')
      } finally {
        setIsLoading(false)
      }
    },
    [messages, personality, language]
  )

  // Confirm action (add tasks or idea)
  const confirmAction = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.action
          ? { ...msg, action: { ...msg.action, status: 'confirmed' } }
          : msg
      )
    )
  }, [])

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
