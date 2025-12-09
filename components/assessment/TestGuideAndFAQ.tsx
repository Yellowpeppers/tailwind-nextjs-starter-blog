'use client'

import { useState, type ReactNode } from 'react'

import { CalendarClock, ChevronDown, VolumeX, Zap, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import { resolveLocale, type Locale } from '@/lib/i18n'

type GuideCard = {
  title: string
  body: ReactNode
  icon: LucideIcon
}

type FAQItem = {
  question: string
  answer: ReactNode
}

type ContentBlock = {
  guideEyebrow: string
  guideHeading: string
  guideCards: GuideCard[]
  faqEyebrow: string
  faqHeading: string
  faqItems: FAQItem[]
}

const content: Record<Locale, ContentBlock> = {
  en: {
    guideEyebrow: 'Instructions',
    guideHeading: '3 Steps to Accurate Adult ADHD Test Online Results',
    guideCards: [
      {
        title: 'Think in Patterns (6 Months)',
        icon: CalendarClock,
        body: (
          <>
            ADHD is about persistent patterns. Don't focus on a bad day or a good week. Consider
            your <strong>general experience</strong> over the last 6 months.
          </>
        ),
      },
      {
        title: 'Drop the Mask',
        icon: Zap,
        body: (
          <>
            It’s common to compensate for symptoms. Answer based on your{' '}
            <strong>natural struggles</strong>, not the systems you use to hide them.
          </>
        ),
      },
      {
        title: 'Minimize Distractions',
        icon: VolumeX,
        body: (
          <>
            This <strong>free ADHD test</strong> takes ~2 minutes. Give yourself this{' '}
            <strong>brief moment of focus</strong> to ensure your answers reflect your true reality.
          </>
        ),
      },
    ],
    faqEyebrow: 'FAQ',
    faqHeading: 'About the Assessment',
    faqItems: [
      {
        question: 'Is this ADHD test online a medical diagnosis?',
        answer: (
          <>
            No. This is a clinical-grade <strong>screening tool</strong>. It flags high
            probabilities based on symptoms but cannot replace a comprehensive evaluation by a
            psychiatrist.
          </>
        ),
      },
      {
        question: 'Is my data saved?',
        answer: (
          <>
            No. Your privacy is paramount. We do not store answers or results. Everything is
            calculated <strong>instantly in your browser</strong>.
          </>
        ),
      },
      {
        question: 'How accurate is this?',
        answer: (
          <>
            This tool utilizes the <strong>WHO ASRS v1.1</strong> (Adult ADHD Self-Report Scale), a
            globally recognized standard for screening <strong>adult ADHD</strong> symptoms used by
            clinicians.
          </>
        ),
      },
      {
        question: "What if I get a 'High Likelihood'?",
        answer: (
          <>
            This is a starting point for conversation. We recommend sharing your results with a
            doctor to discuss a comprehensive <strong>ADHD evaluation</strong>.
          </>
        ),
      },
    ],
  },
  zh: {
    guideEyebrow: '测试说明',
    guideHeading: '成人 ADHD 在线测试：获得准确结果的 3 个步骤',
    guideCards: [
      {
        title: '关注长期模式 (6个月)',
        icon: CalendarClock,
        body: (
          <>
            ADHD 关乎长期持续的模式。不要只看某一天的好坏。请回顾{' '}
            <strong>过去 6 个月的整体体验</strong>。
          </>
        ),
      },
      {
        title: '卸下伪装',
        icon: Zap,
        body: (
          <>
            通常我们会无意识地掩盖症状。请基于你 <strong>最自然的挣扎</strong>{' '}
            状态回答，而不是你为了应对困难而建立的补偿机制。
          </>
        ),
      },
      {
        title: '减少干扰',
        icon: VolumeX,
        body: (
          <>
            本 <strong>免费 ADHD 测试</strong> 仅需约 2 分钟。给自己 <strong>片刻的专注</strong>
            ，确保每一个选择都反映你的真实情况。
          </>
        ),
      },
    ],
    faqEyebrow: '常见问题',
    faqHeading: '关于本次评估',
    faqItems: [
      {
        question: '这个在线 ADHD 测试是医学诊断吗？',
        answer: (
          <>
            不是。这是临床级的 <strong>筛查工具</strong>
            。它可以提示高风险可能，但不能替代精神科医生的完整评估。
          </>
        ),
      },
      {
        question: '我的数据会被保存吗？',
        answer: (
          <>
            不会。我们极度重视您的隐私。所有的计算都在您的 <strong>浏览器本地即时完成</strong>
            ，不会上传服务器。
          </>
        ),
      },
      {
        question: '这个测试准确吗？',
        answer: (
          <>
            本工具采用世界卫生组织 (WHO) 研发的 <strong>ASRS v1.1</strong>{' '}
            量表，这是全球临床医生公认的成人 ADHD 筛查黄金标准。
          </>
        ),
      },
      {
        question: "如果结果是'高风险'怎么办？",
        answer: (
          <>
            这只是一个对话的开始。建议保存结果，展示给医生或心理咨询师，作为{' '}
            <strong>进一步专业评估</strong> 的参考。
          </>
        ),
      },
    ],
  },
}

type Props = {
  lang?: string
}

export default function TestGuideAndFAQ({ lang }: Props) {
  const locale = resolveLocale(lang)
  const block = content[locale]
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleIndex = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section aria-labelledby="test-guide-heading" className="mt-12 px-4 md:mt-24">
      <div className="mx-auto max-w-5xl border-t border-gray-100/70 pt-16 dark:border-gray-700">
        <section className="space-y-8">
          <div className="text-center">
            <p className="text-primary-500 text-xs font-semibold tracking-[0.35em] uppercase">
              {block.guideEyebrow}
            </p>
            <h2
              id="test-guide-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50"
            >
              {block.guideHeading}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {block.guideCards.map((card) => (
              <article
                key={card.title}
                className="group border-primary-100/50 bg-primary-50/50 dark:bg-primary-900/20 relative flex h-full flex-col items-center rounded-3xl border p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700"
              >
                <div className="text-primary-600 dark:text-primary-200 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-sm dark:bg-white/5">
                  <card.icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="adhd-faq-heading" className="mt-16 space-y-6">
          <div className="text-center">
            <p className="text-primary-500 text-xs font-semibold tracking-[0.35em] uppercase">
              {block.faqEyebrow}
            </p>
            <h2
              id="adhd-faq-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50"
            >
              {block.faqHeading}
            </h2>
          </div>
          <div className="space-y-4">
            {block.faqItems.map((item, index) => (
              <article
                key={item.question}
                className="rounded-2xl border border-gray-100/70 bg-white/80 shadow-sm dark:border-gray-700 dark:bg-zinc-900/40"
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => toggleIndex(index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={openIndex === index}
                  >
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform duration-200 dark:text-gray-500 ${
                        openIndex === index ? 'text-primary-500 rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5">
                        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
