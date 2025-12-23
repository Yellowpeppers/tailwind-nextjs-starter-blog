import { Locale } from '@/lib/i18n'

export const GREEN_STYLE_TOKENS = {
  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9F7 100%)',
  borderColor: '#E2E8E2',
  accentColor: '#7A9F7A',
  headerColor: '#374151',
  textColor: '#4B5563',
  subTextColor: '#9CA3AF',
  iconColor: '#7A9F7A',
}
export const dictionary = {
  en: {
    nav: {
      test: 'ADHD Test',
      focusLab: 'Focus Lab',
      guides: 'Guides',
      about: 'About',
      home: 'Home',
      blog: 'Guides',
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
          desc: 'More than just a score. Based on your results, we match you with white noise, Focus timers, and other relief tools.',
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
        exploreGuides: 'Discover Guides',
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
            a: 'If your score is high, we recommend consulting a psychiatrist. Meanwhile, you can directly use our [Focus Lab](/focuslab) and read related guides to start managing distraction issues immediately.',
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
    guides: {
      metaTitle: 'ADHD Guides & Product Reviews',
      metaDescription:
        'Browse ADHD-friendly gear tests, low-stim routines, and sensory regulation guides written by NeuroHacks Lab.',
      pageTitle: 'All Guides & Reviews',
      list: {
        allPosts: 'All Posts',
        prev: 'Previous',
        next: 'Next',
        pagination: '{current} of {total}',
        filterLabel: 'Filter posts by tag',
        tagLabel: 'View posts tagged {tag}',
        readMore: 'Read more',
        readMoreLabel: 'Read more: {title}',
      },
    },
    tags: {
      metaTitle: 'Browse ADHD Topics',
      metaDescription: 'Find ADHD tools, routines, and sensory supports by topic.',
      eyebrow: 'Topics',
      title: 'Explore Topics',
      description: 'Browse our growing library of guides, reviews, and hacks by category.',
      empty: 'No topics found.',
      cardDescription: 'Insights, guides, and reviews curated for {tag}.',
      cardAria: 'View posts tagged {tag}',
      single: 'post',
      plural: 'posts',
    },
    notFound: {
      title: 'Sorry we couldn’t find this page.',
      description: 'But don’t worry, you can find plenty of other things on our homepage.',
      cta: 'Back to homepage',
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
    focusLab: {
      header: {
        eyebrow: 'Focus Lab',
        title: 'Your Immersive ADHD Workspace',
        description:
          'A "focus sanctuary" designed for the hyperactive brain. No more switching between apps—white noise, Focus Timer, and task breakdown tools are all integrated here.\nThis is your personal mission control to block distractions and regain control.',
        stats: 'Stats',
      },
      stats: {
        dailyGoal: 'Daily Goal',
      },
      sidebar: {
        focusTools: 'FOCUS TOOLS',
        dailyGoal: 'Daily Goal',
        planComparison: 'Compare Plans',
        proMember: 'Pro Member',
        freePlan: 'Free Plan',
      },
      loading: {
        title: 'Loading Focus Lab',
        description: 'Building your distraction-free workspace...',
      },
      widgets: {
        sonicShield: {
          title: 'White Noise',
          subtitle: 'Mix custom soundscapes to block out distractions.',
          selectSounds: 'Select sounds',
          active: 'Active',
          volume: 'Vol',
          settings: {
            title: 'Settings',
            darkMode: 'Dark Mode',
            notifications: 'Notifications',
            soundEffects: 'Sound Effects',
            themeColor: 'Theme Color',
            close: 'Close',
            on: 'On',
            off: 'Off',
          },
          upgradeCard: {
            title: 'Upgrade Plan',
            subtitle: 'Compare Free vs Pro',
            button: 'View Details',
          },
        },
        timer: {
          title: 'Focus Timer',
          custom: 'Custom',
          switchMode: 'Switch Mode',
          subtitle: 'Customizable timer with Countdown and Target Time modes.',
          settings: 'Settings',
          stopwatchDesc: 'Count up to track focus time.',
          countdownDesc: 'Count down for a set duration.',
          presets: {
            focus: 'Focus · 25m',
            short: 'Short Break · 5m',
            long: 'Long Break · 15m',
          },
          countdown: 'COUNTDOWN',
          stopwatch: 'STOPWATCH',
          set: 'Set',
          reset: 'Reset',
          pause: 'PAUSE',
          start: 'START',
          resume: 'Resume',
          endSession: 'End',
          congratulations: 'Congratulations',
          continueFocus: 'One more round',
          endFocus: 'End Focus',
          done: 'Done',
          ready: 'Ready to start',
          recording: 'Recording time...',
          decisionPrompt: {
            continueFocus: 'Continue Focus',
            plusFive: '+5m',
            takeBreak: 'Break 5m',
          },
          todayFocus: 'Today: {minutes}m',
          tipTitle: 'Click title to toggle task name',
          tipCustom: 'Double-click custom timer to edit',
          accessibility: {
            showDailyFocus: "Show today's total focus time",
            showTimer: 'Show timer countdown again',
          },
        },

        taskBreaker: {
          title: 'AI Task Breaker',
          subtitle:
            'Input a complex task and let AI break it down into actionable steps. Once the steps arrive, use the arrow icon to push them into your To-Do list.',
          overwhelmed: 'Overwhelmed?',
          description: 'Type your big scary task below, break it into tiny, non-scary steps.',
          placeholder: 'e.g. Clean my entire apartment...',
          button: 'Break it down',
          currentMission: 'Current Mission',
          newTask: 'New Task',
          transferButton: 'Add steps to To-Do',
          transferInProgress: 'Adding...',
          transferSuccess: 'Steps added to your To-Do list.',
          transferError: 'Unable to save to To-Do. Please try again.',
          summoning: 'Summoning goblins...',
          failed: 'Failed to summon goblins. Please try again.',
          mockSteps: ['Start timer (5m)', 'Do first step', 'Take a breath', 'Keep going'],
        },
        brainDump: {
          title: 'Attention Hub',
          subtitle: 'Clear your mind. Capture thoughts.',
          emptyTitle: 'Your mind is clear',
          emptySubtitle: 'Capture thoughts as they come',
          placeholder: 'Type text here or paste an image...',
          accessibility: {
            addThought: 'Add note',
            clearBoard: 'Clear all notes',
            removeImage: 'Remove image preview',
            moveToOtherColumn: 'Move note to other column',
            deleteNote: 'Delete note',
          },
        },
        dopamineMenu: {
          title: 'Dopamine Menu',
          subtitle: 'Randomly select a quick activity to refresh your energy.',
          spinning: 'Spinning...',
          ready: 'Ready to Draw',
          button: 'GIVE ME DOPAMINE',
          spinButton: 'Dopamine',
          addPlaceholder: 'Add option...',
          add: 'Add',
          accessibility: {
            removeOption: 'Remove option',
          },
          defaultOptions: [
            'Drink Water 💧',
            'Stretch 🧘',
            '5 Jumping Jacks 🏃',
            'Check 1 Email 📧',
            'Deep Breath 🌬️',
            'Pet a Cat/Dog 🐶',
          ],
          needBoost: 'Need a boost?',
          needBoostDesc: 'Get a random hit of simple joy.',
          getDopamine: 'Get Dopamine',
          spinAgain: 'Spin Again',
          done: 'Done',
          edit: 'Edit Options',
          back: 'Back',
        },
        todo: {
          title: 'To-Do List',
          subtitle:
            'Your daily "must-do" list. Click the target icon on a task to load it into the Focus Timer.',
          placeholder: 'Add a new task...',
          emptyTitle: 'No tasks yet',
          emptySubtitle: 'Add a task to get started',
          focusTooltip: 'Focus on this task',
        },
      },
      errors: {
        migrationFailed: 'Migration failed. Please try again.',
      },
      settings: {
        title: 'Settings',
        language: 'Language',
        darkMode: 'Dark Mode',
        notifications: 'Notifications',
        soundEffects: 'Sound Effects',
        themeColor: 'Theme Color',
        close: 'Close',
        on: 'On',
        off: 'Off',
        hideHeaders: 'Hide Card Headers',
      },
      upgradeCard: {
        title: 'Upgrade Plan',
        subtitle: 'Compare Free vs Pro.',
        button: 'View Options',
      },
      controls: {
        resetModal: {
          title: 'Reset Dashboard Layout?',
          description:
            'Your data (tasks, notes, etc.) will be preserved, but widget positions will be reset.',
          confirm: 'Reset Layout',
          cancel: 'Cancel',
        },
        resetConfirm:
          'This will restore the default layout arrangement. Your custom changes will be lost.',
        focusMode: 'Focus Mode',
        exitFocus: 'Exit Focus',
        resetLayout: 'Reset Layout',
        customizeLayout: 'Change Layout',
        widgetVisibility: 'Show/Hide Cards',
        tip: 'Drag the header row to change the layout. Click the header row to hide or show the card. Drag the bottom right corner of the card to resize it.',
        dismissTip: 'Dismiss tip',
        tipToggle: {
          show: 'Show tips',
          hide: 'Hide tips',
        },
        joinGroup: 'Join Focus Lab WeChat',
      },
      common: {
        cancel: 'Cancel',
      },
      groupModal: {
        title: 'Join the NeuroHacks Lab WeChat Group',
        description:
          'Scan to join other Focus Lab users and swap ADHD productivity systems, rituals, and tools.',
        close: 'Close',
        qrAlt: 'WeChat QR code for the NeuroHacks community',
      },
      delete: {
        confirm: 'Remove this card?',
        desc: 'You can restore it by clicking "Reset Layout" at the top.',
        cancel: 'Cancel',
        confirmBtn: 'Remove',
      },

      promo: {
        proTip: 'Pro Tip',
        title: 'Curious about your focus levels?',
        description:
          'Run the same ASRS v1.1 screener clinicians use and get instant guidance on where to start.',
        button: 'Start Free Assessment',
      },
      seo: {
        title: 'How this ADHD Dashboard helps you focus',
        sonicShield: {
          title: '1. White Noise: Custom Soundscapes',
          content:
            'For many ADHD brains, silence is actually distracting. Every small sound becomes a potential interruption. Our White Noise player provides a range of "auditory masking" options including White Noise, Rain, Insects, Summer Night, Thunder, Waves, and Wind. These create a consistent sound blanket that covers up distracting background noises, reducing the cognitive load required to filter them out.',
        },
        pomodoro: {
          title: '2. Focus Timer: Conquer Time Blindness',
          content:
            '"Time Blindness" is a common struggle where the passage of time feels abstract. The Focus Timer externalizes time, making it visible and concrete. Working in short bursts (like 25 minutes) with guaranteed breaks helps maintain dopamine levels and prevents burnout.',
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
      tour: {
        welcome: {
          title: 'Welcome to Focus Lab',
          description: 'Let us show you around your new distraction-free workspace.',
        },
        grid: {
          title: 'Customizable Layout',
          description:
            'Drag the header of any card to move it. Drag the bottom-right corner to resize.',
        },
        sonic: {
          title: 'White Noise',
          description: 'Click the button on the middle right to flip cards and customize sounds.',
        },
        timer: {
          title: 'Focus Timer',
          description:
            'Click middle-right button to switch modes. Double-click "Custom" in Countdown to edit duration.',
        },
        todo: {
          title: 'To-Do List',
          description: 'Click the target icon next to a task to start a Focus Timer for it.',
        },
        brain: {
          title: 'Attention Hub',
          description:
            'Capture fleeting thoughts to prevent attention loss. You can paste text or images.',
        },
        breaker: {
          title: 'AI Task Breaker',
          description: 'Overwhelmed? Use AI to break big tasks into small, actionable steps.',
        },
        dopamine: {
          title: 'Dopamine Menu',
          description:
            'Need stimulation? Draw a random task. Click middle-right button to customize options.',
        },
        stats: {
          title: 'Focus Stats',
          description: 'View your deep work hours and energy patterns.',
        },
        goal: {
          title: 'Daily Goal',
          description: 'Set goals. Achieve any goal to trigger a reward animation!',
        },
        next: 'Next',
        prev: 'Previous',
        done: 'Done',
        skip: 'Skip Tour',
      },
    },
    auth: {
      loginTitle: 'Login to Access Stats',
      signupTitle: 'Create Account',
      loginDesc:
        'Please login to view your statistics and sync your focus sessions to the cloud across devices.',
      signupDesc: 'Sign up to start saving your data permanently.',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      processing: 'Processing...',
      orContinueWith: 'Or continue with',
      guestContinue: 'Continue as Guest',
      haveAccount: 'Already have an account? Sign in',
      noAccount: "Don't have an account? Sign up",
      checkEmailTitle: 'Check your email',
      checkEmailDesc:
        "We've sent a confirmation link to {email}. Click the link to verify your account and start syncing.",
      gotIt: 'Got it',
      error: 'Authentication failed',
      profile: {
        userFallback: 'User',
        platformStatus: 'Member Status',
        focusMember: 'Pro Member',
        freeMember: 'Free Member',
        editProfile: 'Edit Profile',
        signOut: 'Sign Out',
        avatar: 'User Avatar',
        uploadHint: 'Select color or upload image',
        uploadTooLarge: 'Image too large. Please use < 5MB.',
        uploadSuccess: 'Avatar updated successfully!',
        displayName: 'User Nickname',
        cancel: 'Cancel',
        saveChanges: 'Save Changes',
        saveErrorPrefix: 'Error saving profile: ',
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
            'My work is usually buttoned up',
            'Only if I’m exhausted or stressed',
            'Occasionally a loose end slips by',
            'I often need reminders to finish the last bits',
            'I rarely feel a project is truly finished',
          ],
        },
        {
          id: 2,
          text: 'How often do you have difficulty <strong>getting things in order</strong> when you have to do a task that requires <strong>organization</strong>?',
          isPartA: true,
          hints: [
            'Lists and systems come naturally',
            'Only complex projects throw me off',
            'I have to pause to figure out the plan',
            'Most tasks feel scattered without help',
            'I feel overwhelmed just thinking about organizing',
          ],
        },
        {
          id: 3,
          text: 'How often do you have problems <strong>remembering appointments or obligations</strong>?',
          isPartA: true,
          hints: [
            'My calendar is always up to date',
            'Rarely—I might forget a recurring task',
            'I need frequent reminders to stay on track',
            'Missed appointments happen a lot',
            'I forget commitments almost as soon as I make them',
          ],
        },
        {
          id: 4,
          text: 'When you have a task that requires <strong>a lot of thought</strong>, how often do you <strong>avoid or delay getting started</strong>?',
          isPartA: true,
          hints: [
            'I dive right in',
            'Only when the task is unclear',
            'I procrastinate unless there’s pressure',
            'The start line feels like a wall most days',
            'I routinely miss deadlines because I avoid the task',
          ],
        },
        {
          id: 5,
          text: 'How often do you <strong>fidget or squirm</strong> with your hands or feet when you have to sit down for a long time?',
          isPartA: true,
          hints: [
            'Sitting still isn’t a problem',
            'Only during very long meetings',
            'I shift around after a short while',
            'I’m constantly tapping or bouncing',
            'I can’t stay seated without moving',
          ],
        },
        {
          id: 6,
          text: 'How often do you feel <strong>overly active</strong> and compelled to do things, like you were <strong>driven by a motor</strong>?',
          isPartA: true,
          hints: [
            'My energy is steady and manageable',
            'I get revved up only on high-pressure days',
            'I feel “on” more often than not',
            'It’s hard to slow down even when I try',
            'I feel like I’m constantly running inside',
          ],
        },
        {
          id: 7,
          text: 'How often do you make <strong>careless mistakes</strong> when you have to work on a <strong>boring or difficult project</strong>?',
          isPartA: false,
          hints: [
            'My work is usually error-free',
            'Only when I’m extremely tired',
            'I occasionally miss small details',
            'I often have to double-check my work',
            'I make mistakes no matter how hard I try',
          ],
        },
        {
          id: 8,
          text: 'How often do you have difficulty <strong>keeping your attention</strong> when you are doing <strong>boring or repetitive work</strong>?',
          isPartA: false,
          hints: [
            'I stay focused regardless of the task',
            'Only mind-numbing tasks lose me',
            'I drift off unless I refocus often',
            'I struggle to finish repetitive work',
            'I can barely stick with repetitive tasks at all',
          ],
        },
        {
          id: 9,
          text: 'How often do you have difficulty <strong>concentrating on what people say</strong> to you, even when they are speaking to you directly?',
          isPartA: false,
          hints: [
            'I stay engaged when someone speaks',
            'Only in very noisy environments',
            'My mind wanders in longer conversations',
            'I miss key points unless I take notes',
            'It feels impossible to stay tuned in',
          ],
        },
        {
          id: 10,
          text: 'How often do you <strong>misplace or have difficulty finding things</strong> at home or at work?',
          isPartA: false,
          hints: [
            'Everything has a place and stays there',
            'Only occasional slip-ups',
            'I lose track unless I tidy constantly',
            'I’m always searching for essentials',
            'Items vanish the moment I set them down',
          ],
        },
        {
          id: 11,
          text: 'How often are you <strong>distracted by activity or noise</strong> around you?',
          isPartA: false,
          hints: [
            'Background noise rarely fazes me',
            'Only sudden or loud sounds derail me',
            'I need headphones to stay on task',
            'Most environments pull my focus away',
            'Every little sound feels disruptive',
          ],
        },
        {
          id: 12,
          text: 'How often do you <strong>leave your seat</strong> in meetings or other situations in which you are expected to remain seated?',
          isPartA: false,
          hints: [
            'I stay seated as expected',
            'Only in extra-long sessions',
            'I excuse myself once in a while',
            'I frequently need to stand or walk',
            'Sitting through a meeting feels impossible',
          ],
        },
        {
          id: 13,
          text: 'How often do you feel <strong>restless or fidgety</strong>?',
          isPartA: false,
          hints: [
            'I feel calm most of the time',
            'Only during stressful weeks',
            'There’s a mild buzz in my body',
            'Restlessness is my default state',
            'I rarely feel physically settled',
          ],
        },
        {
          id: 14,
          text: 'How often do you have difficulty <strong>unwinding and relaxing</strong> when you have time to yourself?',
          isPartA: false,
          hints: [
            'Downtime actually relaxes me',
            'It takes a few minutes to settle',
            'I need rituals to shut my brain off',
            'Relaxing feels like another task',
            'I can’t switch off, even alone',
          ],
        },
        {
          id: 15,
          text: 'How often do you find yourself <strong>talking too much</strong> when you are in social situations?',
          isPartA: false,
          hints: [
            'I match the pacing of the room',
            'Only when I’m extra excited',
            'Sometimes I realize I’m rambling',
            'Friends gently ask me to slow down',
            'I dominate conversations without meaning to',
          ],
        },
        {
          id: 16,
          text: "When you're in a conversation, how often do you find yourself <strong>finishing the sentences</strong> of the people you are talking to, before they can finish them themselves?",
          isPartA: false,
          hints: [
            'I rarely jump in prematurely',
            'Only with close friends or family',
            'Sometimes I blurt the ending for others',
            'I do it enough that people notice',
            'I constantly finish people’s sentences',
          ],
        },
        {
          id: 17,
          text: 'How often do you have difficulty <strong>waiting your turn</strong> in situations when turn taking is required?',
          isPartA: false,
          hints: [
            'Lines and queues don’t bother me',
            'Only when I’m in a major rush',
            'I get antsy unless I’m distracted',
            'Waiting my turn feels uncomfortable',
            'I have to move ahead or tap out somehow',
          ],
        },
        {
          id: 18,
          text: 'How often do you <strong>interrupt others</strong> when they are busy?',
          isPartA: false,
          hints: [
            'I respect people’s space and focus',
            'Only if I urgently need something',
            'Sometimes I pop in mid-task',
            'Interrupting happens most days',
            'I constantly cut people off without meaning to',
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
          guide: '📚 Recommended: Quiet Fidget Toy Guide',
          home: 'Back to Home',
        },
      },
      guide: {
        accuracy: {
          title: 'How to get accurate results?',
          text: "Please answer based on your experiences over the past 6 months. Try to avoid answering based on how you 'wish' you were.",
        },
        scoring: {
          title: 'Scoring Guide',
          text: 'This test uses the ASRS v1.1 logic. Part A (first 6 questions) is the primary screener.',
        },
        nextSteps: {
          title: 'What if the risk is high?',
          text: 'This is not a diagnosis. We recommend printing your results and sharing them with a licensed professional.',
        },
        privacy: {
          title: 'Data Privacy',
          text: 'Your answers are processed locally in your browser. No personal data leaves your device.',
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

    tools: {
      dopamine: {
        metaTitle: 'Dopamine Menu Spinner',
        metaDescription:
          'Spin a wheel of science-backed micro-activities whenever your ADHD brain craves dopamine.',
        eyebrow: 'Micro Tool',
        title: 'The Dopamine Menu',
        subtitle: "Don't doom-scroll. Spin the wheel.",
        question: 'How much time/energy do you have?',
        nowServingEyebrow: 'Now Serving',
        resultEyebrow: 'Your pull',
        spinButton: 'Give me a hit',
        emptyHistory: 'Spin the wheel to log your dopamine hits.',
        energyModes: {
          low: {
            label: 'Low',
            selectorHint: 'Quick Hit (5 mins)',
            description: 'Micro hits to re-engage your brain without spending a ton of energy.',
            activities: [
              'Drink water',
              'Stretch it out',
              '5 jumping jacks',
              'Pet the cat',
              'Deep belly breaths',
              'Sip a hot drink',
            ],
          },
          medium: {
            label: 'Medium',
            selectorHint: 'Sensory Reset',
            description: 'Regulate your nervous system with tactile or sensory boosts.',
            activities: [
              'Cold water on your face',
              'Wrap up in a weighted blanket',
              'Blast your hype playlist',
              'Diffuse a citrus scent',
            ],
          },
          high: {
            label: 'High',
            selectorHint: 'Deep Dive (30+ mins)',
            description: 'Lean into the hyperfocus with immersive, soul-filling work.',
            activities: [
              'Read a chapter',
              'Sketch or draw',
              'Walk outside',
              'Tidy one zone',
              'Cook something cozy',
            ],
          },
        },
      },
      noise: {
        metaTitle: 'Deep Focus Noise Generator',
        metaDescription:
          'Loop brown, pink, or white noise to mask distractions and enter deep work.',
        eyebrow: 'Deep Work Utility',
        title: 'Deep Focus Noise Generator',
        subtitle: 'Select a color frequency to mask distractions.',
        nowPlayingEyebrow: 'Now Playing',
        colorLabel: 'Color',
        whyItWorksEyebrow: 'Why it works',
        whyItWorksDescription:
          "Brown noise (low frequency) is often preferred by ADHD brains because it dampens the 'internal monologue' and creates a consistent sound blanket, unlike white noise which can be too harsh.",
        controls: {
          playLabel: 'Play noise',
          pauseLabel: 'Pause noise',
          volumeLabel: 'Volume',
        },
        playerLabel: 'Focus noise player',
        tracks: {
          brown: {
            label: 'Brown Noise',
            sublabel: 'Deep rumble for silencing mental chatter',
          },
          pink: {
            label: 'Pink Noise',
            sublabel: 'Balanced rain-like bed for gentle focus',
          },
          white: {
            label: 'White Noise',
            sublabel: 'Bright static to mask office conversations',
          },
        },
      },
    },
    userMenu: {
      signedInAs: 'Signed in as',
      profile: 'Profile & Settings',
      upgrade: 'Upgrade / Plan',
      signOut: 'Sign Out',
      proBadge: 'PRO',
    },
    comparePlans: {
      title: 'Compare Plans',
      subtitle: 'Unlock your full potential with Pro.',
      columns: {
        feature: 'Feature',
        free: 'Free',
        pro: 'Pro',
      },
      features: {
        focusWidgets: 'Focus Widgets',
        cloudSync: 'Cloud Sync',
        stats: 'Statistics & Analytics',
        customBackgrounds: 'Custom Backgrounds',
        aiTaskBreaker: 'AI Task Breaker',
        prioritySupport: 'Priority Support',
        unlimitedTasks: 'Task Quantity',
      },
      values: {
        basic: 'Basic',
        allAccess: 'All Access',
        limit20: 'Max 20',
        unlimited: 'Unlimited',
        inDev: 'In Dev',
        limit10: 'Max 10',
        limitedTimes: 'Limited',
        threePerDay: '3 times/day',
        limited: 'Limited',
      },
      intervals: {
        month: 'Monthly',
        year: 'Yearly',
        monthShort: 'month',
        yearShort: 'year',
      },
      billing: {
        cancelAnytime: '7-day free trial, cancel anytime.',
        savePercent: '-17%',
      },
      cta: {
        startTrial: 'Start 7-Day Free Trial',
      },
      beta: {
        msgPre: 'Good News! You are currently on the ',
        planName: 'Internal Beta Plan',
        msgPost: '.',
        description: 'Enjoy all Pro features for free during this period.',
      },
    },
    userProfile: {
      betaBadge: 'Pro Plan (Internal Beta)',
      betaDescription: 'All features are currently free.',
    },
    focusLabLanding: {
      hero: {
        newVersion: 'v1.0 Internal Beta: New Interface & Focus Stats',
        titlePre: 'Lock Your Attention in',
        titlePost: 'Focus Lab',
        descPre: 'Stop fighting your brain. The',
        descHighlight: 'Electronic Workstation',
        descPost: 'designed for ADHD minds to reduce attention loss from screen switching.',
        enterBtn: 'Enter Focus Lab',
        noCreditCard: 'No registration required · Instant access',
        screenshotPlaceholder: 'Dashboard Screenshot will be placed here',
      },
      painPoints: {
        title: 'Why traditional productivity tools fail us',
        desc: "Standard tools aren't built for neurodivergent minds.",
        items: [
          {
            title: 'Attention Loss',
            desc: "Too many tabs open in your brain? You freeze and do nothing because you don't know where to start.",
          },
          {
            title: 'Dopamine Traps',
            desc: 'Checking one notification turns into 2 hours of doom-scrolling before you realize it.',
          },
          {
            title: 'Time Blindness',
            desc: 'Thinking a task will take 5 minutes when it takes 50, leading to chronic lateness and guilt.',
          },
          {
            title: 'Task Paralysis',
            desc: 'Hard to start? Break down any difficult task into small, actionable steps immediately.',
          },
        ],
      },
      howItWorks: {
        title: 'How to Enter Flow State',
        steps: [
          {
            title: 'Attention Hub',
            desc: 'Clear your mental RAM. Capture distracting thoughts here to deal with them later.',
          },
          {
            title: 'White Noise',
            desc: 'Turn on white noise or brainwave audio to physically shield yourself from auditory distractions.',
          },
          {
            title: 'Focus Timer',
            desc: 'Start the focus clock to quickly switch your state into focus mode.',
          },
        ],
      },
      features: {
        title: "Everything you need, nothing you don't",
        items: [
          {
            title: 'Focus Timer',
            desc: 'A flexible timer that helps you track focused work sessions.',
          },
          {
            title: 'Task Breaker',
            desc: 'AI-powered tool that crushes intimidating tasks into tiny, manageable steps.',
          },
          {
            title: 'Dopamine Menu',
            desc: 'A menu of healthy rewards to boost energy without getting sucked into social media.',
          },
          {
            title: 'Focus Stats',
            desc: 'Track your deep work hours and energy patterns over time.',
          },
        ],
      },
      testimonials: {
        title: 'Trusted by 1,000+ ADHDers',
        items: [
          {
            quote: '“With the White Noise tool, I wrote 4 chapters in a week. Magic.”',
            name: 'Sarah J.',
            role: 'Writer',
          },
          {
            quote: '“The Attention Hub saved me during finals. My anxiety was cut in half.”',
            name: 'David L.',
            role: 'Student',
          },
          {
            quote:
              "“Finally a dashboard that doesn't feel cluttered. Just looking at it calms me.”",
            name: 'Elena R.',
            role: 'Developer',
          },
          {
            quote: '“I recommend Focus Lab to all my clients. It builds the right rituals.”',
            name: 'Mike T.',
            role: 'ADHD Coach',
          },
        ],
      },
      faq: {
        title: 'Frequently Asked Questions',
        items: [
          {
            question: 'Is Focus Lab free?',
            answer: 'Yes! It is completely free to use. No credit card required.',
          },
          {
            question: 'Do I need to create an account?',
            answer:
              'No. You can use it instantly as a guest. Your data is stored locally in your browser.',
          },
          {
            question: 'Does this really help with ADHD?',
            answer:
              'Yes, it is designed with high-stimulation control in mind, making it perfect for ADHD brains.',
          },
          {
            question: ' What devices does it work on?',
            answer:
              'It works on any modern web browser on desktop and mobile (Chrome, Safari, Edge, Firefox).',
          },
        ],
      },
      cta: {
        title: 'Ready to reclaim your attention?',
        button: 'Start Focusing - Free',
      },
    },
  },
  zh: {
    nav: {
      test: 'ADHD 自测',
      focusLab: 'Focus Lab',
      guides: '指南',
      about: '关于',
      home: '首页',
      blog: '指南',
      privacy: '隐私政策',
    },
    home: {
      heroTitle: 'NeuroHacks Lab',
      heroDesc: '专为 ADHD 大脑设计的工具与策略',
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
        exploreGuides: '查看指南',
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
            a: '如果分数较高，建议咨询精神科医师。同时，你可以直接使用我们的 [Focus Lab](/focuslab) 并阅读相关指南，立即开始尝试缓解注意力分散的问题。',
          },
        ],
      },
      blog: {
        tagline: 'ADHD 必备工具',
        title: '最新发布与深度指南',
        desc: '关于感官调节、专注仪式和 ADHD 友好型效率系统的深度解析。',
        noPosts: '暂无文章',
        readMore: '阅读更多',
        allPosts: '所有文章',
      },
    },
    guides: {
      metaTitle: 'ADHD 指南与产品评测',
      metaDescription: '浏览 NeuroHacks Lab 撰写的 ADHD 友好型装备评测、低刺激日常与感官调节指南。',
      pageTitle: '全部指南与评测',
      list: {
        allPosts: '所有文章',
        prev: '上一页',
        next: '下一页',
        pagination: '第 {current} / {total} 页',
        filterLabel: '按标签筛选文章',
        tagLabel: '查看 {tag} 标签文章',
        readMore: '阅读更多',
        readMoreLabel: '阅读更多：{title}',
      },
    },
    tags: {
      metaTitle: '按主题浏览 ADHD 资源',
      metaDescription: '按主题查找 ADHD 工具、日常系统与感官调节装备。',
      eyebrow: '主题',
      title: '探索主题',
      description: '按照类别浏览我们不断扩展的指南、评测与实战技巧。',
      empty: '暂无主题',
      cardDescription: '围绕 {tag} 精选的洞察与指南。',
      cardAria: '查看 {tag} 标签文章',
      single: '篇文章',
      plural: '篇文章',
    },
    notFound: {
      title: '抱歉，页面不存在。',
      description: '别担心，可以回到首页继续探索。',
      cta: '返回首页',
    },
    sounds: {
      insects: '昆虫',
      rain: '雨声',
      'summer-night': '夏夜',
      thunder: '雷声',
      waves: '海浪',
      'white-noise': '白噪音',
      wind: '风声',
      brown: '棕噪音',
      pink: '粉噪音',
      white: '白噪音',
    },
    focusLab: {
      header: {
        eyebrow: 'Focus Lab',
        title: '你的 ADHD 沉浸式工作台',
        description:
          '专为多动大脑设计的“专注避难所”。无需在不同 App 间来回切换，这里集成了注意力中转站、今日待办、白噪音、专注时钟和AI任务拆解等工具。\n这就是你的私人任务控制中心，帮你屏蔽干扰，找回掌控感。',
        stats: '统计',
      },
      stats: {
        dailyGoal: '每日目标',
      },
      sidebar: {
        focusTools: '专注工具',
        dailyGoal: '今日目标',
        planComparison: '版本对比',
        proMember: 'Pro 会员',
        freePlan: '免费版',
      },
      loading: {
        title: '正在加载 Focus Lab',
        description: '正在搭建你的无干扰工作台...',
      },
      widgets: {
        sonicShield: {
          title: '白噪音',
          subtitle: '混合自定义声景以阻挡干扰',
          selectSounds: '选择声音',
          active: '活跃',
          volume: '音量',
          settings: {
            title: '设置',
            darkMode: '深色模式',
            notifications: '通知提醒',
            soundEffects: '音效',
            themeColor: '主题色',
            close: '关闭',
            on: '开启',
            off: '关闭',
            hideHeaders: '隐藏卡片标题',
          },
          upgradeCard: {
            title: '升级计划',
            subtitle: '对比 Free 与 Pro 版差异',
            button: '查看详情',
          },
        },
        timer: {
          title: '专注时钟',
          custom: '自定义',
          switchMode: '切换模式',
          subtitle: '记录时间，管理精力。',
          settings: '设置',
          stopwatchDesc: '正向计时以记录专注时长。',
          countdownDesc: '倒计时一段设定的时间。',
          presets: {
            focus: '专注',
            short: '短休息',
            long: '长休息',
          },
          countdown: '倒计时',
          stopwatch: '正向计时',
          set: '设置',
          reset: '重置',
          pause: '暂停',
          start: '开始',
          resume: '继续',
          endSession: '结束',
          congratulations: '恭喜',
          continueFocus: '我还能行',
          endFocus: '结束专注',
          done: '又完成了一次专注',
          ready: '准备开始',
          recording: '正在记录',
          decisionPrompt: {
            continueFocus: '继续专注',
            plusFive: '再来5m',
            takeBreak: '休息5m',
          },
          todayFocus: '今日专注：{minutes}分钟',
          tipTitle: '点击标题切换任务显示',
          tipCustom: '双击自定义计时器进行编辑',
          accessibility: {
            showDailyFocus: '显示今日专注分钟数',
            showTimer: '返回倒计时显示',
          },
        },
        taskBreaker: {
          title: 'AI 任务拆解',
          subtitle:
            '输入复杂任务，让 AI 将其拆解为可执行的步骤。生成的步骤出现后，点击右上角的箭头即可同步到今日待办。',
          overwhelmed: '感到不知所措？',
          description: '在下方输入你害怕的大任务，我会把它拆解成微小、不可怕的步骤。',
          placeholder: '例如：打扫整个公寓...',
          button: '拆解任务',
          currentMission: '当前任务',
          newTask: '新任务',
          transferButton: '一键添加到待办',
          transferInProgress: '添加中...',
          transferSuccess: '已将拆解步骤加入待办清单。',
          transferError: '写入待办清单失败，请重试。',
          summoning: '正在召唤小精灵...',
          failed: '召唤失败，请重试',
          mockSteps: ['启动计时器（5分钟）', '迈出第一步', '深呼吸', '继续加油'],
        },
        brainDump: {
          title: '注意力中转站',
          subtitle: '清空大脑，捕捉想法',
          emptyTitle: '你的大脑很清醒',
          emptySubtitle: '随时捕捉闪现的灵感',
          placeholder: '在这里输入文本或粘贴图片...',
          accessibility: {
            addThought: '添加便签',
            clearBoard: '清空所有便签',
            removeImage: '移除图片预览',
            moveToOtherColumn: '移动到另一列',
            deleteNote: '删除便签',
          },
        },
        dopamineMenu: {
          title: '多巴胺菜单',
          subtitle: '随机选择一项快速活动以恢复精力',
          spinning: '旋转中...',
          ready: '准备抽卡',
          button: '给我多巴胺',
          spinButton: '给我多巴胺',
          addPlaceholder: '添加选项...',
          add: '添加',
          accessibility: {
            removeOption: '删除选项',
          },
          defaultOptions: [
            '喝水 💧',
            '伸展 🧘',
            '5个开合跳 🏃',
            '查收1封邮件 📧',
            '深呼吸 🌬️',
            '摸摸猫/狗 🐶',
          ],
          needBoost: '需要动力？',
          needBoostDesc: '随机获取一个简单的快乐。',
          getDopamine: '获取多巴胺',
          spinAgain: '再抽一次',
          done: '完成',
          edit: '编辑选项',
          back: '返回',
        },
        todo: {
          title: '待办清单',
          subtitle: '每日核心任务清单。点击任务右侧的瞄准图标，即可将其载入专注时钟。',
          placeholder: '添加新任务...',
          emptyTitle: '暂无任务',
          emptySubtitle: '添加任务开始新的一天',
          focusTooltip: '专注此任务',
        },
      },
      promo: {
        proTip: '专业提示',
        title: 'ADHD 专注力提升',
        description: '参加我们的免费 ADHD 测试，了解您独特的认知特征并获取个性化策略。',
        button: '开始免费测试',
      },
      errors: {
        migrationFailed: '迁移失败，请重试。',
      },
      settings: {
        title: '设置',
        language: '语言',
        darkMode: '深色模式',
        notifications: '通知提醒',
        soundEffects: '音效',
        themeColor: '主题色',
        close: '关闭',
        on: '开启',
        off: '关闭',
        hideHeaders: '隐藏卡片标题',
      },
      upgradeCard: {
        title: '升级计划',
        subtitle: '对比 Free 与 Pro 版差异',
        button: '查看详情',
      },
      controls: {
        resetModal: {
          title: '重置布局？',
          description: '您的数据（任务、便签等）将被保留，但卡片位置将被重置。',
          confirm: '重置',
          cancel: '取消',
        },
        resetConfirm: '此操作将恢复默认布局，您的自定义更改将会丢失。',
        focusMode: '专注模式',
        exitFocus: '退出专注',
        resetLayout: '重置布局',
        customizeLayout: '更改布局',
        widgetVisibility: '显示/隐藏卡片',
        tip: '拖动标题行来改变布局。点击标题行来隐藏或者显示这个卡片。拖动卡片右下角来改变卡片大小。',
        dismissTip: '关闭提示',
        tipToggle: {
          show: '显示提示',
          hide: '收起提示',
        },
        joinGroup: '加入 Focus Lab 微信群',
      },
      common: {
        cancel: '取消',
      },

      groupModal: {
        title: '加入 NeuroHacks Lab 微信群',
        description: '微信扫码进群，与其他 Focus Lab 用户一同交流 ADHD 效率工具。',
        close: '关闭',
        qrAlt: 'NeuroHacks 微信交流群二维码',
      },
      delete: {
        confirm: '删除此卡片？',
        desc: '您可以通过点击顶部的“重置布局”来恢复它。',
        cancel: '取消',
        confirmBtn: '删除',
      },
      seo: {
        title: '这个 ADHD 仪表盘如何帮助你专注',
        sonicShield: {
          title: '1. 白噪音：自定义声景',
          content:
            '对于许多 ADHD 大脑来说，死寂实际上是分心的。每一个细小的声音都可能成为干扰。我们的白噪音播放器提供一系列“听觉掩蔽”选项，包括白噪音、雨声、昆虫声、夏夜、雷声、海浪和风声。它们创造了一层持续的声音毯子，覆盖住令人分心的背景噪音，减少过滤噪音所需的认知负荷。',
        },
        pomodoro: {
          title: '2. 专注时钟：战胜时间盲区',
          content:
            '“时间盲区”是一个常见的挣扎，时间的流逝感觉很抽象。专注时钟将时间外化，使其可见且具体。短时间爆发式工作（如 25 分钟）并保证休息，有助于维持多巴胺水平并防止倦怠。',
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
              q: 'Focus Lab 是免费的吗？',
              a: '是的，Focus Lab 完全免费使用。它完全在你的浏览器中运行。',
            },
            {
              q: '如何在桌面端更好地使用 Focus Lab？',
              a: '在 Chrome、Edge 等现代浏览器中使用“安装”或“添加到 Dock/任务栏”的功能，将 Focus Lab 保存为桌面应用，就能像普通软件一样一键启动，保持沉浸体验。',
            },
            {
              q: '我需要下载什么吗？',
              a: '无需下载。它适用于桌面和移动设备上的任何现代网络浏览器（Chrome, Safari, Firefox, Edge）。',
            },
          ],
        },
      },
      tour: {
        welcome: {
          title: '欢迎来到 Focus Lab',
          description: '让我们带您快速了解您的新专注空间。',
        },
        grid: {
          title: '自定义布局',
          description: '拖动每个卡片的标题栏可移动组件，拖动卡片右下角可调整大小。',
        },
        sonic: {
          title: '白噪音',
          description: '点击卡片右侧中部的按钮来翻转卡片，挑选您喜欢的白噪音。',
        },
        timer: {
          title: '专注时钟',
          description: '记录专注时间。点击右侧中部按钮切换模式，双击倒计时“自定义”可设定时长。',
        },
        todo: {
          title: '待办清单',
          description: '管理每日任务。点击任务右侧的目标图标，可为该任务开启专注时钟。',
        },
        brain: {
          title: '注意力中转站',
          description: '快速记录稍纵即逝的想法，清空大脑避免分心。可以粘贴文字或图片。',
        },
        breaker: {
          title: 'AI 任务拆解',
          description: '感到不知所措？使用 AI 将大任务拆解为小步骤。',
        },
        dopamine: {
          title: '多巴胺菜单',
          description: '需要刺激？抽取随机任务。点击右侧中部按钮来自定义您的选项。',
        },
        stats: {
          title: '专注统计',
          description: '查看您的深度工作时长和能量分布。',
        },
        goal: {
          title: '每日目标',
          description: '设定并追踪目标。完成任意目标即可获得相应的奖励！',
        },
        next: '下一步',
        prev: '上一步',
        done: '完成',
        skip: '跳过引导',
      },
    },
    test: {
      title: '成人 ADHD 在线免费自测',
      subtitle: 'ASRS-v1.1',
      description:
        '通过 18 道基于临床标准的问题，科学评估您的日常行为模式与成人 ADHD 典型症状的契合度。',
      start: '开始自评 →',
      meta: '2分钟 · 无需邮箱 · 无需注册',
      questions: [
        {
          id: 1,
          text: '一旦完成任何计划中最具挑战的部分之后，你会多常有<strong>完成计划最后细节</strong>的困难？',
          isPartA: true,
          hints: [
            '我的工作通常都很完美',
            '只有在疲惫或压力大时',
            '偶尔会漏掉一些细节',
            '我经常需要提醒才能完成最后的部分',
            '我很少觉得项目真正完成了',
          ],
        },
        {
          id: 2,
          text: '当必须从事需要<strong>有组织规划性</strong>的任务时，你会多常有困难<strong>井然有序</strong>地去做？',
          isPartA: true,
          hints: [
            '列表和系统对我来说很自然',
            '只有复杂的项目会让我乱套',
            '我必须停下来弄清楚计划',
            '没有帮助的话，大多数任务感觉很散乱',
            '一想到整理我就感到不知所措',
          ],
        },
        {
          id: 3,
          text: '你会多常有问题去<strong>记得约会或是必须要做的事</strong>？',
          isPartA: true,
          hints: [
            '我的日历总是最新的',
            '很少——我可能会忘记重复的任务',
            '我需要经常提醒才能保持正轨',
            '经常错过约会',
            '我几乎一做出承诺就忘记了',
          ],
        },
        {
          id: 4,
          text: '当有一件需要<strong>多费心思思考</strong>的工作时，你会多常<strong>逃避或是延后开始</strong>去做？',
          isPartA: true,
          hints: [
            '我直接开始',
            '只有当任务不清楚时',
            '除非有压力，否则我会拖延',
            '起跑线在大多数时候感觉像一堵墙',
            '我经常因为回避任务而错过截止日期',
          ],
        },
        {
          id: 5,
          text: '当你必须<strong>长时间坐着</strong>时，你会多常<strong>坐立不安或扭动手脚</strong>？',
          isPartA: true,
          hints: [
            '坐着不动不是问题',
            '只有在非常长的会议中',
            '过一会儿我就开始动来动去',
            '我一直在敲击或抖动',
            '我不动就坐不住',
          ],
        },
        {
          id: 6,
          text: '你会多常像<strong>被马达所驱动</strong>一样，觉得自己<strong>过度地活跃</strong>，不得不做事情？',
          isPartA: true,
          hints: [
            '我的精力稳定且可控',
            '只有在高压的日子里我才会兴奋',
            '我经常感觉处于“开启”状态',
            '即使我尝试，也很难慢下来',
            '我感觉内心一直在奔跑',
          ],
        },
        {
          id: 7,
          text: '当必须进行一件<strong>枯燥或困难</strong>的计划时，你会多常<strong>粗心犯错</strong>？',
          isPartA: false,
          hints: [
            '我的工作通常没有错误',
            '只有当我非常累的时候',
            '我偶尔会漏掉小细节',
            '我经常需要反复检查我的工作',
            '无论我多努力，我都会犯错',
          ],
        },
        {
          id: 8,
          text: '当正在做<strong>枯燥或重复性</strong>的工作时，你会多常有<strong>持续专注的困难</strong>？',
          isPartA: false,
          hints: [
            '无论任务如何，我都能保持专注',
            '只有令人麻木的任务会让我分心',
            '除非我经常重新聚焦，否则我会走神',
            '我很难完成重复性工作',
            '我几乎完全无法坚持做重复性任务',
          ],
        },
        {
          id: 9,
          text: '即使有人直接对你说话，你会多常有困难<strong>专注于别人跟你讲话的内容</strong>？',
          isPartA: false,
          hints: [
            '当有人说话时，我会保持专注',
            '只有在非常嘈杂的环境中',
            '在较长的对话中我会走神',
            '除非我做笔记，否则我会错过关键点',
            '感觉不可能一直听进去',
          ],
        },
        {
          id: 10,
          text: '在家里或是在工作时，你会多常<strong>没有把东西放对地方或是找不到东西</strong>？',
          isPartA: false,
          hints: [
            '每样东西都有位置，并且都在那里',
            '只有偶尔的失误',
            '除非我不断整理，否则我会找不到东西',
            '我总是在寻找必需品',
            '物品一放下就消失了',
          ],
        },
        {
          id: 11,
          text: '你会多常因身旁的<strong>活动或声音而分心</strong>？',
          isPartA: false,
          hints: [
            '背景噪音很少困扰我',
            '只有突然或巨大的声音会打断我',
            '我需要耳机才能保持专注',
            '大多数环境都会分散我的注意力',
            '每一个小声音都感觉具有破坏性',
          ],
        },
        {
          id: 12,
          text: '你会多常在开会时或在其他<strong>被期待坐好的场合中离开座位</strong>？',
          isPartA: false,
          hints: [
            '我按要求坐着',
            '只有在超长的会议中',
            '我偶尔会离开一下',
            '我经常需要站起来或走动',
            '坐着开会感觉是不可能的',
          ],
        },
        {
          id: 13,
          text: '你会多常觉得<strong>静不下来或烦躁不安</strong>？',
          isPartA: false,
          hints: [
            '我大部分时间都感到平静',
            '只有在压力大的一周里',
            '我的身体里有一种轻微的嗡嗡声',
            '坐立不安是我的常态',
            '我很少感到身体安顿下来',
          ],
        },
        {
          id: 14,
          text: '当有自己独处的时间时，你会多常觉得有困难<strong>使自己平静和放松</strong>？',
          isPartA: false,
          hints: [
            '休息时间确实让我放松',
            '需要几分钟才能安定下来',
            '我需要仪式来关闭大脑',
            '放松感觉像是另一项任务',
            '即使独自一人，我也无法关闭',
          ],
        },
        {
          id: 15,
          text: '在社交场合中，你会多常发现自己<strong>话讲得太多</strong>？',
          isPartA: false,
          hints: [
            '我配合房间的节奏',
            '只有当我特别兴奋的时候',
            '有时我意识到自己在喋喋不休',
            '朋友们温和地让我慢下来',
            '我无意中主导了对话',
          ],
        },
        {
          id: 16,
          text: '当与他人交谈时，你会多常<strong>在别人还没把话讲完前就插嘴或接话替对方把话讲完</strong>？',
          isPartA: false,
          hints: [
            '我很少过早插话',
            '只有和亲密的朋友或家人在一起时',
            '有时我会脱口而出别人的话',
            '我经常这样做，以至于别人注意到了',
            '我经常抢着把别人的话说完',
          ],
        },
        {
          id: 17,
          text: '在需要轮流排队的场合时，你会多常有困难<strong>轮流等待</strong>？',
          isPartA: false,
          hints: [
            '排队对我来说没问题',
            '只有当我非常赶时间的时候',
            '除非我分心，否则我会坐立不安',
            '等待轮到我感觉很不舒服',
            '我必须提前行动或以某种方式退出',
          ],
        },
        {
          id: 18,
          text: '你会多常在别人忙碌时<strong>打断别人</strong>？',
          isPartA: false,
          hints: [
            '我尊重别人的空间和专注',
            '只有当我急需某样东西时',
            '有时我会在任务中途突然介入',
            '打断别人是常有的事',
            '我经常无意中打断别人',
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
            description: '您的症状在典型范围内',
          },
          medium: {
            label: '可能有 ADHD',
            description: '您表现出的迹象可能会影响您的日常生活',
          },
          high: {
            label: '高度符合 ADHD 特征',
            description: '您的症状很显著。我们建议咨询专业人士',
          },
        },
        cta: {
          title: '准备好进入状态了吗？访问您的个人专注仪表盘。',
          button: '进入 Focus Lab →',
          retake: '重新测试',
          guide: '📚 推荐阅读：静音解压玩具指南',
          home: '返回首页',
        },
      },
      guide: {
        accuracy: {
          title: '如何获得最准确的结果？',
          text: '请根据您过去 6 个月的经历回答。尽量避免根据您“希望”的样子来回答。',
        },
        scoring: {
          title: '评分标准说明',
          text: '本测试使用 ASRS v1.1 逻辑。A 部分（前 6 个问题）是主要的筛查工具。',
        },
        nextSteps: {
          title: '如果结果显示高风险怎么办？',
          text: '这不是诊断。我们建议打印您的结果并与持证专业人士分享。',
        },
        privacy: {
          title: '数据隐私',
          text: '您的答案在浏览器本地处理。没有任何个人数据会离开您的设备。',
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
    auth: {
      loginTitle: '登录以查看统计数据',
      signupTitle: '创建账户',
      loginDesc: '请登录以查看您的统计数据，并将您的专注会话同步到云端，实现多设备共享。',
      signupDesc: '注册账户，永久保存您的数据。',
      email: '邮箱',
      password: '密码',
      signIn: '登录',
      signUp: '注册',
      processing: '处理中...',
      orContinueWith: '其他登录方式',
      guestContinue: '以游客身份继续',
      haveAccount: '已有账户？登录',
      noAccount: '还没有账户？注册',
      checkEmailTitle: '请检查您的邮箱',
      checkEmailDesc: '我们已向 {email} 发送了确认链接。点击链接验证您的账户并开始同步。',
      gotIt: '知道了',
      error: '认证失败',
      profile: {
        userFallback: '用户',
        platformStatus: '会员状态',
        focusMember: '高级版会员',
        freeMember: '免费会员',
        editProfile: '编辑档案',
        signOut: '退出登录',
        avatar: '用户头像',
        uploadHint: '选择颜色或上传头像',
        uploadTooLarge: '图片过大，请使用小于 5MB 的文件。',
        uploadSuccess: '头像更新成功！',
        displayName: '用户昵称',
        cancel: '取消',
        saveChanges: '保存修改',
        saveErrorPrefix: '保存档案出错：',
      },
    },
    tools: {
      dopamine: {
        metaTitle: '多巴胺菜单旋转器',
        metaDescription: '当 ADHD 大脑渴望刺激时，随机抽取一项经验证的微活动来补充多巴胺。',
        eyebrow: '微型工具',
        title: '多巴胺菜单',
        subtitle: '别再刷短视频了，抽一张卡就动起来。',
        question: '你现在的时间/能量是多少？',
        nowServingEyebrow: '现在供应',
        resultEyebrow: '你的抽卡',
        spinButton: '给我多巴胺',
        emptyHistory: '转动转盘即可记录你的多巴胺任务。',
        energyModes: {
          low: {
            label: '低能量',
            selectorHint: '快速回血（5分钟）',
            description: '用最小的能量重新启动大脑，不造成额外负担。',
            activities: ['喝水', '伸展身体', '5个开合跳', '撸猫/狗', '深呼吸', '喝一口热饮'],
          },
          medium: {
            label: '中等',
            selectorHint: '感官重启',
            description: '用触觉或感官刺激来调节神经系统。',
            activities: ['用冷水洗脸', '裹上重力毯', '播放打气歌单', '扩香柑橘味'],
          },
          high: {
            label: '高能量',
            selectorHint: '深潜模式（30+分钟）',
            description: '把高能量导入沉浸式的、滋养心灵的项目。',
            activities: ['读一章书', '随手速写', '走到户外', '整理一个角落', '做一道治愈料理'],
          },
        },
      },
      noise: {
        metaTitle: '深度专注噪音发生器',
        metaDescription: '循环播放棕噪、粉噪或白噪音，屏蔽干扰进入深度工作。',
        eyebrow: '深度工作工具',
        title: '深度专注噪音发生器',
        subtitle: '选择一个频段来屏蔽干扰。',
        nowPlayingEyebrow: '当前播放',
        colorLabel: '频段',
        whyItWorksEyebrow: '为什么有效',
        whyItWorksDescription:
          '棕噪音（低频）更受 ADHD 大脑青睐，因为它能压低“内部独白”，形成稳定的声音毯，而白噪音往往过于刺耳。',
        settings: {
          title: '设置',
          darkMode: '深色模式',
          notifications: '通知提醒',
          soundEffects: '音效',
          themeColor: '主题色',
          close: '关闭',
          on: '开启',
          off: '关闭',
          hideHeaders: '隐藏卡片标题',
        },
        upgradeCard: {
          title: '升级计划',
          subtitle: '对比 Free 与 Pro 版差异',
          button: '查看详情',
        },
        dopamineMenu: {
          title: '多巴胺菜单',
          subtitle: '随机抽取一个小活动来恢复精力。',
          spinning: '抽取中...',
          ready: '准备就绪',
          button: '给我多巴胺',
          addPlaceholder: '添加选项...',
          add: '添加',
          accessibility: {
            removeOption: '移除选项',
          },
          needBoost: '需要充能？',
          needBoostDesc: '随机获取一个简单的快乐源泉。',
          getDopamine: '获取多巴胺',
          spinAgain: '再抽一次',
          done: '完成',
          edit: '编辑选项',
          back: '返回',
        },
        controls: {
          playLabel: '播放噪音',
          pauseLabel: '暂停噪音',
          volumeLabel: '音量',
        },
        playerLabel: '专注噪音播放器',
        tracks: {
          brown: {
            label: '棕噪音',
            sublabel: '深沉的隆隆声，消除脑内杂音',
          },
          pink: {
            label: '粉噪音',
            sublabel: '平衡的落雨声，温柔包裹注意力',
          },
          white: {
            label: '白噪音',
            sublabel: '明亮静电声，遮蔽办公室闲聊',
          },
        },
      },
    },
    userMenu: {
      signedInAs: '登录身份',
      profile: '个人资料与设置',
      upgrade: '升级 / 计划',
      signOut: '退出登录',
      proBadge: '专业版',
    },
    comparePlans: {
      title: '会员计划',
      subtitle: '解锁 Pro 版全部潜力。',
      columns: {
        feature: '功能',
        free: '免费版',
        pro: '专业版',
      },
      features: {
        focusWidgets: '专注组件',
        cloudSync: '云端同步',
        stats: '统计数据与分析',
        customBackgrounds: '自定义背景',
        aiTaskBreaker: 'AI 任务拆解',
        prioritySupport: '优先支持',
        unlimitedTasks: '任务数量',
      },
      values: {
        basic: '基础',
        allAccess: '全部',
        limit20: '限20个',
        unlimited: '无限',
        inDev: '正在开发',
        limit10: '限10个',
        limitedTimes: '有限次数',
        threePerDay: '一天三次',
        limited: '有限',
      },
      intervals: {
        month: '月度',
        year: '年度',
        monthShort: '月',
        yearShort: '年',
      },
      billing: {
        cancelAnytime: '7天免费试用，随时取消。',
        savePercent: '省17%',
      },
      cta: {
        startTrial: '开始7天免费试用',
      },
      beta: {
        msgPre: '好消息！您当前处于',
        planName: '内部测试计划',
        msgPost: '中。',
        description: '在此期间免费享受所有 Pro 功能。',
      },
    },
    userProfile: {
      betaBadge: '专业版计划（内测中）',
      betaDescription: '当前所有功能均可免费体验。',
    },
    focusLabLanding: {
      hero: {
        newVersion: 'v1.0 正在内测中：全新界面 & 专注统计',
        titlePre: '将你的注意力锁定在',
        titlePost: 'Focus Lab',
        descPre: '别再和大脑对抗了。这是一个专为注意力缺陷（ADHD）设计的',
        descHighlight: '电子工位',
        descPost: '助你瞬间进入心流状态，减少切换屏幕带来的注意丢失。',
        enterBtn: '进入 Focus Lab',
        noCreditCard: '无需注册 · 即刻使用',
        screenshotPlaceholder: '仪表盘截图将放置于此',
      },
      painPoints: {
        title: '为什么传统的待办清单会失效',
        desc: '标准的效率工具并不是为神经多样性的大脑设计的。',
        items: [
          {
            title: '注意力丧失',
            desc: '大脑里打开了太多标签页？你僵住了，什么也做不了，因为不知道从哪里开始。',
          },
          {
            title: '多巴胺陷阱',
            desc: '本来只想看一条通知，结果不知不觉刷了两小时手机。',
          },
          {
            title: '时间盲区',
            desc: '以为这事只要 5 分钟，结果花了 50 分钟，导致永远迟到和内疚。',
          },
          {
            title: '难以启动任务',
            desc: '通过任务拆解的方式，将任何困难任务拆解成可以随时启动的小任务。',
          },
        ],
      },
      howItWorks: {
        title: '如何进入心流状态',
        steps: [
          {
            title: '注意力中转站',
            desc: '清空你的大脑内存。把所有让你分心的事情打出来，存好以后再处理。',
          },
          {
            title: '白噪音',
            desc: '开启白噪音或脑波音频，物理屏蔽听觉干扰。',
          },
          {
            title: '专注时钟',
            desc: '通过启动专注时钟，让你的状态快速切换到专注状态。',
          },
        ],
      },
      features: {
        title: '你需要的都有，不需要的都没有',
        items: [
          {
            title: '专注时钟',
            desc: '灵活的番茄钟，允许此时被打断。',
          },
          {
            title: '任务拆解器',
            desc: 'AI 驱动的工具，把吓人的大任务拆成微小的步骤。',
          },
          {
            title: '多巴胺菜单',
            desc: '健康的奖励列表，补充能量而不必刷手机。',
          },
          {
            title: '专注分析',
            desc: '追踪你的深度工作时长和能量模式。',
          },
        ],
      },
      testimonials: {
        title: '受到 1,000+ ADHD 用户的信赖',
        items: [
          {
            quote: '“用白噪音工具，我也在一个星期内写了4章。太神奇了。”',
            name: 'Sarah J.',
            role: '作家',
          },
          {
            quote: '“注意力中转站功能在期末考试期间救了我的命。我的焦虑减少了一半。”',
            name: 'David L.',
            role: '学生',
          },
          {
            quote: '“终于有一个感觉不杂乱的仪表盘了。光是看着它就让人平静。”',
            name: 'Elena R.',
            role: '开发者',
          },
          {
            quote: '“我向所有客户推荐 Focus Lab。它能建立正确的仪式感。”',
            name: 'Mike T.',
            role: 'ADHD 教练',
          },
        ],
      },
      faq: {
        title: '常见问题',
        items: [
          {
            question: 'Focus Lab 是免费的吗？',
            answer: '是的！Focus Lab 完全免费使用。它完全在你的浏览器中运行。',
          },
          {
            question: '我需要创建账户吗？',
            answer:
              '不需要。你可以立即使用，你的数据将存储在浏览器的本地。无需注册即可体验所有功能。',
          },
          {
            question: '这是如何帮助我专注的？',
            answer:
              '通过将所有抗干扰工具（白噪音、计时器、任务拆解）集成在一个界面，减少切换窗口，从而减少注意力流失。',
          },
          {
            question: '我的数据安全吗？',
            answer: '您的数据默认存储在本地浏览器中。如果您选择登录，数据将加密同步到云端。',
          },
        ],
      },
      cta: {
        title: '准备好找回你的注意力了吗？',
        button: '立即开始专注 - 免费使用',
      },
    },
  },
} as const

export type Dictionary = (typeof dictionary)[Locale]

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  return dictionary[locale]
}
