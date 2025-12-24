import {
  motion,
  useMotionTemplate,
  useMotionValue,
  AnimatePresence,
  useScroll,
  useTransform,
  MotionValue,
} from 'framer-motion'
import { useTranslation } from '@/context/LanguageContext'
import Image from 'next/image'
import { MouseEvent, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Video,
  Globe,
  BrainCircuit,
  Smartphone,
  Snowflake,
  Zap,
} from 'lucide-react'

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

        {/* Hero Section with Scroll Animation */}
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center justify-center text-center">
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

                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  <span className="block text-gray-900 dark:text-white">
                    {t.focusLabLanding.hero.titlePre}
                  </span>
                  <span className="from-primary-500 dark:from-primary-400 block bg-gradient-to-r to-indigo-600 bg-clip-text text-transparent dark:to-indigo-400">
                    {t.focusLabLanding.hero.titlePost}
                  </span>
                </h1>

                <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-600 md:text-xl dark:text-gray-300">
                  {t.focusLabLanding.hero.descPre}
                  <span className="mx-1 inline-block rounded-lg bg-orange-100 px-2 py-0.5 font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
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
              </motion.div>
            </div>
          }
        >
          <div className="pointer-events-none relative h-full w-full overflow-hidden">
            <Image
              src={`/static/images/dashboard-${language === 'zh' ? 'zh' : 'en'}.png`}
              alt="Focus Lab Dashboard"
              width={language === 'zh' ? 3364 : 3360}
              height={language === 'zh' ? 1838 : 1862}
              className="h-auto w-full rounded-2xl object-cover object-top shadow-sm"
              priority
              sizes="(max-width: 768px) 100vw, 85vw"
            />
            {/* Shimmer/Reflection Effect */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />
          </div>
        </ContainerScroll>

        {/* 2. Pain Points Section */}
        <section id="pain-points" className="py-12 md:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              {t.focusLabLanding.painPoints.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              {t.focusLabLanding.painPoints.desc}
            </p>
          </div>

          <div className="mt-16">
            <BentoGrid
              items={[
                {
                  title: t.focusLabLanding.painPoints.items[0].title,
                  description: t.focusLabLanding.painPoints.items[0].desc,
                  icon: <BrainCircuit className="h-4 w-4 text-rose-500" />,
                  status: 'Critical',
                  tags: ['Focus', 'Energy'],
                  colSpan: 3,
                  hasPersistentHover: true,
                },
                {
                  title: t.focusLabLanding.painPoints.items[1].title,
                  description: t.focusLabLanding.painPoints.items[1].desc,
                  icon: <Smartphone className="h-4 w-4 text-amber-500" />,
                  status: 'High Risk',
                  tags: ['Distraction', 'Digital'],
                  colSpan: 2,
                },
                {
                  title: t.focusLabLanding.painPoints.items[2].title,
                  description: t.focusLabLanding.painPoints.items[2].desc,
                  icon: <Clock className="h-4 w-4 text-blue-500" />,
                  tags: ['Planning', 'Time'],
                  colSpan: 3,
                },
                {
                  title: t.focusLabLanding.painPoints.items[3].title,
                  description: t.focusLabLanding.painPoints.items[3].desc,
                  icon: <Snowflake className="h-4 w-4 text-cyan-500" />,
                  status: 'Common',
                  tags: ['Action', 'Start'],
                  colSpan: 2,
                },
              ]}
            />
          </div>
        </section>

        {/* 3. How it Works */}
        <section id="how-it-works" className="py-12 md:py-24">
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
                  <div
                    key={i}
                    className="group relative flex flex-row items-start gap-6 text-left md:flex-col md:items-center md:text-center"
                  >
                    <div className="group-hover:border-primary-500/50 group-hover:bg-primary-500/10 mb-0 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl font-black text-white backdrop-blur-xl transition-all duration-300 group-hover:scale-110 md:mx-auto md:mb-8 md:h-20 md:w-20 md:text-3xl">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="group-hover:text-primary-400 mb-2 text-xl font-bold text-white transition-colors md:mb-3">
                        {t.focusLabLanding.howItWorks.steps[i].title}
                      </h3>
                      <p className="text-zinc-500 transition-colors group-hover:text-zinc-400">
                        {t.focusLabLanding.howItWorks.steps[i].desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Features Grid */}
        <section id="features" className="py-12 md:py-24">
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
                image: `/static/images/focuslab-landing/focus-clock-${language === 'zh' ? 'zh' : 'en'}.png`,
              },
              {
                emoji: '🗒',
                title: t.focusLabLanding.features.items[1].title,
                desc: t.focusLabLanding.features.items[1].desc,
                color: 'from-blue-500/10 to-indigo-500/10',
                image: `/static/images/focuslab-landing/ai-task-${language === 'zh' ? 'zh' : 'en'}.png`,
              },
              {
                emoji: '🍬',
                title: t.focusLabLanding.features.items[2].title,
                desc: t.focusLabLanding.features.items[2].desc,
                color: 'from-pink-500/10 to-purple-500/10',
                image: `/static/images/focuslab-landing/dopamine-menu-${language === 'zh' ? 'zh' : 'en'}.png`,
              },
              {
                emoji: '📊',
                title: t.focusLabLanding.features.items[3].title,
                desc: t.focusLabLanding.features.items[3].desc,
                color: 'from-emerald-500/10 to-teal-500/10',
                image: `/static/images/focuslab-landing/white-noise-${language === 'zh' ? 'zh' : 'en'}.png`,
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group hover:border-primary-200 dark:hover:border-primary-900/50 flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl sm:flex-row dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <div
                  className={`relative flex h-64 w-full items-center justify-center bg-gradient-to-br ${f.color} p-4 sm:h-auto sm:w-1/2`}
                >
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-20"></div>

                  {/* Component Screenshot */}
                  <div className="relative h-full w-full drop-shadow-2xl transition-transform duration-500 group-hover:scale-105">
                    <Image
                      src={f.image}
                      alt={f.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
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
            {/* The Main Card Wrapper */}
            <div className="relative mx-auto mt-12 w-full max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Testimonial
                    name={t.focusLabLanding.testimonials.items[activeTestimonial].name}
                    role={t.focusLabLanding.testimonials.items[activeTestimonial].role}
                    testimonial={t.focusLabLanding.testimonials.items[activeTestimonial].quote}
                    rating={5}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls - Absolute and Fixed relative to the outer container to avoid moving */}
              <div className="pointer-events-none absolute top-1/2 -left-20 flex w-[calc(100%+160px)] -translate-y-1/2 items-center justify-between xl:-left-32 xl:w-[calc(100%+256px)]">
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

const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode
  children: React.ReactNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
  })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const scaleDimensions = () => {
    return isMobile ? [1, 1] : [1.05, 1]
  }

  const rotate = useTransform(scrollYProgress, [0, 1], [isMobile ? 0 : 20, 0])
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions())
  const translate = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : -100])

  return (
    <div
      className="relative flex h-auto items-start justify-center overflow-hidden p-2 py-12 md:h-[60rem] md:px-20 md:pt-20 lg:h-[80rem]"
      ref={containerRef}
    >
      <div className="relative w-full py-0 md:pt-0 md:[perspective:1000px]" style={{}}>
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale} isMobile={isMobile}>
          {children}
        </Card>
      </div>
    </div>
  )
}

const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>
  titleComponent: React.ReactNode | string
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div mx-auto max-w-7xl text-center"
    >
      {titleComponent}
    </motion.div>
  )
}

const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>
  scale: MotionValue<number>
  translate: MotionValue<number>
  children: React.ReactNode
  isMobile: boolean
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
      }}
      className="mx-auto mt-8 w-full max-w-5xl rounded-[30px] border-none bg-transparent shadow-sm md:mt-20 md:p-0 md:shadow-[0_0_#0000004d,0_9px_20px_#0000004a,0_37px_37px_#00000042,0_84px_50px_#00000026,0_149px_60px_#0000000a,0_233px_65px_#00000003]"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-transparent md:rounded-2xl">
        {children}
      </div>
    </motion.div>
  )
}

// --- New Testimonial Component ---

interface TestimonialProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  role: string
  company?: string
  testimonial: string
  rating?: number
  image?: string
}

const Testimonial = ({
  name,
  role,
  company,
  testimonial,
  rating = 5,
  image,
  className,
  ...props
}: TestimonialProps) => {
  return (
    <div
      className={cn(
        'border-primary-500/10 dark:hover:shadow-primary-500/5 relative overflow-hidden rounded-2xl border bg-white p-6 transition-all hover:shadow-lg md:p-8 dark:bg-zinc-900',
        className
      )}
      {...props}
    >
      <div className="absolute top-6 right-6 font-serif text-6xl text-gray-200 dark:text-zinc-800">
        "
      </div>

      <div className="flex h-full flex-col justify-between gap-4">
        {rating > 0 && (
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <StarIcon
                key={index}
                className={cn(
                  'h-4 w-4',
                  index < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
                )}
              />
            ))}
          </div>
        )}

        <p className="text-base text-pretty text-gray-600 dark:text-zinc-300">{testimonial}</p>

        <div className="flex items-center justify-start gap-4">
          <div className="flex items-center gap-4">
            {image ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image src={image} alt={name} fill className="object-cover" />
              </div>
            ) : (
              <div className="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 flex h-12 w-12 items-center justify-center rounded-full font-bold">
                {name[0]}
              </div>
            )}

            <div className="flex flex-col text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {role}
                {company && ` @ ${company}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StarIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

// --- Bento Grid Components ---

export interface BentoItem {
  title: string
  description: string
  icon: React.ReactNode
  status?: string
  tags?: string[]
  meta?: string
  cta?: string
  colSpan?: number
  hasPersistentHover?: boolean
}

interface BentoGridProps {
  items: BentoItem[]
}

function BentoGrid({ items }: BentoGridProps) {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 p-4 md:grid-cols-5">
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            'group relative overflow-hidden rounded-xl p-4 transition-all duration-300',
            'border border-gray-100/80 bg-white dark:border-white/10 dark:bg-black',
            'hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]',
            'will-change-transform hover:-translate-y-0.5',
            item.colSpan || 'col-span-1',
            item.colSpan === 2 ? 'md:col-span-2' : '',
            item.colSpan === 3 ? 'md:col-span-3' : '',
            {
              '-translate-y-0.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]': item.hasPersistentHover,
              'dark:shadow-[0_2px_12px_rgba(255,255,255,0.03)]': item.hasPersistentHover,
            }
          )}
        >
          <div
            className={`absolute inset-0 ${
              item.hasPersistentHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            } transition-opacity duration-300`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:4px_4px] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
          </div>

          <div className="relative flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 transition-all duration-300 group-hover:bg-gradient-to-br dark:bg-white/10">
                {item.icon}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[15px] font-medium tracking-tight text-gray-900 dark:text-gray-100">
                {item.title}
                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                  {item.meta}
                </span>
              </h3>
              <p className="text-sm leading-snug font-[425] text-gray-600 dark:text-gray-300">
                {item.description}
              </p>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                {item.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-black/5 px-2 py-1 backdrop-blur-sm transition-all duration-200 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-transparent via-gray-100/50 to-transparent p-px transition-opacity duration-300 dark:via-white/10 ${
              item.hasPersistentHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          />
        </div>
      ))}
    </div>
  )
}
