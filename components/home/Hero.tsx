import Link from 'next/link'
import { Dictionary } from '@/data/locale/dictionary'

export default function Hero({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.home

  return (
    <section className="py-16">
      <div className="mx-auto w-full max-w-6xl px-6 text-left">
        <p className="text-primary-500 text-sm font-semibold tracking-[0.2em] uppercase">
          {t.heroTagline}
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100">
          {t.heroHeadline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          {t.heroSubheadline}
        </p>
        <div className="mt-8 flex flex-col items-start gap-4">
          <Link
            href="/test"
            className="bg-primary-500 shadow-primary-500/40 hover:bg-primary-600 focus-visible:ring-primary-500 inline-flex items-center justify-center rounded-2xl px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:-translate-y-1 focus:outline-none focus-visible:ring-2"
          >
            {t.startAssessment}
          </Link>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t.privacyNote}
          </span>
        </div>
      </div>
    </section>
  )
}
