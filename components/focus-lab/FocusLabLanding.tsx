'use client'

import { motion } from 'framer-motion'
import { useTranslation } from '@/context/LanguageContext'
import Image from 'next/image'
import { useState } from 'react'

type Props = {
  onEnter: () => void
}

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-6 text-left focus:outline-none"
      >
        <span className="text-lg font-medium text-gray-900 dark:text-gray-100">{question}</span>
        <span
          className={`ml-6 flex h-7 w-7 items-center justify-center rounded-full border transition-all ${isOpen ? 'border-primary-500 bg-primary-50 text-primary-600 rotate-180' : 'border-gray-300 text-gray-500'}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-gray-600 dark:text-gray-400">{answer}</p>
      </motion.div>
    </div>
  )
}

export const FocusLabLanding = ({ onEnter }: Props) => {
  const { t } = useTranslation()

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vh] rounded-full bg-purple-200/30 blur-[120px] dark:bg-purple-900/20" />
        <div className="absolute top-[10%] right-[0%] h-[60vh] w-[60vh] rounded-full bg-blue-200/30 blur-[100px] dark:bg-blue-900/20" />
        <div className="absolute -bottom-[20%] left-[20%] h-[80vh] w-[80vh] rounded-full bg-emerald-100/30 blur-[120px] dark:bg-emerald-900/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navbar removed as requested (using global nav) */}

        {/* Hero Section */}
        <main className="flex min-h-[85vh] flex-col items-center justify-center pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <div className="border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-900/50 dark:bg-primary-900/20 dark:text-primary-400 mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="bg-primary-400 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                <span className="bg-primary-500 relative inline-flex h-2 w-2 rounded-full"></span>
              </span>
              v2.0 is now live: Body Doubling & Brain Dump
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
              <span className="block text-gray-900 dark:text-white">Master Your</span>
              <span className="from-primary-500 dark:from-primary-400 block bg-gradient-to-r to-indigo-600 bg-clip-text text-transparent dark:to-indigo-400">
                Deep Focus
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-600 md:text-xl dark:text-gray-300">
              Stop fighting your brain. The all-in-one workspace designed for
              <span className="mx-1 inline-block rounded-lg bg-orange-100 px-2 py-0.5 font-bold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                ADHD Friendly
              </span>
              minds to induce flow state instantly.
            </p>

            <motion.div
              className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <button
                onClick={onEnter}
                className="group hover:shadow-primary-500/25 relative flex h-16 min-w-[240px] items-center justify-center gap-3 overflow-hidden rounded-full bg-gray-900 px-8 text-xl font-bold text-white shadow-2xl transition-all hover:scale-105 hover:bg-black active:scale-95 dark:bg-white dark:text-black dark:hover:bg-gray-100"
              >
                <span>Enter Focus Studio</span>
                <svg
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>

                {/* Glow Effect */}
                <div className="from-primary-500/0 via-primary-500/40 to-primary-500/0 absolute inset-0 -z-10 translate-y-[100%] bg-gradient-to-r blur-lg transition-transform duration-1000 group-hover:translate-y-[-100%]" />
              </button>
            </motion.div>

            <p className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
              No credit card required · Instant guest access
            </p>

            {/* Dashboard Screenshot Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative mt-20 w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex aspect-[16/9] w-full items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl">📸</span>
                  <p className="mt-4 font-medium text-gray-400">
                    Dashboard Screenshot will be placed here
                  </p>
                  <p className="text-sm text-gray-400/60">1200 x 675px</p>
                </div>
              </div>
              {/* Shimmer/Reflection Effect */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />
            </motion.div>
          </motion.div>
        </main>

        {/* 2. Pain Points Section */}
        <section id="pain-points" className="py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              Why traditional to-do lists fail us
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Standard productivity tools aren't built for neurodivergent minds.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: '🤯',
                title: 'Brain Fog & Overwhelm',
                desc: "Too many tabs open in your brain? You freeze and do nothing because you don't know where to start.",
              },
              {
                icon: '📱',
                title: 'Dopamine Traps',
                desc: 'Checking one notification turns into 2 hours of doom-scrolling before you realize it.',
              },
              {
                icon: '🕰',
                title: 'Time Blindness',
                desc: 'Thinking a task takes 5 minutes when it takes 50, leading to perpetual lateness and guilt.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl bg-gray-50 p-8 dark:bg-gray-900/50"
              >
                <div className="mb-4 text-4xl">{item.icon}</div>
                <h3 className="mb-3 text-xl font-bold dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. How it Works */}
        <section id="how-it-works" className="py-24">
          <div className="rounded-[40px] bg-black px-8 py-20 text-center text-white md:px-20 dark:bg-white dark:text-black">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              How to enter Flow State
            </h2>
            <div className="mt-16 grid gap-12 md:grid-cols-3">
              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white backdrop-blur dark:bg-black/10 dark:text-black">
                  1
                </div>
                <h3 className="mb-2 text-xl font-bold">Brain Dump</h3>
                <p className="text-white/60 dark:text-black/60">
                  Clear your mental RAM. Type out every distraction to safe-keep it for later.
                </p>
              </div>
              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white backdrop-blur dark:bg-black/10 dark:text-black">
                  2
                </div>
                <h3 className="mb-2 text-xl font-bold">Sonic Shield</h3>
                <p className="text-white/60 dark:text-black/60">
                  Turn on Brown Noise or 40Hz Beats to physically block auditory distractions.
                </p>
              </div>
              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white backdrop-blur dark:bg-black/10 dark:text-black">
                  3
                </div>
                <h3 className="mb-2 text-xl font-bold">Body Doubling</h3>
                <p className="text-white/60 dark:text-black/60">
                  Join our silent community. Seeing others focus helps your mirror neurons engage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Features Grid */}
        <section id="features" className="py-24">
          <h2 className="mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need, nothing you don't
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                emoji: '🍅',
                title: 'Smart Timer',
                desc: 'Flexible Pomodoro that forgives interruptions.',
              },
              {
                emoji: '🗒',
                title: 'Task Breaker',
                desc: 'AI-powered tool to break big scary tasks into tiny steps.',
              },
              {
                emoji: '🍬',
                title: 'Dopamine Menu',
                desc: 'Healthy rewards list to replenish energy without scrolling.',
              },
              {
                emoji: '📊',
                title: 'Focus Analytics',
                desc: 'Track your deep work hours and energy patterns.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-4 text-3xl">{f.emoji}</div>
                <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Testimonials (Social Proof) */}
        <section id="testimonials" className="py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              Trusted by 10,000+ Deep Workers
            </h2>
          </div>

          <div className="mt-16 flex flex-nowrap gap-6 overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] pb-8">
            {/* Mock Testimonials */}
            {[
              {
                name: 'Sarah J.',
                role: 'Writer',
                quote: "I wrote 4 chapters in one week using the Brown Noise tool. It's magic.",
              },
              {
                name: 'David L.',
                role: 'Student',
                quote: 'The Brain Dump feature saved me during finals. My anxiety dropped by half.',
              },
              {
                name: 'Elena R.',
                role: 'Developer',
                quote:
                  "Finally a dashboard that doesn't feel cluttered. It's calming just to look at.",
              },
              {
                name: 'Mike T.',
                role: 'ADHD Coach',
                quote: 'I recommend Focus Lab to all my clients. It builds the right rituals.',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="min-w-[300px] flex-shrink-0 rounded-2xl bg-gray-50 p-6 dark:bg-gray-800"
              >
                <div className="flex items-center gap-1 text-yellow-500">★★★★★</div>
                <p className="mt-4 text-gray-700 dark:text-gray-300">"{t.quote}"</p>
                <div className="mt-4">
                  <div className="font-bold text-gray-900 dark:text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FAQ */}
        <section className="mx-auto max-w-3xl py-24">
          <h2 className="mb-12 text-center text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-2">
            <FAQItem
              question="Is Focus Lab free?"
              answer="Yes! We have a generous free tier that includes the Timer, White Noise, and Brain Dump. We also offer a Pro plan for advanced analytics and cloud sync."
            />
            <FAQItem
              question="Do I need to create an account?"
              answer="No. You can use 'Guest Mode' instantly. Your data will be stored locally in your browser. Create an account only if you want to sync across devices."
            />
            <FAQItem
              question="How does Body Doubling work here?"
              answer="We have a 'Community' button that shows how many people are focusing right now. We also organize Discord sessions where we all mute mics and work together."
            />
            <FAQItem
              question="Is this app only for ADHD?"
              answer="While designed with ADHD brains in mind (high stimulation control), it's excellent for anyone who wants to enter a deep flow state."
            />
          </div>
        </section>

        {/* 7. Bottom CTA */}
        <section className="py-32 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to reclaim your attention?
          </h2>
          <div className="mt-10 flex justify-center">
            <button
              onClick={onEnter}
              className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 rounded-full px-10 py-4 text-xl font-bold text-white shadow-xl transition-transform hover:scale-105"
            >
              Start Focusing Now - It's Free
            </button>
          </div>
        </section>

        <footer className="border-t border-gray-100 py-12 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Focus Lab. Built for neurodiversity.</p>
        </footer>
      </div>
    </div>
  )
}
