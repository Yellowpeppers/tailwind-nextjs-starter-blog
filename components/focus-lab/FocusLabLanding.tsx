import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/context/LanguageContext'
import Image from 'next/image'
import { MouseEvent, useState } from 'react'

type Props = {
  onEnter: () => void
}

const MagneticButton = ({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
}) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ clientX, clientY, currentTarget }: MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect()
    const x = clientX - (left + width / 2)
    const y = clientY - (top + height / 2)
    mouseX.set(x * 0.15)
    mouseY.set(y * 0.15)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.button
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: mouseX, y: mouseY }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.button>
  )
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
  const { t, language } = useTranslation()
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % t.focusLabLanding.testimonials.items.length)
  }

  const prevTestimonial = () => {
    setActiveTestimonial((prev) =>
      prev === 0 ? t.focusLabLanding.testimonials.items.length - 1 : prev - 1
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vh] rounded-full bg-purple-200/30 blur-[120px] dark:bg-purple-900/20"
        />
        <motion.div
          animate={{
            x: [0, -70, 0],
            y: [0, 80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[10%] right-[0%] h-[60vh] w-[60vh] rounded-full bg-blue-200/30 blur-[100px] dark:bg-blue-900/20"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[20%] left-[20%] h-[80vh] w-[80vh] rounded-full bg-emerald-100/30 blur-[120px] dark:bg-emerald-900/10"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navbar removed as requested (using global nav) */}

        {/* Hero Section */}
        <main className="flex min-h-[85vh] flex-col items-center justify-center pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div className="border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-900/50 dark:bg-primary-900/20 dark:text-primary-400 mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="bg-primary-400 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                <span className="bg-primary-500 relative inline-flex h-2 w-2 rounded-full"></span>
              </span>
              {t.focusLabLanding.hero.newVersion}
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl">
              <span className="block text-gray-900 dark:text-white">
                {t.focusLabLanding.hero.titlePre}
              </span>
              <span className="from-primary-500 dark:from-primary-400 block bg-gradient-to-r to-indigo-600 bg-clip-text text-transparent dark:to-indigo-400">
                {t.focusLabLanding.hero.titlePost}
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-600 md:text-xl dark:text-gray-300">
              {t.focusLabLanding.hero.descPre}
              <span className="mx-1 inline-block rounded-lg bg-orange-100 px-2 py-0.5 font-bold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                {t.focusLabLanding.hero.descHighlight}
              </span>
              {t.focusLabLanding.hero.descPost}
            </p>

            <motion.div
              className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <MagneticButton
                onClick={onEnter}
                className="group hover:shadow-primary-500/25 relative flex h-16 min-w-[240px] items-center justify-center gap-3 overflow-hidden rounded-full bg-gray-900 px-8 text-xl font-bold text-white shadow-2xl dark:bg-white dark:text-black dark:hover:bg-gray-100"
              >
                <span className="relative z-10">{t.focusLabLanding.hero.enterBtn}</span>
                <svg
                  className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
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
                <div className="from-primary-500/0 via-primary-500/40 to-primary-500/0 absolute inset-0 z-0 translate-y-[100%] bg-gradient-to-r blur-lg transition-transform duration-1000 group-hover:translate-y-[-100%]" />
              </MagneticButton>
            </motion.div>

            <p className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
              {t.focusLabLanding.hero.noCreditCard}
            </p>

            {/* Dashboard Screenshot Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative mt-20 w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            >
              <Image
                src={`/static/images/dashboard-${language === 'zh' ? 'zh' : 'en'}.png`}
                alt="Focus Lab Dashboard"
                width={language === 'zh' ? 3364 : 3360}
                height={language === 'zh' ? 1838 : 1862}
                className="h-auto w-full"
                priority
              />
              {/* Shimmer/Reflection Effect */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />
            </motion.div>
          </motion.div>
        </main>

        {/* 2. Pain Points Section */}
        <section id="pain-points" className="py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              {t.focusLabLanding.painPoints.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              {t.focusLabLanding.painPoints.desc}
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: '🤯',
                title: t.focusLabLanding.painPoints.items[0].title,
                desc: t.focusLabLanding.painPoints.items[0].desc,
              },
              {
                icon: '📱',
                title: t.focusLabLanding.painPoints.items[1].title,
                desc: t.focusLabLanding.painPoints.items[1].desc,
              },
              {
                icon: '🕰',
                title: t.focusLabLanding.painPoints.items[2].title,
                desc: t.focusLabLanding.painPoints.items[2].desc,
              },
              {
                icon: '🧊',
                title: t.focusLabLanding.painPoints.items[3].title,
                desc: t.focusLabLanding.painPoints.items[3].desc,
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
          <div className="relative overflow-hidden rounded-[40px] border border-zinc-800 bg-zinc-950 px-8 py-20 text-center text-white shadow-2xl md:px-20">
            {/* Premium Background Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]"
              />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-purple-500/20 blur-[100px]"
              />
            </div>

            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
                {t.focusLabLanding.howItWorks.title}
              </h2>
              <p className="mx-auto mb-16 max-w-2xl text-zinc-400">
                {language === 'zh'
                  ? '三个简单步骤，让你的大脑进入高效的工作波段'
                  : 'Three simple steps to put your brain into a high-efficiency wave'}
              </p>

              <div className="grid gap-12 md:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="group relative">
                    <div className="group-hover:border-primary-500/50 group-hover:bg-primary-500/10 mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl font-black text-white backdrop-blur-xl transition-all duration-300 group-hover:scale-110">
                      {i + 1}
                    </div>
                    <h3 className="group-hover:text-primary-400 mb-3 text-xl font-bold text-white transition-colors">
                      {t.focusLabLanding.howItWorks.steps[i].title}
                    </h3>
                    <p className="text-zinc-500 transition-colors group-hover:text-zinc-400">
                      {t.focusLabLanding.howItWorks.steps[i].desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Features Grid */}
        <section id="features" className="py-24">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
              {t.focusLabLanding.features.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
              {language === 'zh'
                ? '我们只保留最核心的工具，确保每个组件都能为你提供最大的支持。'
                : 'We only keep the most core tools to ensure that each component provides the maximum support for you.'}
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            {[
              {
                emoji: '🍅',
                title: t.focusLabLanding.features.items[0].title,
                desc: t.focusLabLanding.features.items[0].desc,
                color: 'from-orange-500/10 to-red-500/10',
              },
              {
                emoji: '🗒',
                title: t.focusLabLanding.features.items[1].title,
                desc: t.focusLabLanding.features.items[1].desc,
                color: 'from-blue-500/10 to-indigo-500/10',
              },
              {
                emoji: '🍬',
                title: t.focusLabLanding.features.items[2].title,
                desc: t.focusLabLanding.features.items[2].desc,
                color: 'from-pink-500/10 to-purple-500/10',
              },
              {
                emoji: '📊',
                title: t.focusLabLanding.features.items[3].title,
                desc: t.focusLabLanding.features.items[3].desc,
                color: 'from-emerald-500/10 to-teal-500/10',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group hover:border-primary-200 dark:hover:border-primary-900/50 flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl sm:flex-row dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <div
                  className={`relative flex aspect-video w-full items-center justify-center bg-gradient-to-br ${f.color} sm:w-1/2`}
                >
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-20"></div>

                  {/* Image Placeholder */}
                  <div className="relative z-10 flex h-3/4 w-3/4 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300/50 bg-white/40 shadow-inner backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-800/40">
                    <div className="mb-2 text-4xl grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0">
                      {f.emoji}
                    </div>
                    <span className="group-hover:text-primary-500 text-[10px] font-bold tracking-widest text-gray-400 uppercase transition-colors">
                      {language === 'zh' ? '组件截图占位' : 'WIDGET SCREENSHOT'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-center p-8">
                  <h3 className="mb-3 text-2xl font-bold dark:text-white">{f.title}</h3>
                  <p className="text-gray-600 dark:text-zinc-400">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 5. Testimonials (Social Proof) */}
        <section id="testimonials" className="py-24">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              {t.focusLabLanding.testimonials.title}
            </h2>
          </div>

          <div className="relative mx-auto max-w-4xl">
            {/* The Main Card with Fixed/Min Height to avoid jumping */}
            <div className="relative min-h-[320px] overflow-hidden rounded-[32px] border border-gray-100 bg-white p-12 shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 10, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <div className="mb-8 flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        className="h-6 w-6 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <blockquote className="mb-10 text-2xl leading-relaxed font-semibold text-gray-900 italic md:text-3xl dark:text-white">
                    {t.focusLabLanding.testimonials.items[activeTestimonial].quote}
                  </blockquote>

                  <div className="flex flex-col items-center">
                    <div className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                      {t.focusLabLanding.testimonials.items[activeTestimonial].name}
                    </div>
                    <div className="text-primary-500 text-sm font-bold tracking-widest uppercase">
                      {t.focusLabLanding.testimonials.items[activeTestimonial].role}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Quotes Decor */}
              <div className="pointer-events-none absolute top-10 left-10 font-serif text-8xl text-gray-100 opacity-50 dark:text-zinc-800">
                “
              </div>
              <div className="pointer-events-none absolute right-10 bottom-10 font-serif text-8xl text-gray-100 opacity-50 dark:text-zinc-800">
                ”
              </div>
            </div>

            {/* Navigation Controls - Absolute and Fixed relative to the outer container to avoid moving */}
            <div className="pointer-events-none absolute top-1/2 -left-6 flex w-[calc(100%+48px)] -translate-y-1/2 items-center justify-between">
              <button
                onClick={prevTestimonial}
                className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-800 shadow-xl transition-all hover:scale-110 hover:bg-gray-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                aria-label="Previous testimonial"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextTestimonial}
                className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-800 shadow-xl transition-all hover:scale-110 hover:bg-gray-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                aria-label="Next testimonial"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Progress Dots */}
            <div className="mt-12 flex justify-center gap-3">
              {t.focusLabLanding.testimonials.items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-3 rounded-full transition-all duration-500 ${
                    idx === activeTestimonial
                      ? 'bg-primary-500 w-12'
                      : 'w-3 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
        <section className="mx-auto max-w-3xl py-24">
          <h2 className="mb-12 text-center text-3xl font-bold">{t.focusLabLanding.faq.title}</h2>
          <div className="space-y-2">
            {t.focusLabLanding.faq.items.map((item, i) => (
              <FAQItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>

        {/* 7. Bottom CTA */}
        <section className="py-32 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t.focusLabLanding.cta.title}
          </h2>
          <div className="mt-10 flex justify-center">
            <button
              onClick={onEnter}
              className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 rounded-full px-10 py-4 text-xl font-bold text-white shadow-xl transition-transform hover:scale-105"
            >
              {t.focusLabLanding.cta.button}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
