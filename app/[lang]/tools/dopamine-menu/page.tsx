'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { genPageMetadata } from 'app/seo'
import { resolveLocale } from '@/lib/i18n'
import { useTranslation } from '@/context/LanguageContext'
import { Dictionary, getDictionary } from '@/data/locale/dictionary'

type EnergyLevel = 'low' | 'medium' | 'high'

type SpinResult = {
  id: string
  activity: string
}

const buildEnergyModes = (copy: Dictionary['tools']['dopamine']) => {
  const gradient = 'bg-pink-500 shadow-lg shadow-pink-300/70'
  return {
    low: { ...copy.energyModes.low, selectorGradient: gradient },
    medium: { ...copy.energyModes.medium, selectorGradient: gradient },
    high: { ...copy.energyModes.high, selectorGradient: gradient },
  } as const
}

const energyOrder: EnergyLevel[] = ['low', 'medium', 'high']

const getRandomActivity = (energy: EnergyLevel, modes: ReturnType<typeof buildEnergyModes>) => {
  const options = modes[energy].activities
  const activity = options[Math.floor(Math.random() * options.length)]
  return {
    id: `${energy}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    activity,
  }
}

export async function generateMetadata(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const dict = await getDictionary(locale)
  const copy = dict.tools.dopamine
  return genPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: '/tools/dopamine-menu',
    appendSiteName: false,
    locale,
  })
}

export default function DopamineMenuPage() {
  const { t } = useTranslation()
  const copy = t.tools.dopamine
  const energyModes = useMemo(() => buildEnergyModes(copy), [copy])
  const [activeEnergy, setActiveEnergy] = useState<EnergyLevel>('low')
  const [spinResult, setSpinResult] = useState<SpinResult>(() =>
    getRandomActivity('low', energyModes)
  )

  useEffect(() => {
    setSpinResult(getRandomActivity(activeEnergy, energyModes))
  }, [activeEnergy, energyModes])

  const handleSpin = () => {
    setSpinResult(getRandomActivity(activeEnergy, energyModes))
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffe4e6,_#fdf2f8_45%,_#ecfeff)]">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.4em] text-rose-400 uppercase">
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-black text-slate-900">{copy.title}</h1>
          <p className="mt-3 text-lg text-slate-600">{copy.subtitle}</p>
        </div>

        <section className="mt-12 space-y-10">
          <div>
            <p className="text-center text-sm font-semibold tracking-[0.4em] text-slate-500 uppercase">
              {copy.question}
            </p>
            <div className="relative mt-5 grid grid-cols-3 gap-2 rounded-full bg-white/75 p-1 text-sm font-medium shadow-xl shadow-slate-200">
              {energyOrder.map((energy) => {
                const isActive = activeEnergy === energy
                return (
                  <button
                    key={energy}
                    type="button"
                    onClick={() => setActiveEnergy(energy)}
                    className="relative overflow-hidden rounded-full px-3 py-3 text-left transition"
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="energy-pill"
                        className={`absolute inset-0 rounded-full ${energyModes[energy].selectorGradient}`}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    ) : null}
                    <span
                      className={`relative z-10 block text-base font-semibold ${isActive ? 'text-white' : 'text-slate-600'}`}
                    >
                      {energyModes[energy].label}
                    </span>
                    <span
                      className={`relative z-10 block text-xs ${isActive ? 'text-white/90' : 'text-slate-400'}`}
                    >
                      {energyModes[energy].selectorHint}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <motion.div
            key={activeEnergy}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 p-8 text-white shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="pointer-events-none absolute -top-10 left-10 h-28 w-28 rounded-full bg-white/20 blur-3xl" />
            <div className="pointer-events-none absolute right-0 bottom-0 h-48 w-48 rounded-full bg-white/20 blur-3xl" />

            <div className="relative">
              <p className="text-sm tracking-[0.55em] text-white/80 uppercase">
                {copy.nowServingEyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white/90">
                {energyModes[activeEnergy].description}
              </h2>
            </div>

            <div
              className="relative mt-6 rounded-2xl bg-black/10 p-6 text-center backdrop-blur-md"
              aria-live="polite"
            >
              <p className="text-xs font-semibold tracking-[0.55em] text-white/70 uppercase">
                {copy.resultEyebrow}
              </p>
              <div className="mt-4 min-h-[72px] overflow-hidden text-3xl font-black tracking-tight drop-shadow">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={spinResult.id}
                    initial={{ y: 40, opacity: 0, rotateX: 90 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    exit={{ y: -40, opacity: 0, rotateX: -90 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    {spinResult.activity}
                  </motion.p>
                </AnimatePresence>
              </div>
              <motion.button
                type="button"
                onClick={handleSpin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 w-full rounded-2xl border border-white/30 bg-white px-5 py-4 text-base font-semibold text-pink-600 shadow-lg shadow-black/20 transition-transform hover:scale-105"
              >
                {copy.spinButton}
              </motion.button>
            </div>

            <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-white/90">
              {energyModes[activeEnergy].activities.map((activity) => (
                <span
                  key={activity}
                  className="rounded-full bg-white/20 px-4 py-2 text-xs tracking-[0.3em] text-white uppercase"
                >
                  {activity}
                </span>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}
