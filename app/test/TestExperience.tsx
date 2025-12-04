'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from '@/components/Link'
import { AnimatePresence, motion } from 'framer-motion'
import useSound from 'use-sound'
import { useTranslation } from '@/context/LanguageContext'
import { dictionary } from '@/data/locale/dictionary'

// Helper to get result bucket based on score and translation
const getResultBucket = (score: number, t: typeof dictionary.en) => {
  const buckets = t.test.results.buckets
  if (score <= 16) {
    return {
      ...buckets.low,
      toneClass: 'text-slate-600 dark:text-slate-400',
      badgeBg: 'bg-slate-100 dark:bg-slate-500/10',
      badgeText: 'text-slate-700 dark:text-slate-300',
      borderClass: 'border-slate-200 dark:border-slate-500/40',
    }
  }
  if (score <= 23) {
    return {
      ...buckets.medium,
      toneClass: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-amber-500/10',
      badgeText: 'text-amber-700 dark:text-amber-200',
      borderClass: 'border-amber-100 dark:border-amber-500/40',
    }
  }
  return {
    ...buckets.high,
    toneClass: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-500/10',
    badgeText: 'text-rose-700 dark:text-rose-200',
    borderClass: 'border-rose-100 dark:border-rose-500/40',
  }
}

export default function TestExperience() {
  const { t } = useTranslation()
  const QUESTIONS = t.test.questions
  const OPTION_LABELS = t.test.options
  const ANALYZING_MESSAGES = t.test.analyzing.messages
  const ANALYZING_DURATION = 2500

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null))
  const [completed, setCompleted] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzingMessageIndex, setAnalyzingMessageIndex] = useState(0)
  const analyzeTimeoutRef = useRef<number | null>(null)
  const analyzeIntervalRef = useRef<number | null>(null)
  const [muted, setMuted] = useState(false)
  const [showHints, setShowHints] = useState(true)
  const [playPop] = useSound('/static/sounds/pop.mp3', {
    volume: 0.4,
    soundEnabled: !muted,
  })

  useEffect(() => {
    return () => {
      if (analyzeTimeoutRef.current !== null) {
        window.clearTimeout(analyzeTimeoutRef.current)
      }
      if (analyzeIntervalRef.current !== null) {
        window.clearInterval(analyzeIntervalRef.current)
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
      if (analyzeIntervalRef.current !== null) {
        window.clearInterval(analyzeIntervalRef.current)
        analyzeIntervalRef.current = null
      }
    }
  }, [isAnalyzing, ANALYZING_MESSAGES.length])

  const totalScore = useMemo(() => {
    return answers.reduce<number>((sum, value) => {
      return sum + (value ?? 0)
    }, 0)
  }, [answers])
  const currentStep = completed ? QUESTIONS.length : currentIndex + 1
  const progress = (currentStep / QUESTIONS.length) * 100

  const resultBucket = useMemo(() => getResultBucket(totalScore, t), [totalScore, t])

  const triggerAnalyzingPhase = () => {
    setIsAnalyzing(true)
    setAnalyzingMessageIndex(0)
    if (analyzeTimeoutRef.current !== null) {
      window.clearTimeout(analyzeTimeoutRef.current)
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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      if (isBreak) setIsBreak(false)
    }
  }

  const handleRetake = () => {
    setAnswers(Array(QUESTIONS.length).fill(null))
    setCurrentIndex(0)
    setCompleted(false)
    setIsBreak(false)
    setIsAnalyzing(false)
    setAnalyzingMessageIndex(0)
    // We keep quizStarted as true so they don't have to see the intro again
  }

  const currentQuestion = QUESTIONS[currentIndex]

  const QuestionView = () => (
    <>
      <div className="flex items-center justify-between text-sm font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-300">
        <span>
          {t.test.common.question} {currentStep} {t.test.common.of} {QUESTIONS.length}
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowHints((prev) => !prev)}
            className={`flex items-center gap-2 text-xs font-medium transition ${
              showHints
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
            }`}
          >
            <span>{showHints ? t.test.common.hideHints : t.test.common.showHints}</span>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setMuted((prev) => !prev)}
            className="hover:text-primary-500 flex items-center gap-2 text-xs font-normal text-gray-500 transition"
          >
            {muted ? t.test.common.soundOff : t.test.common.soundOn}
            {muted ? (
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" />
                <path d="M4 9h4l4-4v14l-4-4H4z" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M4 9h4l4-4v14l-4-4H4z" strokeLinejoin="round" />
                <path d="M16 9a4 4 0 010 6" strokeLinecap="round" />
                <path d="M19 7a7 7 0 010 10" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
        <motion.div
          className="bg-primary-500 h-2 rounded-full"
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
          <p className="text-primary-500 text-sm font-medium">
            {currentQuestion.isPartA ? t.test.common.partA : t.test.common.partB} ·{' '}
            {t.test.common.question} {currentStep}
          </p>
          <h1
            className="text-2xl font-semibold text-gray-900 dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {OPTION_LABELS.map((label: string, index: number) => (
              <button
                key={label}
                type="button"
                onClick={() => handleAnswerSelect(index)}
                className="hover:border-primary-500 hover:text-primary-600 focus-visible:ring-primary-500 rounded-2xl border border-gray-200 bg-white px-4 py-5 text-left text-base font-medium text-gray-900 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <div className="text-lg font-semibold">{label}</div>
                {showHints && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {currentQuestion.hints[index]}
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-start">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`text-sm font-medium transition-colors ${
                currentIndex === 0
                  ? 'cursor-not-allowed text-gray-300 dark:text-gray-600'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              {currentIndex > 0 ? `← ${t.test.common.previous}` : ''}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )

  const BreakView = () => (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {t.test.break.title}
      </div>
      <p className="max-w-md text-base text-gray-600 dark:text-gray-300">
        {t.test.break.description}
      </p>
      <motion.div
        className="border-primary-200 bg-primary-100 dark:border-primary-500/30 dark:bg-primary-500/20 h-16 w-16 rounded-full border-4"
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <button
        type="button"
        onClick={() => setIsBreak(false)}
        className="bg-primary-500 shadow-primary-500/30 hover:bg-primary-600 rounded-2xl px-6 py-3 text-base font-semibold text-white shadow-lg transition"
      >
        {t.test.break.button}
      </button>
    </div>
  )

  const AnalyzingView = () => (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <motion.div
        className="border-primary-200 from-primary-100 to-primary-200 dark:border-primary-500/30 dark:from-primary-500/10 dark:to-primary-500/20 h-24 w-24 rounded-full border-4 bg-gradient-to-br via-white dark:via-transparent"
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {ANALYZING_MESSAGES[analyzingMessageIndex]}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">{t.test.analyzing.subtitle}</p>
    </div>
  )

  const IntroView = () => (
    <div className="grid gap-12 md:grid-cols-2 md:items-center">
      <div className="space-y-8 text-left">
        <div className="space-y-4">
          <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">
            {t.test.subtitle}
          </p>
          <h1 className="text-4xl font-black text-gray-900 sm:text-5xl dark:text-gray-100">
            {t.test.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">{t.test.description}</p>
        </div>
        <button
          type="button"
          onClick={() => setQuizStarted(true)}
          className="bg-primary-500 shadow-primary-500/30 hover:bg-primary-600 inline-flex w-full items-center justify-center rounded-2xl px-8 py-4 text-xl font-semibold text-white shadow-lg transition sm:w-auto"
        >
          {t.test.start}
        </button>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {t.test.meta}
          </span>
        </div>
      </div>
      <div className="relative hidden aspect-square overflow-hidden rounded-3xl shadow-2xl md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-teal-100 opacity-50 dark:from-rose-900/20 dark:to-teal-900/20" />
        <Image
          src="/static/images/result-brain.png"
          alt="ADHD Assessment Illustration"
          fill
          className="object-cover"
          priority
          fetchPriority="high"
        />
      </div>
    </div>
  )

  return (
    <div
      className={`mx-auto flex flex-col gap-10 py-10 transition-all duration-500 ${
        !quizStarted ? 'max-w-6xl' : 'max-w-3xl'
      }`}
    >
      <div className="shadow-primary-500/5 rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
        {!quizStarted ? (
          <IntroView />
        ) : isAnalyzing ? (
          <AnalyzingView />
        ) : completed ? (
          <div className="mt-8 space-y-8">
            <div
              className={`rounded-3xl border bg-white p-8 shadow-lg dark:bg-gray-900 ${resultBucket.borderClass}`}
            >
              <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:items-center">
                <div className="from-primary-100 shadow-primary-500/20 dark:from-primary-500/10 relative h-48 w-full overflow-hidden rounded-2xl bg-gradient-to-br via-white to-rose-100 shadow-lg md:h-full dark:via-gray-900 dark:to-rose-500/10">
                  <Image
                    src="/static/images/result-brain.png"
                    alt="Illustration of brain scan for ADHD assessment"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 30vw"
                    priority
                    fetchPriority="high"
                  />
                </div>
                <div className="space-y-6 md:col-span-2">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold ${resultBucket.badgeBg} ${resultBucket.badgeText}`}
                  >
                    <span>{t.test.results.status}</span>
                    <span className="tracking-wide uppercase">{resultBucket.label}</span>
                  </div>
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t.test.results.totalScore}
                      </p>
                      <p className={`text-6xl font-black ${resultBucket.toneClass}`}>
                        {totalScore}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.test.results.outOf}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {resultBucket.label}
                      </p>
                      <p className="text-base text-gray-600 dark:text-gray-300">
                        {resultBucket.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-center">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.test.results.cta.title}
                </p>
                <Link
                  href="/focuslab"
                  className="bg-primary-500 hover:bg-primary-600 shadow-primary-500/30 inline-flex w-full items-center justify-center gap-2 rounded-3xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:translate-y-0.5 hover:opacity-90"
                >
                  <span role="img" aria-label="Target">
                    🎯
                  </span>
                  <span>{t.test.results.cta.button}</span>
                </Link>
              </div>

              <div className="mt-6 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="text-sm font-medium text-gray-500 underline-offset-4 transition-colors hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-gray-100"
                >
                  {t.test.results.cta.retake}
                </button>
                <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700"></div>
                <Link
                  href="/"
                  className="text-sm font-medium text-gray-500 underline-offset-4 transition-colors hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-gray-100"
                >
                  {t.test.results.cta.home}
                </Link>
              </div>

              <div className="mt-6 flex w-full justify-center border-t border-gray-100 pt-6 dark:border-gray-800">
                <Link
                  href="/guides/best-quiet-fidget-toys"
                  className="group flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 transition-colors hover:bg-pink-50 dark:bg-gray-800/50 dark:hover:bg-pink-900/10"
                >
                  <span className="text-xs text-gray-400 transition-colors group-hover:text-pink-500 dark:text-gray-500 dark:group-hover:text-pink-400">
                    {t.test.results.cta.guide}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        ) : isBreak ? (
          <BreakView />
        ) : (
          <QuestionView />
        )}
      </div>

      <div className="mt-12 w-full space-y-4">
        {[
          { title: t.test.guide.accuracy.title, content: t.test.guide.accuracy.text },
          { title: t.test.guide.scoring.title, content: t.test.guide.scoring.text },
          { title: t.test.guide.nextSteps.title, content: t.test.guide.nextSteps.text },
          { title: t.test.guide.privacy.title, content: t.test.guide.privacy.text },
        ].map((item) => (
          <details
            key={item.title}
            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60"
          >
            <summary className="flex cursor-pointer items-center justify-between font-bold text-gray-900 dark:text-gray-100">
              {item.title}
              <span className="ml-4 transition-transform group-open:rotate-180">
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </summary>
            <div className="mt-4 text-base text-gray-600 dark:text-gray-300">{item.content}</div>
          </details>
        ))}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">{t.test.disclaimer}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{t.test.copyright}</p>
    </div>
  )
}
