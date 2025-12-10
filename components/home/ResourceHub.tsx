'use client'

import Link from 'next/link'
import { Dictionary } from '@/data/locale/dictionary'
import { BeakerIcon } from '@heroicons/react/24/outline'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export default function ResourceHub({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary

  const sectionAnimation = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  }

  return (
    <motion.section {...sectionAnimation} className="bg-gray-50 py-24 dark:bg-gray-900/50">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-16">
          <div className="text-primary-500 mb-4 flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
            <span className="bg-primary-500 flex h-1 w-1 rounded-full"></span>
            {t.home.resourceHub.tagline}
            <span className="bg-primary-500 flex h-1 w-1 rounded-full"></span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {t.home.resourceHub.title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">{t.home.resourceHub.desc}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Link
            href="/focuslab"
            className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 mb-6 inline-flex items-center justify-center rounded-full p-3">
              <BeakerIcon className="h-10 w-10" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
              {t.nav.focusLab}
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {t.home.resourceHub.focusLabDesc}
            </p>
            <div className="text-primary-600 mt-8 flex items-center justify-between font-semibold">
              <span>{t.home.resourceHub.enterFocusLab}</span>
              <span className="text-xl transition-transform duration-300 group-hover:translate-x-1">
                -&gt;
              </span>
            </div>
          </Link>

          <Link
            href="/guides"
            className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 mb-6 inline-flex items-center justify-center rounded-full p-3">
              <BookOpenIcon className="h-10 w-10" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
              {t.nav.guides}
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">{t.home.resourceHub.guidesDesc}</p>
            <div className="text-primary-600 mt-8 flex items-center justify-between font-semibold">
              <span>{t.home.resourceHub.exploreGuides}</span>
              <span className="text-xl transition-transform duration-300 group-hover:translate-x-1">
                -&gt;
              </span>
            </div>
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
