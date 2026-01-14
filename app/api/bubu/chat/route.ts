import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { ProxyAgent, setGlobalDispatcher } from 'undici'

// Configure proxy if available
const proxyUrl = process.env.HTTP_PROXY

if (proxyUrl) {
  try {
    const dispatcher = new ProxyAgent(proxyUrl)
    setGlobalDispatcher(dispatcher)
    console.log(`[BuBu API] Proxy configured: ${proxyUrl}`)
  } catch (error) {
    console.error('[BuBu API] Failed to configure proxy:', error)
  }
}

// Constants
const HISTORY_LIMIT = 10 // Keep last 10 rounds (20 messages)
const DAILY_LIMIT_FREE = 20 // Free users: 20 conversations per day
const DAILY_LIMIT_PRO = 200 // Pro users: 200 conversations per day

// Personality prompts
const PERSONALITY_PROMPTS = {
  gentle: `你是温柔陪伴型的 BuBu：
- 语气温暖、耐心、包容
- 多用"~"、"呢"、"哦"等柔和语气词
- 使用心形 emoji 💙💚🌸
- 回复简洁温柔
示例："辛苦啦~ 💙 休息一下吧，你已经很努力了。"`,

  energetic: `你是活力伙伴型的 BuBu：
- 语气积极、元气、鼓励
- 多用感叹号和积极词汇（加油、冲冲冲、你可以的）
- 使用活泼 emoji ✨💪🎉🔥
- 简短有力
示例："收到！我帮你加到任务列表，咱们一起搞定它！🔥"`,

  professional: `你是专业助手型的 BuBu：
- 语气高效、专注、简洁
- 少用 emoji（只在必要时用 ✓ ✗）
- 陈述句为主，语气平和
- 信息密度高
示例："已识别任务：'写报告'。确认添加到任务列表？"`,
}

// Base system prompt
const getBasePrompt = (language: string) => {
  if (language === 'zh') {
    return `你是 BuBu，Focus Lab 的 AI 助手。你的职责是：
1. 陪伴用户，给予情感支持
2. 从对话中识别并提取任务
3. 记录用户的想法和灵感

重要规则：
- 用户说的是具体要做的事（今天、明天、要做）→ 调用 add_tasks
- 用户表达的是想法、灵感、未来计划 → 调用 add_idea  
- 用户纯粹倾诉情绪、闲聊 → 调用 chat_only

你必须用中文回复。`
  }

  return `You are BuBu, the AI assistant for Focus Lab. Your responsibilities are:
1. Accompany users and provide emotional support
2. Identify and extract tasks from conversations
3. Record users' ideas and inspirations

Important rules:
- If the user mentions specific things to do (today, tomorrow, need to do) → call add_tasks
- If the user expresses ideas, inspirations, or future plans → call add_idea
- If the user is purely venting emotions or chatting → call chat_only

You must reply in English.`
}

// Build complete system prompt
function buildSystemPrompt(personality: string, language: string): string {
  const basePrompt = getBasePrompt(language)
  const personalityPrompt = PERSONALITY_PROMPTS[personality as keyof typeof PERSONALITY_PROMPTS]

  return `${basePrompt}

${personalityPrompt}

当前语言：${language === 'zh' ? '中文' : 'English'}`
}

// Function declarations for Gemini
const BUBU_FUNCTIONS = [
  {
    name: 'chat_only',
    description: '纯聊天，不执行任何操作。用于情绪倾诉、闲聊、打招呼等',
    parameters: {
      type: 'object',
      properties: {
        reply: {
          type: 'string',
          description: 'BuBu 的回复内容',
        },
      },
      required: ['reply'],
    },
  },
  {
    name: 'add_tasks',
    description: '从用户消息中提取具体任务，添加到任务列表（Focus Station）',
    parameters: {
      type: 'object',
      properties: {
        tasks: {
          type: 'array',
          items: { type: 'string' },
          description: '提取的任务列表，每个任务是清晰的动作',
        },
        reply: {
          type: 'string',
          description: 'BuBu 对提取任务的确认性回复',
        },
      },
      required: ['tasks', 'reply'],
    },
  },
  {
    name: 'add_idea',
    description: '识别用户的想法、灵感、待思考的事，保存到 Brain Dump',
    parameters: {
      type: 'object',
      properties: {
        idea: {
          type: 'string',
          description: '提取的想法或灵感',
        },
        reply: {
          type: 'string',
          description: 'BuBu 的回复',
        },
      },
      required: ['idea', 'reply'],
    },
  },
]

// Types
type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type RequestBody = {
  message: string
  history?: ChatMessage[]
  personality?: 'gentle' | 'energetic' | 'professional'
  language?: 'zh' | 'en'
  userId?: string
  isPro?: boolean
}

// Simple in-memory rate limiting (TODO: use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(clientId: string, isPro: boolean): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const limit = isPro ? DAILY_LIMIT_PRO : DAILY_LIMIT_FREE

  const record = rateLimitMap.get(clientId)

  // Reset if it's a new day
  if (!record || now > record.resetAt) {
    const tomorrow = new Date()
    tomorrow.setHours(24, 0, 0, 0)
    rateLimitMap.set(clientId, { count: 0, resetAt: tomorrow.getTime() })
    return { allowed: true, remaining: limit }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: limit - record.count }
}

function incrementRateLimit(clientId: string) {
  const record = rateLimitMap.get(clientId)
  if (record) {
    record.count += 1
  }
}

// Main API handler
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody
    const {
      message,
      history = [],
      personality = 'gentle',
      language = 'zh',
      userId,
      isPro = false,
    } = body

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
    }

    // Rate limiting
    const clientId = userId || request.headers.get('x-forwarded-for') || 'anonymous'
    const rateLimit = checkRateLimit(clientId, isPro)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: language === 'zh' ? '今日对话次数已达上限，请明天再试' : 'Daily limit reached',
        },
        { status: 429 }
      )
    }

    // Check API key
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      console.error('[BuBu API] GOOGLE_API_KEY is not configured')
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 })
    }

    // Trim conversation history (keep last 10 rounds = 20 messages)
    const trimmedHistory = history.slice(-HISTORY_LIMIT * 2)

    // Build system prompt
    const systemPrompt = buildSystemPrompt(personality, language)

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)

    // Try gemini-2.0-flash-exp first, fallback to gemini-1.5-flash
    const modelCandidates = ['gemini-2.0-flash-exp', 'gemini-1.5-flash']
    let result

    for (const modelName of modelCandidates) {
      try {
        console.log(`[BuBu API] Attempting with model: ${modelName}`)

        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        })

        // Build chat history for Gemini
        const chatHistory = trimmedHistory.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }))

        // Start chat with function calling
        const chat = model.startChat({
          history: chatHistory,
          systemInstruction: systemPrompt,
          tools: [{ functionDeclarations: BUBU_FUNCTIONS }],
        })

        result = await chat.sendMessage(message)
        console.log(`[BuBu API] Success with model: ${modelName}`)
        break
      } catch (error) {
        console.error(`[BuBu API] Model ${modelName} failed:`, error)
        // Continue to next model
      }
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'All models failed to respond' },
        { status: 502 }
      )
    }

    const response = result.response

    // Parse function call
    const functionCall = response.functionCalls()?.[0]

    if (!functionCall) {
      // Fallback: return direct text response
      const text = response.text()
      incrementRateLimit(clientId)

      return NextResponse.json({
        success: true,
        data: {
          reply: text,
          remaining: rateLimit.remaining - 1,
        },
      })
    }

    const { name, args } = functionCall

    // Handle different function calls
    if (name === 'chat_only') {
      incrementRateLimit(clientId)
      return NextResponse.json({
        success: true,
        data: {
          reply: args.reply,
          remaining: rateLimit.remaining - 1,
        },
      })
    }

    if (name === 'add_tasks') {
      incrementRateLimit(clientId)
      return NextResponse.json({
        success: true,
        data: {
          reply: args.reply,
          action: {
            type: 'add_tasks',
            payload: args.tasks,
          },
          remaining: rateLimit.remaining - 1,
        },
      })
    }

    if (name === 'add_idea') {
      incrementRateLimit(clientId)
      return NextResponse.json({
        success: true,
        data: {
          reply: args.reply,
          action: {
            type: 'add_idea',
            payload: args.idea,
          },
          remaining: rateLimit.remaining - 1,
        },
      })
    }

    // Unknown function
    incrementRateLimit(clientId)
    return NextResponse.json({
      success: true,
      data: {
        reply: args.reply || response.text(),
        remaining: rateLimit.remaining - 1,
      },
    })
  } catch (error) {
    console.error('[BuBu API] Unexpected error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { success: false, error: `Failed to process: ${errorMessage}` },
      { status: 500 }
    )
  }
}
