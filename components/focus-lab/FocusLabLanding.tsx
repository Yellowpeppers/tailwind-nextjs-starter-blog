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
          <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-indigo-900 via-purple-900 to-black px-8 py-20 text-center text-white md:px-20">
            {/* Animated Background Shapes */}
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-blue-500 blur-3xl"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, -60, 0] }}
                transition={{ duration: 18, repeat: Infinity }}
                className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-purple-500 blur-3xl"
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              {t.focusLabLanding.howItWorks.title}
            </h2>
            <div className="mt-16 grid gap-12 md:grid-cols-3">
              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white backdrop-blur dark:bg-black/10 dark:text-black">
                  1
                </div>
                <h3 className="mb-2 text-xl font-bold">
                  {t.focusLabLanding.howItWorks.steps[0].title}
                </h3>
                <p className="text-white/60 dark:text-black/60">
                  {t.focusLabLanding.howItWorks.steps[0].desc}
                </p>
              </div>
              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white backdrop-blur dark:bg-black/10 dark:text-black">
                  2
                </div>
                <h3 className="mb-2 text-xl font-bold">
                  {t.focusLabLanding.howItWorks.steps[1].title}
                </h3>
                <p className="text-white/60 dark:text-black/60">
                  {t.focusLabLanding.howItWorks.steps[1].desc}
                </p>
              </div>
              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white backdrop-blur dark:bg-black/10 dark:text-black">
                  3
                </div>
                <h3 className="mb-2 text-xl font-bold">
                  {t.focusLabLanding.howItWorks.steps[2].title}
                </h3>
                <p className="text-white/60 dark:text-black/60">
                  {t.focusLabLanding.howItWorks.steps[2].desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Features Grid */}
        <section id="features" className="py-24">
          <h2 className="mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            {t.focusLabLanding.features.title}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                emoji: '🍅',
                title: t.focusLabLanding.features.items[0].title,
                desc: t.focusLabLanding.features.items[0].desc,
              },
              {
                emoji: '🗒',
                title: t.focusLabLanding.features.items[1].title,
                desc: t.focusLabLanding.features.items[1].desc,
              },
              {
                emoji: '🍬',
                title: t.focusLabLanding.features.items[2].title,
                desc: t.focusLabLanding.features.items[2].desc,
              },
              {
                emoji: '📊',
                title: t.focusLabLanding.features.items[3].title,
                desc: t.focusLabLanding.features.items[3].desc,
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
              {t.focusLabLanding.testimonials.title}
            </h2>
          </div>

          <div className="relative mx-auto mt-16 max-w-4xl px-12">
            <div className="overflow-hidden rounded-2xl bg-white/70 p-8 shadow-xl backdrop-blur-md dark:bg-gray-800/70">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-6 flex gap-1 text-xl text-yellow-500">★★★★★</div>
                  <p className="mb-8 text-xl font-medium text-gray-900 italic md:text-2xl dark:text-gray-100">
                    {t.focusLabLanding.testimonials.items[activeTestimonial].quote}
                  </p>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {t.focusLabLanding.testimonials.items[activeTestimonial].name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t.focusLabLanding.testimonials.items[activeTestimonial].role}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Carousel Controls */}
            <button
              onClick={prevTestimonial}
              className="absolute top-1/2 left-0 -translate-y-1/2 rounded-full bg-white p-2 text-gray-800 shadow-lg transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              aria-label="Previous testimonial"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute top-1/2 right-0 -translate-y-1/2 rounded-full bg-white p-2 text-gray-800 shadow-lg transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              aria-label="Next testimonial"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Dots */}
            <div className="mt-6 flex justify-center gap-2">
              {t.focusLabLanding.testimonials.items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeTestimonial
                      ? 'bg-primary-500 w-8'
                      : 'w-2 bg-gray-300 dark:bg-gray-600'
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
