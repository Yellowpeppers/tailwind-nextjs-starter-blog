'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type EnergyLevel = 'low' | 'medium' | 'high'

type SpinResult = {
  id: string
  activity: string
}

const energyModes: Record<
  EnergyLevel,
  {
    label: string
    selectorHint: string
    description: string
    selectorGradient: string
    activities: string[]
  }
> = {
  low: {
    label: 'Low',
    selectorHint: 'Quick Hit (5 mins)',
    description: 'Micro hits to re-engage your brain without spending a ton of energy.',
    selectorGradient: 'bg-pink-500 shadow-lg shadow-pink-300/70',
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
    selectorGradient: 'bg-pink-500 shadow-lg shadow-pink-300/70',
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
    selectorGradient: 'bg-pink-500 shadow-lg shadow-pink-300/70',
    activities: [
      'Read a chapter',
      'Sketch or draw',
      'Walk outside',
      'Tidy one zone',
      'Cook something cozy',
    ],
  },
}

const energyOrder: EnergyLevel[] = ['low', 'medium', 'high']

const getRandomActivity = (energy: EnergyLevel): SpinResult => {
  const options = energyModes[energy].activities
  const activity = options[Math.floor(Math.random() * options.length)]
  return {
    id: `${energy}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    activity,
  }
}

export default function DopamineMenuPage() {
  const [activeEnergy, setActiveEnergy] = useState<EnergyLevel>('low')
  const [spinResult, setSpinResult] = useState<SpinResult>(() => getRandomActivity('low'))

  useEffect(() => {
    setSpinResult(getRandomActivity(activeEnergy))
  }, [activeEnergy])

  const handleSpin = () => {
    setSpinResult(getRandomActivity(activeEnergy))
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffe4e6,_#fdf2f8_45%,_#ecfeff)]">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.4em] text-rose-400 uppercase">
            Micro Tool
          </p>
          <h1 className="mt-4 text-4xl font-black text-slate-900">The Dopamine Menu</h1>
          <p className="mt-3 text-lg text-slate-600">Don&apos;t doom-scroll. Spin the wheel.</p>
        </div>

        <section className="mt-12 space-y-10">
          <div>
            <p className="text-center text-sm font-semibold tracking-[0.4em] text-slate-500 uppercase">
              How much time/energy do you have?
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
              <p className="text-sm tracking-[0.55em] text-white/80 uppercase">Now Serving</p>
              <h2 className="mt-2 text-2xl font-semibold text-white/90">
                {energyModes[activeEnergy].description}
              </h2>
            </div>

            <div
              className="relative mt-6 rounded-2xl bg-black/10 p-6 text-center backdrop-blur-md"
              aria-live="polite"
            >
              <p className="text-xs font-semibold tracking-[0.55em] text-white/70 uppercase">
                Your pull
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
                Give me a hit
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
