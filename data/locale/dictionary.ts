export type Locale = 'en' | 'cn'

export const dictionary = {
  en: {
    nav: {
      focusLab: 'Focus Lab',
      guides: 'Guides',
      about: 'About',
      home: 'Home',
      blog: 'Blog',
      privacy: 'Privacy Policy',
    },
    home: {
      heroTitle: 'NeuroHacks Lab',
      heroDesc: 'Tools and strategies for the ADHD brain.',
      heroTagline: 'Adult ADHD Test · WHO ASRS v1.1',
      heroHeadline: 'Free Adult ADHD Test Online & Productivity Toolkit',
      heroSubheadline:
        'Is it ADHD or just modern life? Take the World Health Organization (WHO) ASRS v1.1 self-screening. No email required—just clarity, science, and neurodivergent-friendly tools.',
      startAssessment: 'Start Free Assessment →',
      privacyNote: '2-minute ASRS v1.1 · 100% Private',
      trust: {
        scientific: {
          title: 'Scientific Rigor',
          desc: 'Based on the ASRS v1.1 Symptom Checklist developed by the WHO.',
        },
        privacy: {
          title: 'Privacy First',
          desc: 'Data security is the baseline. The test runs entirely in your browser; results are never uploaded to a server.',
        },
        actionable: {
          title: 'Immediate Action',
          desc: 'More than just a score. Based on your results, we match you with white noise, Pomodoro timers, and other relief tools.',
        },
      },
      resourceHub: {
        tagline: 'Explore NeuroHacks',
        title: 'Resource Hub',
        desc: "From scientific screening to practical tools, we've built a complete survival guide for the 'hyperactive brain'.",
        focusLabDesc:
          'Your personal mission control. Integrated brown noise, task breaker, and visual timers to build a distraction-free deep work flow.',
        guidesDesc:
          "Say no to the 'ADHD tax'. Which fidgets are truly silent? Which apps actually work? We've tested all the gear for you.",
        enterFocusLab: 'Enter Focus Lab',
      },
      faq: {
        tagline: 'FAQs',
        title: 'Common Questions about the Online ADHD Test',
        desc: "Get confident about how this adult ADHD self-screening works, why it's free, and what to do next once you have your score.",
        items: [
          {
            q: 'Is this online test accurate?',
            a: 'This tool uses the **ASRS v1.1**, a clinical screening scale developed by the World Health Organization (WHO). While an online test **cannot replace a formal diagnosis**, it is a reliable first step to identify symptom patterns and determine if professional help is needed.',
          },
          {
            q: 'Is it really completely free?',
            a: "Yes. We hate the 'pay to see results' trap. NeuroHacks Lab provides a completely free self-test with instant results.",
          },
          {
            q: 'Do I need to provide an email?',
            a: 'No. We insist on **privacy first**. You can complete the test and view results without registering or leaving an email.',
          },
          {
            q: 'What should I do after the test?',
            a: 'If your score is high, we recommend consulting a psychiatrist. Meanwhile, you can directly use our **Focus Lab** and read related guides to start managing distraction issues immediately.',
          },
        ],
      },
      blog: {
        tagline: 'ADHD Essentials',
        title: 'Latest Releases & Deep Guides',
        desc: 'Deep dives into sensory regulation, focus rituals, and ADHD-friendly productivity systems.',
        noPosts: 'No posts found.',
        readMore: 'Read more',
        allPosts: 'All Posts',
      },
    },
    focusLab: {
      header: {
        eyebrow: 'Focus Lab',
        title: 'Your Immersive ADHD Workspace',
        description:
          'A "focus sanctuary" designed for the hyperactive brain. No more switching between apps—white noise, Pomodoro timer, and task breakdown tools are all integrated here.\nThis is your personal mission control to block distractions and regain control.',
      },
      widgets: {
        sonicShield: {
          title: 'White Noise',
          subtitle: 'Mix custom soundscapes to block out distractions.',
          selectSounds: 'Select sounds',
          active: 'active',
          volume: 'Vol',
        },
        timer: {
          title: 'Pomodoro Timer',
          subtitle: 'Customizable timer with Countdown and Target Time modes.',
          presets: {
            focus: 'Focus · 25m',
            short: 'Short Break · 5m',
            long: 'Long Break · 15m',
          },
          countdown: 'COUNTDOWN',
          targetTime: 'TARGET TIME',
          set: 'Set',
          reset: 'Reset',
          pause: 'PAUSE',
          start: 'START',
        },
        taskBreaker: {
          title: 'AI Task Breaker',
          subtitle: 'Input a complex task and let AI break it down into actionable steps.',
          overwhelmed: 'Overwhelmed?',
          description:
            "Type your big scary task below, and I'll break it into tiny, non-scary steps.",
          placeholder: 'e.g. Clean my entire apartment...',
          button: 'Break it down',
          currentMission: 'Current Mission',
          newTask: 'New Task',
          summoning: 'Summoning goblins...',
          failed: 'Failed to summon goblins. Please try again.',
          mockSteps: ['Start timer (5m)', 'Do first step', 'Take a breath', 'Keep going'],
        },
        brainDump: {
          title: 'Attention Hub',
          subtitle: 'Quickly jot down thoughts or tasks to clear your mind.',
          emptyTitle: 'Your mind is clear.',
          emptySubtitle: 'Type above to offload distractions.',
          placeholder: 'Catch a thought (or paste an image)...',
        },
        dopamineMenu: {
          title: 'Dopamine Menu',
          subtitle: 'Randomly select a quick activity to refresh your energy.',
          spinning: 'Spinning...',
          ready: 'Ready to Draw',
          button: 'GIVE ME DOPAMINE',
          addPlaceholder: 'Add option...',
          add: 'Add',
          defaultOptions: [
            'Drink Water 💧',
            'Stretch 🧘',
            '5 Jumping Jacks 🏃',
            'Check 1 Email 📧',
            'Deep Breath 🌬️',
            'Pet a Cat/Dog 🐶',
          ],
        },
      },
      controls: {
        focusMode: 'Focus Mode',
        exitFocus: 'Exit Focus',
        resetLayout: 'Reset Layout',
        tip: 'Drag the title bar to change the layout. Click the title bar to hide or show this card.',
      },
      promo: {
        proTip: 'Pro Tip',
        title: 'Curious about your focus levels?',
        description:
          'Run the same ASRS v1.1 screener clinicians use and get instant guidance on where to start.',
        button: 'Start Free Assessment',
      },
      sounds: {
        insects: 'Insects',
        rain: 'Rain',
        'summer-night': 'Summer Night',
        thunder: 'Thunder',
        waves: 'Waves',
        'white-noise': 'White Noise',
        wind: 'Wind',
        brown: 'Brown Noise',
        pink: 'Pink Noise',
        white: 'White Noise',
      },
      seo: {
        title: 'How this ADHD Dashboard helps you focus',
        sonicShield: {
          title: '1. White Noise: Custom Soundscapes',
          content:
            'For many ADHD brains, silence is actually distracting. Every small sound becomes a potential interruption. Our White Noise player provides a range of "auditory masking" options including White Noise, Rain, Insects, Summer Night, Thunder, Waves, and Wind. These create a consistent sound blanket that covers up distracting background noises, reducing the cognitive load required to filter them out.',
        },
        pomodoro: {
          title: '2. Pomodoro Timer: Conquer Time Blindness',
          content:
            '"Time Blindness" is a common struggle where the passage of time feels abstract. The Pomodoro Timer externalizes time, making it visible and concrete. Working in short bursts (like 25 minutes) with guaranteed breaks helps maintain dopamine levels and prevents burnout.',
        },
        taskBreaker: {
          title: '3. AI Task Breaker: Reduce Executive Dysfunction',
          content:
            'Large tasks can feel impossible, leading to "Executive Dysfunction" or paralysis. The AI Task Breaker helps you smash big projects into tiny, non-threatening steps. Seeing a concrete path forward reduces anxiety and makes it easier to just start.',
        },
        scratchpad: {
          title: '4. Attention Hub: Offload Working Memory',
          content:
            'ADHD brains often have "leaky" working memory. The Attention Hub serves as an external holding bay for random thoughts, ideas, or reminders that pop up while you\'re working. Instead of switching tasks to address them (and losing your flow), you capture them here and keep going.',
        },
        dopamineMenu: {
          title: '5. Dopamine Menu: Healthy Stimulation',
          content:
            'When energy dips, the ADHD brain craves stimulation, often leading to doom-scrolling. The Dopamine Menu provides a curated list of quick, healthy dopamine hits (like "Drink Water" or "Stretch") to reboot your brain without getting sucked into a distraction vortex.',
        },
        faq: {
          title: 'Frequently Asked Questions',
          items: [
            {
              q: 'Is this focus dashboard free?',
              a: 'Yes, Focus Lab is completely free to use. It runs entirely in your browser.',
            },
            {
              q: 'Do I need to download anything?',
              a: 'No downloads required. It works on any modern web browser (Chrome, Safari, Firefox, Edge) on both desktop and mobile.',
            },
          ],
        },
      },
    },
    test: {
      title: 'Free Adult ADHD Self-Screening',
      subtitle: 'ASRS-v1.1',
      description:
        'Answer 18 research-backed questions to understand how closely your experiences align with adult ADHD patterns.',
      start: 'Start Assessment →',
      meta: '2 minutes · No email required',
      questions: [
        {
          id: 1,
          text: 'How often do you have trouble <strong>wrapping up the final details</strong> of a project, once the <strong>challenging parts</strong> have been done?',
          isPartA: true,
          hints: [
            'My work is usually buttoned up.',
            'Only if I’m exhausted or stressed.',
            'Occasionally a loose end slips by.',
            'I often need reminders to finish the last bits.',
            'I rarely feel a project is truly finished.',
          ],
        },
        {
          id: 2,
          text: 'How often do you have difficulty <strong>getting things in order</strong> when you have to do a task that requires <strong>organization</strong>?',
          isPartA: true,
          hints: [
            'Lists and systems come naturally.',
            'Only complex projects throw me off.',
            'I have to pause to figure out the plan.',
            'Most tasks feel scattered without help.',
            'I feel overwhelmed just thinking about organizing.',
          ],
        },
        {
          id: 3,
          text: 'How often do you have problems <strong>remembering appointments or obligations</strong>?',
          isPartA: true,
          hints: [
            'My calendar is always up to date.',
            'Rarely—I might forget a recurring task.',
            'I need frequent reminders to stay on track.',
            'Missed appointments happen a lot.',
            'I forget commitments almost as soon as I make them.',
          ],
        },
        {
          id: 4,
          text: 'When you have a task that requires <strong>a lot of thought</strong>, how often do you <strong>avoid or delay getting started</strong>?',
          isPartA: true,
          hints: [
            'I dive right in.',
            'Only when the task is unclear.',
            'I procrastinate unless there’s pressure.',
            'The start line feels like a wall most days.',
            'I routinely miss deadlines because I avoid the task.',
          ],
        },
        {
          id: 5,
          text: 'How often do you <strong>fidget or squirm</strong> with your hands or feet when you have to sit down for a long time?',
          isPartA: true,
          hints: [
            'Sitting still isn’t a problem.',
            'Only during very long meetings.',
            'I shift around after a short while.',
            'I’m constantly tapping or bouncing.',
            'I can’t stay seated without moving.',
          ],
        },
        {
          id: 6,
          text: 'How often do you feel <strong>overly active</strong> and compelled to do things, like you were <strong>driven by a motor</strong>?',
          isPartA: true,
          hints: [
            'My energy is steady and manageable.',
            'I get revved up only on high-pressure days.',
            'I feel “on” more often than not.',
            'It’s hard to slow down even when I try.',
            'I feel like I’m constantly running inside.',
          ],
        },
        {
          id: 7,
          text: 'How often do you make <strong>careless mistakes</strong> when you have to work on a <strong>boring or difficult project</strong>?',
          isPartA: false,
          hints: [
            'My work is usually error-free.',
            'Only when I’m extremely tired.',
            'I occasionally miss small details.',
            'I often have to double-check my work.',
            'I make mistakes no matter how hard I try.',
          ],
        },
        {
          id: 8,
          text: 'How often do you have difficulty <strong>keeping your attention</strong> when you are doing <strong>boring or repetitive work</strong>?',
          isPartA: false,
          hints: [
            'I stay focused regardless of the task.',
            'Only mind-numbing tasks lose me.',
            'I drift off unless I refocus often.',
            'I struggle to finish repetitive work.',
            'I can barely stick with repetitive tasks at all.',
          ],
        },
        {
          id: 9,
          text: 'How often do you have difficulty <strong>concentrating on what people say</strong> to you, even when they are speaking to you directly?',
          isPartA: false,
          hints: [
            'I stay engaged when someone speaks.',
            'Only in very noisy environments.',
            'My mind wanders in longer conversations.',
            'I miss key points unless I take notes.',
            'It feels impossible to stay tuned in.',
          ],
        },
        {
          id: 10,
          text: 'How often do you <strong>misplace or have difficulty finding things</strong> at home or at work?',
          isPartA: false,
          hints: [
            'Everything has a place and stays there.',
            'Only occasional slip-ups.',
            'I lose track unless I tidy constantly.',
            'I’m always searching for essentials.',
            'Items vanish the moment I set them down.',
          ],
        },
        {
          id: 11,
          text: 'How often are you <strong>distracted by activity or noise</strong> around you?',
          isPartA: false,
          hints: [
            'Background noise rarely fazes me.',
            'Only sudden or loud sounds derail me.',
            'I need headphones to stay on task.',
            'Most environments pull my focus away.',
            'Every little sound feels disruptive.',
          ],
        },
        {
          id: 12,
          text: 'How often do you <strong>leave your seat</strong> in meetings or other situations in which you are expected to remain seated?',
          isPartA: false,
          hints: [
            'I stay seated as expected.',
            'Only in extra-long sessions.',
            'I excuse myself once in a while.',
            'I frequently need to stand or walk.',
            'Sitting through a meeting feels impossible.',
          ],
        },
        {
          id: 13,
          text: 'How often do you feel <strong>restless or fidgety</strong>?',
          isPartA: false,
          hints: [
            'I feel calm most of the time.',
            'Only during stressful weeks.',
            'There’s a mild buzz in my body.',
            'Restlessness is my default state.',
            'I rarely feel physically settled.',
          ],
        },
        {
          id: 14,
          text: 'How often do you have difficulty <strong>unwinding and relaxing</strong> when you have time to yourself?',
          isPartA: false,
          hints: [
            'Downtime actually relaxes me.',
            'It takes a few minutes to settle.',
            'I need rituals to shut my brain off.',
            'Relaxing feels like another task.',
            'I can’t switch off, even alone.',
          ],
        },
        {
          id: 15,
          text: 'How often do you find yourself <strong>talking too much</strong> when you are in social situations?',
          isPartA: false,
          hints: [
            'I match the pacing of the room.',
            'Only when I’m extra excited.',
            'Sometimes I realize I’m rambling.',
            'Friends gently ask me to slow down.',
            'I dominate conversations without meaning to.',
          ],
        },
        {
          id: 16,
          text: "When you're in a conversation, how often do you find yourself <strong>finishing the sentences</strong> of the people you are talking to, before they can finish them themselves?",
          isPartA: false,
          hints: [
            'I rarely jump in prematurely.',
            'Only with close friends or family.',
            'Sometimes I blurt the ending for others.',
            'I do it enough that people notice.',
            'I constantly finish people’s sentences.',
          ],
        },
        {
          id: 17,
          text: 'How often do you have difficulty <strong>waiting your turn</strong> in situations when turn taking is required?',
          isPartA: false,
          hints: [
            'Lines and queues don’t bother me.',
            'Only when I’m in a major rush.',
            'I get antsy unless I’m distracted.',
            'Waiting my turn feels uncomfortable.',
            'I have to move ahead or tap out somehow.',
          ],
        },
        {
          id: 18,
          text: 'How often do you <strong>interrupt others</strong> when they are busy?',
          isPartA: false,
          hints: [
            'I respect people’s space and focus.',
            'Only if I urgently need something.',
            'Sometimes I pop in mid-task.',
            'Interrupting happens most days.',
            'I constantly cut people off without meaning to.',
          ],
        },
      ],
      options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
      common: {
        partA: 'Part A',
        partB: 'Part B',
        question: 'Question',
        of: 'of',
        hideHints: 'Hide Hints',
        showHints: 'Show Hints',
        soundOn: 'Sound on',
        soundOff: 'Sound off',
        previous: 'Previous',
      },
      break: {
        title: '🧠 Part A Complete!',
        description:
          "Great job. You've finished the core screening questions. Take a deep breath before the final stretch.",
        button: 'Continue to Part B →',
      },
      analyzing: {
        messages: ['Analyzing responses...', 'Mapping neuro-profile...', 'Finalizing score...'],
        subtitle: 'We’ll surface your ASRS insights in just a moment.',
      },
      results: {
        status: 'Status',
        totalScore: 'Total Score',
        outOf: 'out of 72',
        buckets: {
          low: {
            label: 'Unlikely to have ADHD',
            description: 'Your symptoms are within the typical range',
          },
          medium: {
            label: 'Likely to have ADHD',
            description: 'You are showing signs that may impact your daily life',
          },
          high: {
            label: 'Highly Consistent with ADHD',
            description: 'Your symptoms are significant. We recommend consulting a professional',
          },
        },
        cta: {
          title: 'Ready to get in the zone? Access your personal focus dashboard.',
          button: 'Enter Focus Lab Dashboard →',
          retake: 'Retake Test',
          guide: 'Or read our guide on Quiet Fidget Toys',
          home: 'Back to Home',
        },
      },
      disclaimer:
        'Based on the Adult ADHD Self-Report Scale (ASRS-v1.1) Symptom Checklist. This self-screening is for educational purposes only and is not a medical diagnosis. Material adapted from World Health Organization standards.',
      copyright:
        'ASRS-v1.1 Copyright © New York University and Ronald C. Kessler, PhD. All rights reserved. Used with permission.',
    },
    footer: {
      rights: 'All rights reserved.',
      quickLinks: 'Quick Links',
    },
    common: {
      loading: 'Loading...',
      error: 'Something went wrong',
    },
  },
  cn: {
    nav: {
      focusLab: '专注实验室',
      guides: '指南',
      about: '关于',
      home: '首页',
      blog: '博客',
      privacy: '隐私政策',
    },
    home: {
      heroTitle: 'NeuroHacks 实验室',
      heroDesc: '专为 ADHD 大脑设计的工具与策略。',
      heroTagline: '成人 ADHD 测试 · WHO ASRS v1.1',
      heroHeadline: '免费成人 ADHD 在线自测 & 专注力工具箱',
      heroSubheadline:
        '是天生多动，还是被现代生活累垮了？花 2 分钟完成基于世卫组织（WHO）标准的科学自筛。无需注册，100% 隐私保护，测完即用专注工具。',
      startAssessment: '开始免费自测 →',
      privacyNote: '2分钟 ASRS v1.1 · 100% 隐私保护',
      trust: {
        scientific: {
          title: '科学严谨',
          desc: '基于 WHO 开发的 ASRS v1.1 症状核查表，国际通用的筛查标准。',
        },
        privacy: {
          title: '隐私优先',
          desc: '数据安全是底线。测试全程在浏览器本地运行，结果绝不上传服务器。',
        },
        actionable: {
          title: '即刻行动',
          desc: '不只是给个分数。根据测试结果，为你匹配白噪音、番茄钟等缓解工具。',
        },
      },
      resourceHub: {
        tagline: '探索 NeuroHacks',
        title: '资源中心',
        desc: '从科学筛查到实战工具，我们为你打造了一整套“多动大脑”生存指南。',
        focusLabDesc:
          '你的私人任务控制台。集成白噪音、任务拆解器和可视化计时器，打造无干扰的深度工作流。',
        guidesDesc: '拒绝智商税。哪款解压玩具真静音？哪个 App 真正好用？我们替你实测了所有装备。',
        enterFocusLab: '进入实验室',
      },
      faq: {
        tagline: '常见问题',
        title: '关于 ADHD 在线自测的常见疑问',
        desc: '了解这个成人 ADHD 自测是如何工作的，为什么它是免费的，以及得到分数后该做什么。',
        items: [
          {
            q: '这个在线测试准确吗？',
            a: '本工具使用的是 ASRS v1.1，这是由世界卫生组织（WHO）开发的临床筛查量表。虽然在线测试不能替代医生的正式诊断，但它是识别症状模式、判断是否需要寻求专业帮助的可靠第一步。',
          },
          {
            q: '真的完全免费吗？',
            a: '是的。我们反感那些测完才收费的套路。NeuroHacks Lab 提供完全免费的自测，结果即刻显示。',
          },
          {
            q: '需要填写邮箱吗？',
            a: '不需要。我们坚持隐私至上。你可以在不注册、不留邮箱的情况下完成测试并查看结果。',
          },
          {
            q: '测完之后我该做什么？',
            a: '如果分数较高，建议咨询精神科医师。同时，你可以直接使用我们的 Focus Lab（专注实验室） 和阅读相关指南，立即开始尝试缓解注意力分散的问题。',
          },
        ],
      },
      blog: {
        tagline: 'ADHD 必备工具',
        title: '最新发布与深度指南',
        desc: '关于感官调节、专注仪式和 ADHD 友好型效率系统的深度解析。',
        noPosts: '暂无文章。',
        readMore: '阅读更多',
        allPosts: '所有文章',
      },
    },
    focusLab: {
      header: {
        eyebrow: '专注实验室',
        title: '你的 ADHD 沉浸式工作台',
        description:
          '专为多动大脑设计的“专注避难所”。无需在不同 App 间来回切换，这里集成了白噪音、番茄钟和任务拆解工具。\n这就是你的私人任务控制中心，帮你屏蔽干扰，找回掌控感。',
      },
      controls: {
        focusMode: '专注模式',
        exitFocus: '退出专注',
        resetLayout: '重置布局',
        tip: '拖动标题行来改变布局。点击标题行来隐藏或者显示这个卡片。',
      },
      promo: {
        proTip: '专业建议',
        title: '想了解你的专注力水平？',
        description: '使用临床医生使用的 ASRS v1.1 筛查工具，即刻获取改善建议。',
        button: '开始免费评估',
      },
      widgets: {
        sonicShield: {
          title: '白噪音',
          subtitle: '混合自定义声景以阻挡干扰。',
          selectSounds: '选择声音',
          active: '活跃',
          volume: '音量',
        },
        timer: {
          title: '番茄钟',
          subtitle: '支持倒计时和目标时间模式的可自定义计时器。',
          presets: {
            focus: '专注 · 25分钟',
            short: '短休息 · 5分钟',
            long: '长休息 · 15分钟',
          },
          countdown: '倒计时',
          targetTime: '目标时间',
          set: '设置',
          reset: '重置',
          pause: '暂停',
          start: '开始',
        },
        taskBreaker: {
          title: 'AI 任务拆解',
          subtitle: '输入复杂任务，让 AI 将其拆解为可执行的步骤。',
          overwhelmed: '感到不知所措？',
          description: '在下方输入你害怕的大任务，我会把它拆解成微小、不可怕的步骤。',
          placeholder: '例如：打扫整个公寓...',
          button: '拆解任务',
          currentMission: '当前任务',
          newTask: '新任务',
          summoning: '正在召唤小精灵...',
          failed: '召唤失败，请重试。',
          mockSteps: ['启动计时器（5分钟）', '迈出第一步', '深呼吸', '继续加油'],
        },
        brainDump: {
          title: '注意力中转站',
          subtitle: '快速记下想法或任务以清空大脑。',
          emptyTitle: '你的大脑很清醒。',
          emptySubtitle: '在上方输入以卸载干扰。',
          placeholder: '捕捉一个想法（或粘贴图片）...',
        },
        dopamineMenu: {
          title: '多巴胺菜单',
          subtitle: '随机选择一项快速活动以恢复精力。',
          spinning: '旋转中...',
          ready: '准备抽卡',
          button: '给我多巴胺',
          addPlaceholder: '添加选项...',
          add: '添加',
          defaultOptions: [
            '喝水 💧',
            '伸展 🧘',
            '5个开合跳 🏃',
            '查收1封邮件 📧',
            '深呼吸 🌬️',
            '摸摸猫/狗 🐶',
          ],
        },
      },
      sounds: {
        insects: '昆虫',
        rain: '雨声',
        'summer-night': '夏夜',
        thunder: '雷声',
        waves: '海浪',
        'white-noise': '白噪音',
        wind: '风声',
        brown: '褐噪音',
        pink: '粉红噪音',
        white: '白噪音',
      },
      seo: {
        title: '这个 ADHD 仪表盘如何帮助你专注',
        sonicShield: {
          title: '1. 白噪音：自定义声景',
          content:
            '对于许多 ADHD 大脑来说，死寂实际上是分心的。每一个细小的声音都可能成为干扰。我们的白噪音播放器提供一系列“听觉掩蔽”选项，包括白噪音、雨声、昆虫声、夏夜、雷声、海浪和风声。它们创造了一层持续的声音毯子，覆盖住令人分心的背景噪音，减少过滤噪音所需的认知负荷。',
        },
        pomodoro: {
          title: '2. 番茄钟：战胜时间盲区',
          content:
            '“时间盲区”是一个常见的挣扎，时间的流逝感觉很抽象。番茄钟将时间外化，使其可见且具体。短时间爆发式工作（如 25 分钟）并保证休息，有助于维持多巴胺水平并防止倦怠。',
        },
        taskBreaker: {
          title: '3. AI 任务拆解：减少执行功能障碍',
          content:
            '大任务可能让人感觉不可能完成，导致“执行功能障碍”或瘫痪。AI 任务拆解器帮助你将大项目粉碎成微小、无威胁的步骤。看到具体的路径可以减少焦虑，让你更容易开始。',
        },
        scratchpad: {
          title: '4. 注意力中转站：卸载工作记忆',
          content:
            'ADHD 大脑的工作记忆往往容易“泄漏”。注意力中转站作为一个外部停靠站，用来存放你在工作时突然冒出的随机想法、点子或提醒。你不需要切换任务去处理它们（从而打断心流），只需把它们捕捉在这里，然后继续手头的工作。',
        },
        dopamineMenu: {
          title: '5. 多巴胺菜单：健康的刺激',
          content:
            '当能量下降时，ADHD 大脑渴望刺激，这往往导致无休止的刷屏。多巴胺菜单提供了一份精选的快速、健康的多巴胺来源列表（如“喝水”或“伸展”），帮助你重启大脑，而不会被吸入分心的漩涡。',
        },
        faq: {
          title: '常见问题',
          items: [
            {
              q: '这个专注仪表盘是免费的吗？',
              a: '是的，专注实验室完全免费使用。它完全在你的浏览器中运行。',
            },
            {
              q: '我需要下载什么吗？',
              a: '无需下载。它适用于桌面和移动设备上的任何现代网络浏览器（Chrome, Safari, Firefox, Edge）。',
            },
          ],
        },
      },
    },
    test: {
      title: '免费成人 ADHD 自测',
      subtitle: 'ASRS-v1.1',
      description: '回答18个基于研究的问题，了解您的经历与成人 ADHD 模式的吻合程度。',
      start: '开始评估 →',
      meta: '2分钟 · 无需邮箱',
      questions: [
        {
          id: 1,
          text: '一旦完成任何计划中最具挑战的部分之后，你多常有<strong>完成计划最后细节</strong>的困难？',
          isPartA: true,
          hints: [
            '我的工作通常都很完美。',
            '只有在疲惫或压力大时。',
            '偶尔会漏掉一些细节。',
            '我经常需要提醒才能完成最后的部分。',
            '我很少觉得项目真正完成了。',
          ],
        },
        {
          id: 2,
          text: '当必须从事需要<strong>有组织规划性</strong>的任务时，你多常有困难<strong>井然有序</strong>地去做？',
          isPartA: true,
          hints: [
            '列表和系统对我来说很自然。',
            '只有复杂的项目会让我乱套。',
            '我必须停下来弄清楚计划。',
            '没有帮助的话，大多数任务感觉很散乱。',
            '一想到整理我就感到不知所措。',
          ],
        },
        {
          id: 3,
          text: '你多常有问题去<strong>记得约会或是必须要做的事</strong>？',
          isPartA: true,
          hints: [
            '我的日历总是最新的。',
            '很少——我可能会忘记重复的任务。',
            '我需要经常提醒才能保持正轨。',
            '经常错过约会。',
            '我几乎一做出承诺就忘记了。',
          ],
        },
        {
          id: 4,
          text: '当有一件需要<strong>多费心思考</strong>的工作时，你多常<strong>逃避或是延后开始</strong>去做？',
          isPartA: true,
          hints: [
            '我直接开始。',
            '只有当任务不清楚时。',
            '除非有压力，否则我会拖延。',
            '起跑线在大多数时候感觉像一堵墙。',
            '我经常因为回避任务而错过截止日期。',
          ],
        },
        {
          id: 5,
          text: '当你必须<strong>长时间坐着</strong>时，你多常<strong>坐不安稳或扭动手脚</strong>？',
          isPartA: true,
          hints: [
            '坐着不动不是问题。',
            '只有在非常长的会议中。',
            '过一会儿我就开始动来动去。',
            '我一直在敲击或抖动。',
            '我不动就坐不住。',
          ],
        },
        {
          id: 6,
          text: '你多常像<strong>被马达所驱动</strong>一样，觉得自己<strong>过度地活跃</strong>，不得不做事情？',
          isPartA: true,
          hints: [
            '我的精力稳定且可控。',
            '只有在高压的日子里我才会兴奋。',
            '我经常感觉处于“开启”状态。',
            '即使我尝试，也很难慢下来。',
            '我感觉内心一直在奔跑。',
          ],
        },
        {
          id: 7,
          text: '当必须进行一件<strong>枯燥或困难</strong>的计划时，你多常<strong>粗心犯错</strong>？',
          isPartA: false,
          hints: [
            '我的工作通常没有错误。',
            '只有当我非常累的时候。',
            '我偶尔会漏掉小细节。',
            '我经常需要反复检查我的工作。',
            '无论我多努力，我都会犯错。',
          ],
        },
        {
          id: 8,
          text: '当正在做<strong>枯燥或重复性</strong>的工作时，你多常有<strong>持续专注的困难</strong>？',
          isPartA: false,
          hints: [
            '无论任务如何，我都能保持专注。',
            '只有令人麻木的任务会让我分心。',
            '除非我经常重新聚焦，否则我会走神。',
            '我很难完成重复性工作。',
            '我几乎完全无法坚持做重复性任务。',
          ],
        },
        {
          id: 9,
          text: '即使有人直接对你说话，你多常有困难<strong>专注于别人跟你讲话的内容</strong>？',
          isPartA: false,
          hints: [
            '当有人说话时，我会保持专注。',
            '只有在非常嘈杂的环境中。',
            '在较长的对话中我会走神。',
            '除非我做笔记，否则我会错过关键点。',
            '感觉不可能一直听进去。',
          ],
        },
        {
          id: 10,
          text: '在家里或是工作时，你多常<strong>没有把东西放对地方或是找不到东西</strong>？',
          isPartA: false,
          hints: [
            '每样东西都有位置，并且都在那里。',
            '只有偶尔的失误。',
            '除非我不断整理，否则我会找不到东西。',
            '我总是在寻找必需品。',
            '物品一放下就消失了。',
          ],
        },
        {
          id: 11,
          text: '你多常因身旁的<strong>活动或声音而分心</strong>？',
          isPartA: false,
          hints: [
            '背景噪音很少困扰我。',
            '只有突然或巨大的声音会打断我。',
            '我需要耳机才能保持专注。',
            '大多数环境都会分散我的注意力。',
            '每一个小声音都感觉具有破坏性。',
          ],
        },
        {
          id: 12,
          text: '你多常在开会时或在其他<strong>被期待坐好的场合中离开座位</strong>？',
          isPartA: false,
          hints: [
            '我按要求坐着。',
            '只有在超长的会议中。',
            '我偶尔会离开一下。',
            '我经常需要站起来或走动。',
            '坐着开会感觉是不可能的。',
          ],
        },
        {
          id: 13,
          text: '你多常觉得<strong>静不下来或烦躁不安</strong>？',
          isPartA: false,
          hints: [
            '我大部分时间都感到平静。',
            '只有在压力大的一周里。',
            '我的身体里有一种轻微的嗡嗡声。',
            '坐立不安是我的常态。',
            '我很少感到身体安顿下来。',
          ],
        },
        {
          id: 14,
          text: '当有自己独处的时间时，你多常觉得有困难<strong>让自己平静和放松</strong>？',
          isPartA: false,
          hints: [
            '休息时间确实让我放松。',
            '需要几分钟才能安定下来。',
            '我需要仪式来关闭大脑。',
            '放松感觉像是另一项任务。',
            '即使独自一人，我也无法关闭。',
          ],
        },
        {
          id: 15,
          text: '在社交场合中，你多常发现自己<strong>话讲得太多</strong>？',
          isPartA: false,
          hints: [
            '我配合房间的节奏。',
            '只有当我特别兴奋的时候。',
            '有时我意识到自己在喋喋不休。',
            '朋友们温和地让我慢下来。',
            '我无意中主导了对话。',
          ],
        },
        {
          id: 16,
          text: '当与他人交谈时，你多常<strong>在别人还没把话说完前就插嘴或接话替对方把话讲完</strong>？',
          isPartA: false,
          hints: [
            '我很少过早插话。',
            '只有和亲密的朋友或家人在一起时。',
            '有时我会脱口而出别人的话。',
            '我经常这样做，以至于别人注意到了。',
            '我经常抢着把别人的话说完。',
          ],
        },
        {
          id: 17,
          text: '在需要轮流排队的场合时，你多常有困难<strong>轮流等待</strong>？',
          isPartA: false,
          hints: [
            '排队对我来说没问题。',
            '只有当我非常赶时间的时候。',
            '除非我分心，否则我会坐立不安。',
            '等待轮到我感觉很不舒服。',
            '我必须提前行动或以某种方式退出。',
          ],
        },
        {
          id: 18,
          text: '你多常在别人忙碌时<strong>打断别人</strong>？',
          isPartA: false,
          hints: [
            '我尊重别人的空间和专注。',
            '只有当我急需某样东西时。',
            '有时我会在任务中途突然介入。',
            '打断别人是常有的事。',
            '我经常无意中打断别人。',
          ],
        },
      ],
      options: ['从不', '很少', '有时', '经常', '非常频繁'],
      common: {
        partA: 'A部分',
        partB: 'B部分',
        question: '问题',
        of: '/',
        hideHints: '隐藏提示',
        showHints: '显示提示',
        soundOn: '开启声音',
        soundOff: '关闭声音',
        previous: '上一题',
      },
      break: {
        title: '🧠 第一部分完成！',
        description: '干得好。你已经完成了核心筛查问题。在最后阶段之前深呼吸。',
        button: '继续第二部分 →',
      },
      analyzing: {
        messages: ['正在分析回答...', '正在绘制神经图谱...', '正在最终确定分数...'],
        subtitle: '我们将稍后展示您的 ASRS 见解。',
      },
      results: {
        status: '状态',
        totalScore: '总分',
        outOf: '/ 72',
        buckets: {
          low: {
            label: '不太可能有 ADHD',
            description: '您的症状处于正常范围内',
          },
          medium: {
            label: '很可能有 ADHD',
            description: '您的症状可能已对日常生活造成影响',
          },
          high: {
            label: '非常可能有 ADHD',
            description: '您的症状非常显著，建议咨询专业人士',
          },
        },
        cta: {
          title: '准备好进入状态了吗？访问您的个人专注仪表盘。',
          button: '进入专注实验室仪表盘 →',
          retake: '再测一次',
          guide: '或者阅读我们的静音解压玩具指南',
          home: '返回首页',
        },
      },
      disclaimer:
        '基于成人 ADHD 自我报告量表 (ASRS-v1.1) 症状清单。此自测仅用于教育目的，并非医疗诊断。材料改编自世界卫生组织标准。',
      copyright:
        'ASRS-v1.1 版权所有 © 纽约大学和 Ronald C. Kessler, PhD。保留所有权利。经许可使用。',
    },
    footer: {
      rights: '版权所有。',
      quickLinks: '快速链接',
    },
    common: {
      loading: '加载中...',
      error: '出错了',
    },
  },
}
