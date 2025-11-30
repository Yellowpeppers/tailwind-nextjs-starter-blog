'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { dictionary, Locale } from '@/data/locale/dictionary'

interface LanguageContextProps {
  language: Locale
  setLanguage: (lang: Locale) => void
  t: typeof dictionary.en
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Locale>('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Locale
    if (savedLang && (savedLang === 'en' || savedLang === 'cn')) {
      setLanguage(savedLang)
    }
  }, [])

  const handleSetLanguage = (lang: Locale) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t: dictionary[language],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useTranslation = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
