'use client'

import { useTranslation } from '@/context/LanguageContext'

const LanguageSwitch = () => {
  const { language, setLanguage } = useTranslation()

  return (
    <button
      aria-label="Toggle Language"
      onClick={() => setLanguage(language === 'en' ? 'cn' : 'en')}
      className="ml-4 rounded p-1 font-medium text-gray-900 transition-colors hover:bg-gray-200 dark:text-gray-100 dark:hover:bg-gray-800"
    >
      {language === 'en' ? '中' : 'EN'}
    </button>
  )
}

export default LanguageSwitch
