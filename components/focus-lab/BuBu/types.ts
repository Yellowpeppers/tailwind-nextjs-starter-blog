// BuBu Chat Types

export type PersonalityType = 'gentle' | 'energetic' | 'professional'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  action?: {
    type: 'add_tasks' | 'add_idea' | 'complete_task' | 'delete_task' | 'uncomplete_task'
    payload: string[] | string
    status: 'pending' | 'confirmed' | 'cancelled'
  }
}

export type BuBuAction = {
  type: 'add_tasks' | 'add_idea' | 'complete_task' | 'delete_task' | 'uncomplete_task'
  payload: string[] | string
}

export type BuBuApiRequest = {
  message: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
  personality?: PersonalityType
  language?: 'zh' | 'en'
  userId?: string
  isPro?: boolean
}

export type BuBuApiResponse =
  | {
      success: true
      data: {
        reply: string
        action?: BuBuAction
        remaining: number
      }
    }
  | {
      success: false
      error: string
    }
