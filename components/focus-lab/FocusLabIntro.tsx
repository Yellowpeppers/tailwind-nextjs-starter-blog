'use client'

import { useTranslation } from '@/context/LanguageContext'

export function FocusLabIntro() {
  const { t } = useTranslation()

  return (
    <header className="space-y-4 text-center lg:text-left">
      <p className="inline-flex items-center justify-center rounded-full border-2 border-[#0EA5E9] bg-[#0EA5E9]/5 px-5 py-1 text-sm font-semibold tracking-[0.5em] text-[#0EA5E9] uppercase shadow-[0_8px_30px_rgba(14,165,233,0.35)] sm:text-base dark:bg-[#0EA5E9]/10">
        {t.focusLab.header.eyebrow}
      </p>
      <div className="space-y-3">
        <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100">
          {t.focusLab.header.title}
        </h1>
        <p className="max-w-2xl text-lg whitespace-pre-line text-gray-600 dark:text-gray-300">
          {t.focusLab.header.description}
        </p>
      </div>
    </header>
  )
}
