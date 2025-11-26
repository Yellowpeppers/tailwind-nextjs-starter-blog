'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from '@/components/Link'
import { AnimatePresence, motion } from 'framer-motion'
import useSound from 'use-sound'

type Question = {
  id: number
  text: string
  isPartA: boolean
  options: string[]
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'How often do you have trouble <strong>wrapping up the final details</strong> of a project, once the <strong>challenging parts</strong> have been done?',
    isPartA: true,
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
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
    options: [
      'I respect people’s space and focus.',
      'Only if I urgently need something.',
      'Sometimes I pop in mid-task.',
      'Interrupting happens most days.',
      'I constantly cut people off without meaning to.',
    ],
  },
]

const OPTION_LABELS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often']
const ANALYZING_MESSAGES = ['Analyzing responses...', 'Mapping neuro-profile...', 'Finalizing score...']
const ANALYZING_DURATION = 2500

type ResultBucket = {
  label: string
  description: string
  toneClass: string
  badgeBg: string
  badgeText: string
  borderClass: string
}

const getResultBucket = (score: number): ResultBucket => {
  if (score <= 16) {
    return {
      label: 'Unlikely to have ADHD',
      description: 'Your symptoms are within the typical range.',
      toneClass: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      borderClass: 'border-emerald-100 dark:border-emerald-500/40',
    }
  }
  if (score <= 23) {
    return {
      label: 'Likely to have ADHD',
      description: 'You are showing signs that may impact your daily life.',
      toneClass: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-amber-500/10',
      badgeText: 'text-amber-700 dark:text-amber-200',
      borderClass: 'border-amber-100 dark:border-amber-500/40',
    }
  }
  return {
    label: 'Highly Consistent with ADHD',
    description: 'Your symptoms are significant. We recommend consulting a professional.',
    toneClass: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-500/10',
    badgeText: 'text-rose-700 dark:text-rose-200',
    borderClass: 'border-rose-100 dark:border-rose-500/40',
  }
}

export default function TestPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null))
  const [completed, setCompleted] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzingMessageIndex, setAnalyzingMessageIndex] = useState(0)
  const analyzeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const analyzeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [muted, setMuted] = useState(false)
  const [playPop] = useSound('/static/sounds/pop.mp3', {
    volume: 0.4,
    soundEnabled: !muted,
  })

  useEffect(() => {
    return () => {
      if (analyzeTimeoutRef.current) {
        clearTimeout(analyzeTimeoutRef.current)
      }
      if (analyzeIntervalRef.current) {
        clearInterval(analyzeIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isAnalyzing) {
      setAnalyzingMessageIndex(0)
      analyzeIntervalRef.current = window.setInterval(() => {
        setAnalyzingMessageIndex((prev) => (prev + 1) % ANALYZING_MESSAGES.length)
      }, 900)
    }

    return () => {
      if (analyzeIntervalRef.current) {
        clearInterval(analyzeIntervalRef.current)
        analyzeIntervalRef.current = null
      }
    }
  }, [isAnalyzing])

  const totalScore = useMemo(
    () => answers.reduce((sum, value) => sum + (value ?? 0), 0),
    [answers]
  )
  const currentStep = completed ? QUESTIONS.length : currentIndex + 1
  const progress = (currentStep / QUESTIONS.length) * 100

  const resultBucket = useMemo(() => getResultBucket(totalScore), [totalScore])

  const triggerAnalyzingPhase = () => {
    setIsAnalyzing(true)
    setAnalyzingMessageIndex(0)
    if (analyzeTimeoutRef.current) {
      clearTimeout(analyzeTimeoutRef.current)
    }
    analyzeTimeoutRef.current = window.setTimeout(() => {
      setIsAnalyzing(false)
      setCompleted(true)
    }, ANALYZING_DURATION)
  }

  const handleAnswerSelect = (value: number) => {
    if (completed || isBreak || !quizStarted) return
    playPop()
    setAnswers((prev) => {
      const next = [...prev]
      next[currentIndex] = value
      return next
    })

    if (currentIndex === QUESTIONS.length - 1) {
      triggerAnalyzingPhase()
    } else {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      if (currentIndex === 5) {
        setIsBreak(true)
      }
    }
  }

  const currentQuestion = QUESTIONS[currentIndex]

  const QuestionView = () => (
    <>
      <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
        <span>
          Question {currentStep} of {QUESTIONS.length}
        </span>
        <button
          type="button"
          onClick={() => setMuted((prev) => !prev)}
          className="flex items-center gap-2 text-xs font-normal text-gray-500 transition hover:text-primary-500"
        >
          {muted ? 'Sound off' : 'Sound on'}
          {muted ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" />
              <path d="M4 9h4l4-4v14l-4-4H4z" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 9h4l4-4v14l-4-4H4z" strokeLinejoin="round" />
              <path d="M16 9a4 4 0 010 6" strokeLinecap="round" />
              <path d="M19 7a7 7 0 010 10" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
      <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
        <motion.div
          className="h-2 rounded-full bg-primary-500"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mt-8 space-y-6"
        >
          <p className="text-sm font-medium text-primary-500">
            {currentQuestion.isPartA ? 'Part A' : 'Part B'} · Question {currentStep}
          </p>
          <h1
            className="text-2xl font-semibold text-gray-900 dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {OPTION_LABELS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => handleAnswerSelect(index)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-5 text-left text-base font-medium text-gray-900 transition hover:-translate-y-0.5 hover:border-primary-500 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <div className="text-lg font-semibold">{label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {currentQuestion.options[index]}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )

  const BreakView = () => (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">🧠 Part A Complete!</div>
      <p className="max-w-md text-base text-gray-600 dark:text-gray-300">
        Great job. You've finished the core screening questions. Take a deep breath before the final stretch.
      </p>
      <motion.div
        className="h-16 w-16 rounded-full border-4 border-primary-200 bg-primary-100 dark:border-primary-500/30 dark:bg-primary-500/20"
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <button
        type="button"
        onClick={() => setIsBreak(false)}
        className="rounded-2xl bg-primary-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-600"
      >
        Continue to Part B →
      </button>
    </div>
  )

  const AnalyzingView = () => (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <motion.div
        className="h-24 w-24 rounded-full border-4 border-primary-200 bg-gradient-to-br from-primary-100 via-white to-primary-200 dark:border-primary-500/30 dark:from-primary-500/10 dark:via-transparent dark:to-primary-500/20"
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {ANALYZING_MESSAGES[analyzingMessageIndex]}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">We’ll surface your ASRS insights in just a moment.</p>
    </div>
  )

  const IntroView = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">ASRS-v1.1</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Free Adult ADHD Screening
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300">
          Answer 18 research-backed questions to understand how closely your experiences align with adult ADHD patterns.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setQuizStarted(true)}
        className="inline-flex items-center justify-center rounded-2xl bg-primary-500 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-600"
      >
        Start Assessment
      </button>
    </div>
  )

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 py-10">
      <div className="rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-xl shadow-primary-500/5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
        {!quizStarted ? (
          <IntroView />
        ) : isAnalyzing ? (
          <AnalyzingView />
        ) : completed ? (
          <div className="mt-8 space-y-8">
            <div className={`rounded-3xl border bg-white p-8 shadow-lg dark:bg-gray-900 ${resultBucket.borderClass}`}>
              <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:items-center">
                <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary-100 via-white to-rose-100 shadow-lg shadow-primary-500/20 dark:from-primary-500/10 dark:via-gray-900 dark:to-rose-500/10 md:h-full">
                  <Image
                    src="/static/images/result-brain.png"
                    alt="Illustration of brain scan for ADHD assessment"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 30vw"
                    priority
                  />
                </div>
                <div className="space-y-6 md:col-span-2">
                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold ${resultBucket.badgeBg} ${resultBucket.badgeText}`}>
                    <span>Status</span>
                    <span className="uppercase tracking-wide">{resultBucket.label}</span>
                  </div>
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Score</p>
                      <p className={`text-6xl font-black ${resultBucket.toneClass}`}>{totalScore}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">out of 72</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {resultBucket.label}
                      </p>
                      <p className="text-base text-gray-600 dark:text-gray-300">{resultBucket.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-center">
              <Link
                href="/blog/best-quiet-fidget-toys"
                className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-primary-500 via-rose-500 to-primary-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-primary-500/40 transition hover:translate-y-0.5 hover:opacity-90"
              >
                <span role="img" aria-label="Sparkles">✨</span>
                <span>See Tools That Help (Read Guide) →</span>
              </Link>
              <Link
                href="/"
                className="text-base font-semibold text-gray-700 underline underline-offset-4 transition hover:text-primary-500 dark:text-gray-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : isBreak ? (
          <BreakView />
        ) : (
          <QuestionView />
        )}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Based on the Adult ADHD Self-Report Scale (ASRS-v1.1) Symptom Checklist. This screening is for educational purposes only and is not a medical diagnosis. Material adapted from World Health Organization standards.
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        ASRS-v1.1 Copyright © New York University and Ronald C. Kessler, PhD. All rights reserved. Used with permission.
      </p>
    </div>
  )
}
