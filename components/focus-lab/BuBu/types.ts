// BuBu Chat Types

export type PersonalityType = 'gentle' | 'energetic' | 'professional'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  action?: {
    type:
      | 'add_tasks'
      | 'add_idea'
      | 'complete_task'
      | 'delete_task'
      | 'uncomplete_task'
      | 'delete_idea'
      | 'update_task'
      | 'update_idea'
      | 'start_pomodoro'
      | 'control_ambience'
    payload:
      | string[]
      | string
      | { oldContent: string; newContent: string }
      | { duration?: number; mode?: string }
      | { action: string; sound?: string; volume?: number }
    status: 'pending' | 'confirmed' | 'cancelled'
  }
}

export type BuBuAction = {
  type:
    | 'add_tasks'
    | 'add_idea'
    | 'complete_task'
    | 'delete_task'
    | 'uncomplete_task'
    | 'delete_idea'
    | 'update_task'
    | 'update_idea'
    | 'start_pomodoro'
    | 'control_ambience'
  payload:
    | string[]
    | string
    | { oldContent: string; newContent: string }
    | { duration?: number; mode?: string }
    | { action: string; sound?: string; volume?: number }
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
