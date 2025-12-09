'use client'

import { useTranslation } from '@/context/LanguageContext'
import { replaceLocaleInPathname } from '@/lib/i18n'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const LanguageSwitch = () => {
  const { language, setLanguage } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const toggleLocale = language === 'en' ? 'zh' : 'en'

  const handleToggle = () => {
    const basePath = replaceLocaleInPathname(pathname ?? '/', toggleLocale)
    const query = searchParams?.toString()
    const destination = query ? `${basePath}?${query}` : basePath
    setLanguage(toggleLocale)
    router.push(destination)
  }

  return (
    <button
      aria-label="Toggle Language"
      onClick={handleToggle}
      className="rounded p-1 font-medium text-gray-900 transition-colors hover:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-800"
    >
      {language === 'en' ? '中' : 'EN'}
    </button>
  )
}

export default LanguageSwitch
