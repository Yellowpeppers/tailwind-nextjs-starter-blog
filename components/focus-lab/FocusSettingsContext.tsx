'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useFocusSettings, Settings } from './useFocusSettings'

type FocusSettingsContextType = {
  settings: Settings
  updateSettings: (path: string, value: unknown) => void
  isLoaded: boolean
}

const FocusSettingsContext = createContext<FocusSettingsContextType | null>(null)

export function FocusSettingsProvider({ children }: { children: ReactNode }) {
  const focusSettings = useFocusSettings()

  return (
    <FocusSettingsContext.Provider value={focusSettings}>{children}</FocusSettingsContext.Provider>
  )
}

export function useFocusSettingsContext() {
  const context = useContext(FocusSettingsContext)
  if (!context) {
    throw new Error('useFocusSettingsContext must be used within a FocusSettingsProvider')
  }
  return context
}
