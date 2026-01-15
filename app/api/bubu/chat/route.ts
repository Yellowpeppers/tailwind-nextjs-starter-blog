import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
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

// Context types for type safety
interface FocusTask {
  content: string
  completed: boolean
}

interface BrainDumpIdea {
  content: string
}

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
4. 帮用户管理任务状态

重要规则 - 意图识别：
- 用户**询问**"有哪些任务/想法"、"我的待办是什么" → 调用 chat_only，直接告诉用户上下文中的任务/想法列表
- 用户**想添加**新的具体任务（今天、明天、要做某事）→ 调用 add_tasks
- 用户**想记录**新想法、灵感、未来计划 → 调用 add_idea  
- 用户**想修改**任务或想法内容 → 调用 update_task 或 update_idea
- 用户**想完成**任务 → 调用 complete_task
- 用户**想取消完成**任务 → 调用 uncomplete_task
- 用户**想删除**任务 → 调用 delete_task
- 用户纯粹倾诉情绪、闲聊 → 调用 chat_only

⚠️ 重要区分：
- "我有哪些想法" = 查询 → chat_only，直接列出上下文中的想法
- "我有一个想法：xxx" = 添加 → add_idea

🎯 回复措辞规范：
- 调用 add_tasks 时，说"帮你整理了任务"、"识别到XX任务"、"点击下面按钮就能添加"
- 调用 add_idea 时，说"识别到想法"、"确认一下就能保存"
- ❌ 不要说"已经添加"、"已经记录"，因为用户还需要确认

🌍 语言策略：
- **用户用什么语言提问，你就用什么语言回复**`
  }

  return `You are BuBu, the AI assistant for Focus Lab. Your responsibilities are:
1. Accompany users and provide emotional support
2. Identify and extract tasks from conversations
3. Record users' ideas and inspirations

Important rules:
- If the user mentions specific things to do (today, tomorrow, need to do) → call add_tasks
- If the user expresses ideas, inspirations, or future plans → call add_idea
- If the user is purely venting emotions or chatting → call chat_only

🎯 Reply Wording Guidelines (Important):
- When calling add_tasks, say "I've identified tasks" or "Click the button below to add them"
- When calling add_idea, say "I've identified an idea" or "Confirm to save it"
- ❌ Don't say "already added" or "already saved" because the user still needs to confirm

🌍 Language Strategy (Important):
- **Reply in the same language the user uses**
- Example: User speaks Chinese → Reply in Chinese; User speaks English → Reply in English  
- If you cannot determine the language, default to English`
}

// Build complete system prompt
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSystemPrompt(personality: string, language: string, context?: any): string {
  const basePrompt = getBasePrompt(language)
  // Default to 'gentle' if personality key is invalid or missing
  const personalityPrompt =
    PERSONALITY_PROMPTS[personality as keyof typeof PERSONALITY_PROMPTS] ||
    PERSONALITY_PROMPTS.gentle

  let contextPrompt = ''
  if (context) {
    const taskCount = context.tasks?.length || 0
    const ideaCount = (context.ideas?.left?.length || 0) + (context.ideas?.right?.length || 0)

    // Separate pending and completed tasks
    const pendingTasks = context.tasks?.filter((t: FocusTask) => !t.completed) || []
    const completedTasks = context.tasks?.filter((t: FocusTask) => t.completed) || []

    // Format tasks for AI
    const pendingTaskList =
      pendingTasks
        .slice(0, 10)
        .map((t: FocusTask) => `- ${t.content}`)
        .join('\n') || '暂无待办任务'

    const completedTaskList =
      completedTasks
        .slice(0, 10)
        .map((t: FocusTask) => `- ${t.content}`)
        .join('\n') || '暂无'

    // Format ideas for AI
    const ideaList =
      [...(context.ideas?.left || []), ...(context.ideas?.right || [])]
        .slice(0, 5)
        .map((i: BrainDumpIdea) => `- ${i.content}`)
        .join('\n') || '暂无想法'

    console.log('[BuBu API] Context received:', {
      pendingCount: pendingTasks.length,
      completedCount: completedTasks.length,
      ideaCount,
    })

    contextPrompt = `
---
📊 **用户当前状态** (实时数据，必须使用这些信息回答用户):

**📋 未完成的任务 (共 ${pendingTasks.length} 项):**
${pendingTaskList}

**✅ 已完成的任务 (共 ${completedTasks.length} 项):**
${completedTaskList}

**💡 注意力中转站想法 (共 ${ideaCount} 项):**
${ideaList}

*重要指令：*
- 当用户问"有哪些任务"或"我的待办"时，告诉他们"未完成的任务"列表内容！
- 当用户问"已完成"时，告诉他们"已完成的任务"列表！
- 如果用户想标记为"未完成"，调用 uncomplete_task 函数！
`
  }

  return `${basePrompt}

${contextPrompt}

---
🌟 CURRENT PERSONALITY MODE: ${personality || 'gentle'}
Please strictly adhere to the following personality guidelines, ignoring any previous conversation tone if it differs:
${personalityPrompt}`
}

// Function declarations for Gemini
const BUBU_FUNCTIONS = [
  {
    name: 'chat_only',
    description: '纯聊天，不执行任何操作。用于情绪倾诉、闲聊、打招呼等',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        reply: {
          type: SchemaType.STRING,
          description: 'BuBu 的回复内容',
        },
      },
      required: ['reply'],
    },
  },
  {
    name: 'add_tasks',
    description:
      '从用户消息中提取具体任务，生成预览供用户确认。注意：这不会立即添加任务，用户需要点击确认按钮',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        tasks: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: '提取的任务列表，每个任务是清晰的动作',
        },
        reply: {
          type: SchemaType.STRING,
          description:
            'BuBu 的回复。必须告知用户"识别到任务"并提示"点击下面按钮确认添加"，不要说"已经添加"',
        },
      },
      required: ['tasks', 'reply'],
    },
  },
  {
    name: 'add_idea',
    description: '识别用户的想法、灵感、待思考的事，保存到 Brain Dump',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        idea: {
          type: SchemaType.STRING,
          description: '提取的想法或灵感',
        },
        reply: {
          type: SchemaType.STRING,
          description:
            'BuBu 的回复。必须告知用户"识别到想法"并提示"确认一下就能保存"，不要说"已经记录"',
        },
      },
      required: ['idea', 'reply'],
    },
  },
  {
    name: 'delete_idea',
    description: '用户想要删除注意力中转站中的一个或多个想法。根据上下文中的想法列表匹配。',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ideas: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: '要删除的想法内容列表（需要匹配用户想法列表中的内容）',
        },
        reply: {
          type: SchemaType.STRING,
          description: 'BuBu 的回复。确认想法已删除。',
        },
      },
      required: ['ideas', 'reply'],
    },
  },
  {
    name: 'update_task',
    description: '用户想要修改某个任务的内容。需要指定旧任务内容和新内容。',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        oldContent: {
          type: SchemaType.STRING,
          description: '要修改的任务原始内容（精确匹配）',
        },
        newContent: {
          type: SchemaType.STRING,
          description: '修改后的任务新内容',
        },
        reply: {
          type: SchemaType.STRING,
          description: 'BuBu 的回复。确认任务修改意图，如"帮你把【旧】改成【新】好吗？"',
        },
      },
      required: ['oldContent', 'newContent', 'reply'],
    },
  },
  {
    name: 'update_idea',
    description: '用户想要修改某个想法的内容。需要指定旧想法内容和新内容。',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        oldContent: {
          type: SchemaType.STRING,
          description: '要修改的想法原始内容（精确匹配）',
        },
        newContent: {
          type: SchemaType.STRING,
          description: '修改后的想法新内容',
        },
        reply: {
          type: SchemaType.STRING,
          description: 'BuBu 的回复。确认想法修改意图。',
        },
      },
      required: ['oldContent', 'newContent', 'reply'],
    },
  },
  {
    name: 'complete_task',
    description:
      '用户想要标记一个或多个任务为已完成。根据上下文中的任务列表匹配任务。可以同时完成多个任务。',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        tasks: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: '要标记完成的任务内容列表（每个需要精确匹配用户任务列表中的内容）',
        },
        reply: {
          type: SchemaType.STRING,
          description:
            'BuBu 的回复。告知用户任务已完成，可适当鼓励。如果是多个任务，说明完成了几个。',
        },
      },
      required: ['tasks', 'reply'],
    },
  },
  {
    name: 'delete_task',
    description:
      '用户想要删除一个或多个任务。根据上下文中的任务列表匹配任务。可以同时删除多个任务。',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        tasks: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: '要删除的任务内容列表（每个需要精确匹配用户任务列表中的内容）',
        },
        reply: {
          type: SchemaType.STRING,
          description: 'BuBu 的回复。确认任务已删除，如果是多个任务，说明删除了几个。',
        },
      },
      required: ['tasks', 'reply'],
    },
  },
  {
    name: 'uncomplete_task',
    description:
      '用户想要将已完成的任务重新标记为"未完成"状态。当用户说"标记为未完成"、"取消完成"、"重新做"时使用。',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        tasks: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: '要标记为未完成的任务内容列表（需要精确匹配已完成任务列表中的内容）',
        },
        reply: {
          type: SchemaType.STRING,
          description: 'BuBu 的回复。确认任务已重新标记为未完成。',
        },
      },
      required: ['tasks', 'reply'],
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any // Allow context object
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
      context, // Extract context
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
    const systemPrompt = buildSystemPrompt(personality, language, context)

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)

    // Use models that work (same as existing Gemini API)
    const modelCandidates = ['gemini-2.5-flash', 'gemini-1.5-flash']
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
          systemInstruction: {
            role: 'system',
            parts: [{ text: systemPrompt }],
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tools: [{ functionDeclarations: BUBU_FUNCTIONS as any }],
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

    if (name === 'delete_idea') {
      incrementRateLimit(clientId)
      return NextResponse.json({
        success: true,
        data: {
          reply: args.reply,
          action: {
            type: 'delete_idea',
            payload: args.ideas,
          },
          remaining: rateLimit.remaining - 1,
        },
      })
    }

    if (name === 'update_task') {
      incrementRateLimit(clientId)
      return NextResponse.json({
        success: true,
        data: {
          reply: args.reply,
          action: {
            type: 'update_task',
            payload: {
              oldContent: args.oldContent,
              newContent: args.newContent,
            },
          },
          remaining: rateLimit.remaining - 1,
        },
      })
    }

    if (name === 'update_idea') {
      incrementRateLimit(clientId)
      return NextResponse.json({
        success: true,
        data: {
          reply: args.reply,
          action: {
            type: 'update_idea',
            payload: {
              oldContent: args.oldContent,
              newContent: args.newContent,
            },
          },
          remaining: rateLimit.remaining - 1,
        },
      })
    }

    if (name === 'complete_task') {
      incrementRateLimit(clientId)
      return NextResponse.json({
        success: true,
        data: {
          reply: args.reply,
          action: {
            type: 'complete_task',
            payload: args.tasks,
          },
          remaining: rateLimit.remaining - 1,
        },
      })
    }

    if (name === 'delete_task') {
      incrementRateLimit(clientId)
      return NextResponse.json({
        success: true,
        data: {
          reply: args.reply,
          action: {
            type: 'delete_task',
            payload: args.tasks,
          },
          remaining: rateLimit.remaining - 1,
        },
      })
    }

    if (name === 'uncomplete_task') {
      incrementRateLimit(clientId)
      return NextResponse.json({
        success: true,
        data: {
          reply: args.reply,
          action: {
            type: 'uncomplete_task',
            payload: args.tasks,
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
