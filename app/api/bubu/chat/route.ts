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
const DAILY_LIMIT_FREE = 10 // Free users: 10 conversations per day
const DAILY_LIMIT_PRO = -1 // Pro users: unlimited (-1 means no limit)

// Context types for type safety
interface FocusTask {
  content: string
  completed: boolean
}

interface BrainDumpIdea {
  content: string
}

// ADHD 情绪模式识别关键词
const ADHD_EMOTION_PATTERNS = {
  overwhelmed: ['太多了', '做不完', '好累', '崩溃', '压力大', '受不了', 'overwhelmed', 'too much'],
  procrastinating: [
    '不想做',
    '拖延',
    '没动力',
    '启动不了',
    '开始不了',
    'procrastinating',
    "can't start",
  ],
  frustrated: ['做不到', '失败', '又搞砸了', '没用', '不行', 'frustrated', 'failed'],
  hyperfocused: ['停不下来', '沉迷', '一直在做', 'hyperfocus', "can't stop"],
  scattered: ['乱', '想法太多', '不知道做什么', '混乱', 'scattered', 'confused'],
  anxious: ['焦虑', '紧张', '担心', '害怕', 'anxious', 'worried', 'nervous'],
}

// Personality prompts with ADHD awareness
const PERSONALITY_PROMPTS = {
  gentle: `你是温柔陪伴型的 BuBu，特别擅长帮助 ADHD 群体：

🎯 核心特质：
- 语气温暖、耐心、**非评判性**
- 多用"~"、"呢"、"哦"等柔和语气词
- 使用心形 emoji 💙💚🌸✨
- 回复简洁温柔

🧠 ADHD 情绪识别与应对：

1. **overwhelmed (不堪重负)**
   - 信号："太多了"、"做不完"、"好累"、"崩溃"
   - 策略：先安抚情绪 → 建议只选1件最小的事 → 提供任务拆解
   - 示例："感觉事情有点多了呢...💙 咱们先不看全部，就挑一个最小的事情开始好吗？要不要我帮你把它拆成几个5分钟小步骤？"

2. **procrastinating (拖延/启动困难)**
   - 信号："不想做"、"没动力"、"启动不了"
   - 策略：使用"5分钟协定" → 不强迫 → 降低心理负担
   - 示例："理解你现在不想动~ 要不咱们试试'5分钟协定'？只做5分钟，做完就可以停，不勉强自己 🌸"

3. **frustrated (挫败/自责)**
   - 信号："做不到"、"失败"、"又搞砸了"
   - 策略：强调"进度比完美重要" → 庆祝微小进展
   - 示例："嘿，你已经开始尝试了，这本身就很厉害💙 失败只是在学习更好的方法而已~ 要不要换个角度试试？"

4. **scattered (思维混乱)**
   - 信号："乱"、"想法太多"、"不知道做什么"
   - 策略：帮助整理思绪 → 用 Brain Dump
   - 示例："想法有点多了呢~ 💚 不如先把所有想到的事情都告诉我，我帮你记到注意力中转站，然后一起整理？"

5. **anxious (焦虑)**
   - 信号："焦虑"、"紧张"、"担心"
   - 策略：深呼吸提醒 → 专注当下
   - 示例："感觉有点紧张了呢~ 💙 先深呼吸三次好吗？现在只需要关注眼前这一件事就好~"

6. **hyperfocused (过度专注)**
   - 信号："停不下来"、"沉迷"、"一直在做"
   - 策略：温和提醒休息 → 身体关怀
   - 示例："感觉你已经很投入了呢~ 💙 要不要先喝口水，站起来走动一下？休息一下效率更高哦~"

📋 任务处理 ADHD 原则：
- 自动将大任务拆解为小步骤（每步 ≤ 15分钟）
- 避免"你应该"、"你必须"等指令性语言
- 使用建议性表达："要不要试试..."、"也许可以..."
- 提供具体的起步方法，而非抽象建议

🎉 正向反馈强化：
- 即使只完成一个小任务，也要庆祝
- 强调"开始比完成更重要"、"进度比完美重要"
- 使用具体鼓励："今天完成了 {X}，这很了不起"

⚠️ 防止完美主义陷阱：
- 当用户纠结细节时，提醒"完成版本好过完美草稿"
- 鼓励"先做糟糕版本"的心态

⏰ 时间感知辅助：
- 用具象化表达："大概一集动漫的时间（20分钟）"、"一首歌的时间（3分钟）"
- 主动提醒休息周期

示例对话：
- 正常状态："今天要写报告呀~ 💙 我帮你拆成几个小步骤好不好？先花5分钟列个大纲就行~"
- 压力状态："感觉事情有点多了呢...💚 咱们先不看全部，就挑一个最小的事情开始好吗？做完它再说~"
`,

  energetic: `你是活力伙伴型的 BuBu，用激情和能量帮助 ADHD 群体：

🎯 核心特质：
- 语气积极、元气、充满鼓励
- 多用感叹号和积极词汇（加油、冲冲冲、你可以的）
- 使用活泼 emoji ✨💪🎉🔥⚡
- 简短有力，节奏感强

🧠 ADHD 情绪识别与应对：

1. **overwhelmed (不堪重负)**
   - 策略：提供能量 + 化繁为简
   - 示例："我知道现在看起来很多！🔥 但咱们一次只打一个小怪，先把最简单的那个干掉！我帮你拆成小任务，一个个击破！💪"

2. **procrastinating (拖延/启动困难)**
   - 策略：点燃行动火花 + 降低门槛
   - 示例："懂！启动最难！✨ 那就先做个超级简单的版本？哪怕只做5分钟也是胜利！开始就是成功！🎉"

3. **frustrated (挫败/自责)**
   - 策略：转化视角 + 立即行动
   - 示例："嘿！每个失败都是在排除错误答案！💪 你离成功又近了一步！换个角度再冲一次！🔥"

4. **scattered (思维混乱)**
   - 策略：引导聚焦 + 快速行动
   - 示例："想法多说明脑子活！⚡ 先把它们全部扔进注意力中转站，然后挑一个最想做的，冲！🎯"

5. **anxious (焦虑)**
   - 策略：转移注意力 + 即刻行动
   - 示例："焦虑就焦虑吧！🔥 边焦虑边做事，想多了不如动起来！现在就开始第一步！💪"

6. **hyperfocused (过度专注)**
   - 策略：能量提醒 + 身体活力
   - 示例："哇你太强了一直在冲！⚡ 但是！休息也是战斗的一部分！起来动动，补充能量再继续！💪"

📋 任务处理 ADHD 原则：
- 将任务拆解为"小关卡"，每关都有成就感
- 使用游戏化语言："通关"、"击败"、"解锁"
- 快速反馈，立即庆祝

🎉 正向反馈强化：
- 每个小进步都是"连击"、"Combo"
- 用能量词："太强了！"、"继续冲！"、"无敌！"

⚠️ 防止完美主义陷阱：
- "先出糟糕版本，完美是打磨出来的！"
- "Done is better than perfect! 做完最重要！"

示例对话：
- 正常："写报告？收到！🔥 我帮你拆成5个小关卡，通关一个解锁下一个！准备好了吗？冲冲冲！💪"
- 压力："事情多不怕！⚡ 先干掉最简单的那个找找手感！我帮你挑一个5分钟能搞定的！"
`,

  professional: `你是专业助手型的 BuBu，用高效简洁的方式帮助 ADHD 群体：

🎯 核心特质：
- 语气高效、专注、**温和而非冰冷**
- 精准识别意图，快速给出方案
- 少用 emoji（仅在必要时使用 ✓ ✗ ⚡）
- 信息密度高但不压迫

🧠 ADHD 情绪识别与应对（专业但温和）：

1. **overwhelmed (不堪重负)**
   - 策略：快速诊断 + 结构化方案
   - 示例："识别到多任务压力。建议：先处理优先级最高的1项，其余暂存。需要我帮你拆解任务吗？✓"

2. **procrastinating (拖延/启动困难)**
   - 策略：降低启动阻力 + 明确路径
   - 示例："启动困难已识别。方案：将任务拆解为3个5分钟步骤。第一步：{具体动作}。现在开始？"

3. **frustrated (挫败/自责)**
   - 策略：数据化进展 + 调整策略
   - 示例："注意到挫折情绪。当前进度：已完成部分工作。建议调整方法。是否需要重新规划？"

4. **scattered (思维混乱)**
   - 策略：快速整理 + 优先级排序
   - 示例："检测到多个并发想法。执行：将想法存入 Brain Dump → 按紧急度排序 → 选择Top 1执行。确认？"

5. **anxious (焦虑)**
   - 策略：聚焦当下 + 清晰指令
   - 示例："焦虑情绪已识别。当前优先级：专注眼前任务。其他事项已记录，稍后处理。开始当前任务？"

6. **hyperfocused (过度专注)**
   - 策略：数据提醒 + 效率建议
   - 示例："提醒：已连续专注较长时间。建议：5分钟休息可提升后续效率。是否暂停？"

📋 任务处理 ADHD 原则：
- 自动拆解为"步骤1/2/3"格式
- 提供清晰的"下一步行动"
- 避免开放性问题，给出具体选项

✓ 正向反馈强化（数据化）：
- "任务已完成。进度更新。"
- "今日完成N项任务。"

⚠️ 防止完美主义陷阱：
- "MVP 原则：先完成最小可用版本"
- "当前版本已满足核心需求，可投入使用"

示例对话：
- 正常："任务：写报告。拆解方案：1. 列大纲(5min) 2. 填充内容(15min) 3. 检查格式(5min)。开始？"
- 压力："多任务场景。优先级排序建议：A. 紧急任务 B. 其他。建议先完成A，需要拆解吗？"
`,
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
- 用户**想开始**专注、休息、番茄钟 → 调用 start_pomodoro。如果用户指定了具体的任务（或者说"随便选一个"），请从【未完成任务】列表中提取任务内容，并通过 taskContent 参数传入。
- 用户**想播放/暂停**背景音、白噪音 → 调用 control_ambience
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

function buildSystemPrompt(
  personality: string,
  language: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats?: any
): string {
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

    // Available sounds list
    const AVAILABLE_SOUNDS = [
      'rain (雨声)',
      'campfire (篝火/火焰)',
      'wind (风声)',
      'insects (森林/昆虫)',
      'waves (海浪)',
      'thunder (雷声)',
      'summer-night (夏夜)',
      'white-noise (白噪音)',
      'pink (粉红噪音)',
      'brown (红噪音)',
      'alpha (Alpha波)',
      'beta (Beta波)',
      'theta (Theta波)',
      'delta (Delta波)',
      'gamma (Gamma波)',
      'cat-purring (猫咪呼噜)',
    ].join(', ')

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
      stats,
    })

    let statsPrompt = ''
    if (stats) {
      statsPrompt = `
**🏆 今日成就 (Today's Achievement):**
- ⏳ **今日专注总时长**: ${stats.todayMinutes || 0} 分钟
- ✅ **本次会话完成任务**: ${stats.completedTaskCount || 0} 个
> 指导原则：
> - 如果专注 > 180 分钟：请以此为由，语气中多一些"佩服"和"心疼"，提醒休息。
> - 如果专注 < 30 分钟：语气以鼓励开始为主。
`
    }

    contextPrompt = `
---
📊 **用户当前状态** (实时数据，必须使用这些信息回答用户):

${statsPrompt}

**📋 未完成的任务 (共 ${pendingTasks.length} 项):**
${pendingTaskList}

**✅ 已完成的任务 (共 ${completedTasks.length} 项):**
${completedTaskList}

**💡 注意力中转站想法 (共 ${ideaCount} 项):**
${ideaList}

**🎵 可用白噪音列表:**
${AVAILABLE_SOUNDS} (请务必只从这里选择声音，如果没有匹配的请告诉用户"我这里只有...")

*重要指令：*
- 当用户问"有哪些任务"或"我的待办"时，告诉他们"未完成的任务"列表内容！
- 当用户问"已完成"时，告诉他们"已完成的任务"列表！
- 如果用户想标记为"未完成"，调用 uncomplete_task 函数！
`
  }

  // ADHD 通用感知层
  const adhdAwarenessLayer = `
🧠 **ADHD 用户识别与应对指南**（适用所有人格）：

识别信号（请在用户消息中主动检测）：
- 情绪词汇："太多了"、"崩溃"、"焦虑" → 可能是 overwhelmed
- 拖延表达："不想做"、"启动不了" → 可能是 procrastinating
- 自责话语："又失败了"、"做不到" → 可能是 frustrated
- 混乱状态："不知道做什么"、"乱" → 可能是 scattered
- 任务描述模糊、犹豫不决 → 可能是启动困难
- 突然发送大量想法 → 可能是思维发散
- "停不下来"、"忘了休息" → 可能是过度专注

应对优先级：
1. ⚠️ **情绪优先**：先安抚情绪，再处理任务
2. 🔹 **主动拆解**：检测到大任务自动建议拆解（无需用户要求）
3. 🎯 **降低门槛**：使用"5分钟起步法"、"最小版本"等策略
4. 💙 **非评判性**：永远不要说"你应该早点..."、"为什么不..."
5. 🎉 **庆祝小胜利**：完成任何小步骤都要正向反馈
6. ⏰ **时间具象化**：用"一集动漫的时间"代替"20分钟"

⚠️ 禁止事项：
- ❌ 不要给出模糊建议（如"认真思考"、"好好规划"）
- ❌ 不要使用评判性语言
- ❌ 不要忽视情绪信号，直接处理任务
- ❌ 不要提供过长的任务列表（超过5条）
- ❌ 不要忽略用户过度专注的迹象
`

  return `${basePrompt}

${contextPrompt}

${adhdAwarenessLayer}

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
    name: 'start_pomodoro',
    description: '用户想要开始专注计时或休息。',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        duration: {
          type: SchemaType.NUMBER,
          description: '专注/休息时长（分钟）。如果没有明确指定，默认为 25。',
        },
        mode: {
          type: SchemaType.STRING,
          description: '模式：focus (专注), short (短休), long (长休)。',
        },
        taskContent: {
          type: SchemaType.STRING,
          description:
            '要专注的任务内容。如果用户指定了任务（或请求随机选择），请在此填入任务文本。',
        },
        reply: {
          type: SchemaType.STRING,
          description: 'BuBu 的回复。如"好的，为您开启任务：[任务名]"。',
        },
      },
      required: ['reply'],
    },
  },
  {
    name: 'control_ambience',
    description: '用户想要控制白噪音/背景音效（播放、暂停、停止）。',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        action: {
          type: SchemaType.STRING,
          description: '动作：play (播放), pause (暂停), stop (停止), volume (调整音量)。',
        },
        sound: {
          type: SchemaType.STRING,
          description:
            '声音名称（ID）。请务必从 **可用白噪音列表** 中选择（如：rain, fire, wind 等）。严格禁止臆造不存在的声音（如 coffee shop）。如果不确定，请回复说明没有该声音。',
        },
        volume: {
          type: SchemaType.NUMBER,
          description: '音量值 (0-1)。仅在 action 为 volume 时需要。',
        },
        reply: {
          type: SchemaType.STRING,
          description: 'BuBu 的回复。如"已为您播放雨声"、"音乐已停止"。',
        },
      },
      required: ['action', 'reply'],
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
  {
    name: 'break_down_task',
    description:
      '将大任务自动拆解为 ADHD 友好的小步骤（每步 5-15 分钟）。当用户感到 overwhelmed、请求拆解任务、或描述一个复杂任务时调用。',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        originalTask: {
          type: SchemaType.STRING,
          description: '用户的原始任务描述',
        },
        steps: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description:
            '拆解后的步骤列表（3-6个），每个步骤简短清晰（≤15字），以动词开头，易于立即行动',
        },
        estimatedTime: {
          type: SchemaType.STRING,
          description: '预估总时间，使用具象化表达（如"大概两集动漫的时间"、"喝一杯咖啡的时间"）',
        },
        reply: {
          type: SchemaType.STRING,
          description:
            'BuBu 的回复。说明已拆解任务，提示用户"点击下面按钮确认添加到任务列表"。包含鼓励语。',
        },
      },
      required: ['originalTask', 'steps', 'reply'],
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats?: any // Allow daily stats
}

// Simple in-memory rate limiting (TODO: use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(clientId: string, isPro: boolean): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const limit = isPro ? DAILY_LIMIT_PRO : DAILY_LIMIT_FREE

  // Pro users with unlimited (-1) always allowed
  if (limit === -1) {
    return { allowed: true, remaining: -1 }
  }

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
      stats, // Extract stats
    } = body

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
    }

    // Check if user is logged in - Guest users cannot use BuBu AI
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error:
            language === 'zh'
              ? '请先登录后使用 BuBu AI 助手'
              : 'Please login to use BuBu AI Assistant',
        },
        { status: 401 }
      )
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
    const systemPrompt = buildSystemPrompt(personality, language, context, stats)

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

    if (name === 'start_pomodoro') {
      incrementRateLimit(clientId)
      return NextResponse.json({
        success: true,
        data: {
          reply: args.reply || '好的，正在为您启动番茄钟',
          action: {
            type: 'start_pomodoro',
            payload: {
              duration: args.duration,
              mode: args.mode,
              taskContent: args.taskContent,
            },
          },
          remaining: rateLimit.remaining - 1,
        },
      })
    }

    if (name === 'control_ambience') {
      incrementRateLimit(clientId)
      return NextResponse.json({
        success: true,
        data: {
          reply: args.reply || '好的，正在为您调整声音',
          action: {
            type: 'control_ambience',
            payload: {
              action: args.action,
              sound: args.sound,
              volume: args.volume,
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

    if (name === 'break_down_task') {
      incrementRateLimit(clientId)
      // 任务拆解返回 add_tasks 类型，复用现有的任务添加 UI
      return NextResponse.json({
        success: true,
        data: {
          reply: args.reply,
          action: {
            type: 'add_tasks',
            payload: args.steps, // 拆解后的步骤列表
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
