'use client'

import Link from './Link'
import { useTranslation } from '@/context/LanguageContext'

export default function ADHDTestCard() {
  const { t } = useTranslation()
  const promo = t.focusLab.promo

  return (
    <div className="shadow-primary-500/10 my-8 flex flex-col items-center justify-between gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg md:flex-row">
      <div className="flex-1">
        <p className="text-primary-500 text-xs font-semibold tracking-[0.4em] uppercase">
          {promo.proTip}
        </p>
        <h3 className="mt-2 text-2xl font-bold text-gray-900">{promo.title}</h3>
        <p className="mt-3 text-sm text-gray-600">{promo.description}</p>
      </div>
      <div className="flex-shrink-0">
        <Link
          href="/test"
          className="bg-primary-500 focus-visible:outline-primary-500 inline-flex transform items-center rounded-full px-6 py-2 font-medium !text-white text-white transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {promo.button}
        </Link>
      </div>
    </div>
  )
}
