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

export type UIStyle = 'modern' | 'warm' | 'green' | 'blue' | 'cartoon'

interface ThemeColorContextType {
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
  uiStyle: UIStyle
  setUiStyle: (style: UIStyle) => void
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined)

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColor] = useState<ThemeColor>('pink')
  const [uiStyle, setUiStyle] = useState<UIStyle>('cartoon')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const storedColor = localStorage.getItem('theme-color') as ThemeColor
    if (storedColor && (storedColor as string) !== 'khaki') {
      setThemeColor(storedColor)
    }

    // Check for saved UI style
    const storedStyle = localStorage.getItem('ui-style') as UIStyle
    if (storedStyle) {
      setUiStyle(storedStyle)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', themeColor)
      localStorage.setItem('theme-color', themeColor)

      // Set UI style attribute
      document.documentElement.setAttribute('data-style', uiStyle)
      localStorage.setItem('ui-style', uiStyle)
    }
  }, [themeColor, uiStyle, mounted])

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor, uiStyle, setUiStyle }}>
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
