'use client'

import dynamic from 'next/dynamic'
import { useTranslation } from '@/context/LanguageContext'

const FocusLabLoading = () => {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">
        {t.focusLab.loading.title}
      </p>
      <p className="mt-4 text-gray-600 dark:text-gray-300">{t.focusLab.loading.description}</p>
    </div>
  )
}

const FocusLabDashboard = dynamic(
  () => import('./FocusLabDashboard').then((mod) => mod.FocusLabDashboard),
  {
    ssr: false,
    loading: () => <FocusLabLoading />,
  }
)

export function FocusLabLazy() {
  return <FocusLabDashboard />
}
