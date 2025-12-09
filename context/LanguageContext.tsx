'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { Dictionary, getDictionary } from '@/data/locale/dictionary'
import { Locale } from '@/lib/i18n'

interface LanguageContextProps {
  language: Locale
  setLanguage: (lang: Locale) => void
  t: Dictionary
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export const LanguageProvider = ({
  children,
  locale,
  dictionary,
}: {
  children: ReactNode
  locale: Locale
  dictionary: Dictionary
}) => {
  const [language, setLanguageState] = useState<Locale>(locale)
  const [messages, setMessages] = useState<Dictionary>(dictionary)

  useEffect(() => {
    setLanguageState(locale)
    setMessages(dictionary)
  }, [locale, dictionary])

  const handleSetLanguage = (lang: Locale) => {
    setLanguageState(lang)
    getDictionary(lang)
      .then((dict) => {
        setMessages(dict)
      })
      .catch((error) => {
        console.error('Failed to load dictionary for locale', lang, error)
      })
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage: handleSetLanguage,
      t: messages,
    }),
    [language, messages]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useTranslation = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
