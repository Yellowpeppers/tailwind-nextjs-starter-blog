'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemeColor =
  | 'pink'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'violet'
  | 'orange'
  | 'red'
  | 'slate'

interface ThemeColorContextType {
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined)

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColor] = useState<ThemeColor>('pink')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const storedColor = localStorage.getItem('theme-color') as ThemeColor
    if (storedColor) {
      setThemeColor(storedColor)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', themeColor)
      localStorage.setItem('theme-color', themeColor)
    }
  }, [themeColor, mounted])

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeColorContext.Provider>
  )
}

export function useThemeColor() {
  const context = useContext(ThemeColorContext)
  if (context === undefined) {
    throw new Error('useThemeColor must be used within a ThemeColorProvider')
  }
  return context
}
