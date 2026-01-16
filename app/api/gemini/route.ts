import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { ProxyAgent, setGlobalDispatcher } from 'undici'

// Configure proxy if available
const proxyUrl = process.env.HTTP_PROXY

if (proxyUrl) {
  try {
    const dispatcher = new ProxyAgent(proxyUrl)
    setGlobalDispatcher(dispatcher)
    console.log(`[Gemini API] Proxy configured: ${proxyUrl}`)
  } catch (error) {
    console.error('[Gemini API] Failed to configure proxy:', error)
  }
}

// Rate limiting constants
const DAILY_LIMIT_FREE = 3
const DAILY_LIMIT_PRO = -1 // -1 means unlimited

// Simple in-memory rate limiting
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { task, userId, language = 'zh', isPro = false } = body

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 })
    }

    // Check if user is logged in - Guest users cannot use AI Task Breaker
    if (!userId) {
      return NextResponse.json(
        {
          error:
            language === 'zh'
              ? '请先登录后使用 AI 任务拆解'
              : 'Please login to use AI Task Breaker',
        },
        { status: 401 }
      )
    }

    // Rate limiting
    const rateLimit = checkRateLimit(userId, isPro)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            language === 'zh'
              ? `今日使用次数已达上限 (Pro: ${DAILY_LIMIT_PRO}次/天)`
              : `Daily limit reached (Pro: ${DAILY_LIMIT_PRO}/day)`,
        },
        { status: 429 }
      )
    }

    // Increment ONLY after successful generation? Or before?
    // Usually before or here to prevent abuse.
    incrementRateLimit(userId)

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      console.error('[Gemini API] API Key missing')
      return NextResponse.json({ error: 'GOOGLE_API_KEY is not configured' }, { status: 500 })
    }

    // Debug log (safe version)
    console.log(
      `[Gemini API] Using API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
    )

    const genAI = new GoogleGenerativeAI(apiKey)

    const prompt = `
      You are an expert productivity coach specializing in ADHD-friendly task breakdown.
      Break down the following task into 3-6 very small, actionable, and non-intimidating steps.
      The steps should be easy to start.
      CRITICAL: Keep each step extremely short (max 10 words). No explanations, just the action.
      CRITICAL: You MUST reply in the SAME LANGUAGE as the task input. If the task is in Chinese, reply in Chinese.
      CRITICAL: Do NOT end steps with punctuation like periods or full stops.
      Return ONLY a JSON array of strings. Do not include markdown formatting or "json" code blocks.

      Task: "${task}"
    `

    const modelCandidates = ['gemini-2.5-flash', 'gemini-1.5-flash']
    const attemptErrors: { model: string; message: string; code?: string }[] = []

    const runModel = async (modelName: string) => {
      console.log(`[Gemini API] Attempting with model: ${modelName}`)
      const model = genAI.getGenerativeModel({ model: modelName })
      return model.generateContent(prompt)
    }

    let result
    for (const modelName of modelCandidates) {
      try {
        result = await runModel(modelName)
        break
      } catch (error) {
        const err = error as Error & { cause?: { code?: string } }
        const message = err?.message || 'Unknown error'
        attemptErrors.push({ model: modelName, message, code: err?.cause?.code })
        console.error(`[Gemini API] Model ${modelName} failed:`, message, err?.cause || '')
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to generate steps', detail: attemptErrors },
        { status: 502 }
      )
    }

    const response = await result.response
    const text = response.text()

    // Clean up potential markdown code blocks if the model ignores instructions
    const cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let steps: string[]
    try {
      steps = JSON.parse(cleanedText)
    } catch (e) {
      // Fallback if JSON parsing fails
      steps = cleanedText
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^[-\d.]+\s*/, ''))
    }

    return NextResponse.json({ steps })
  } catch (error) {
    console.error('[Gemini API] Error:', error)

    // Return detailed error message for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Failed to generate steps: ${errorMessage}` },
      { status: 500 }
    )
  }
}
