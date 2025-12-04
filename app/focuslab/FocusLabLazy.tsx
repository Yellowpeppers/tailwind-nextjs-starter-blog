'use client'

import dynamic from 'next/dynamic'

const FocusLabDashboard = dynamic(
  () => import('./FocusLabDashboard').then((mod) => mod.FocusLabDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">
          Loading Focus Lab
        </p>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Building your distraction-free workspace...
        </p>
      </div>
    ),
  }
)

export function FocusLabLazy() {
  return <FocusLabDashboard />
}
