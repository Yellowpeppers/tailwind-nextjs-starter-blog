'use client'

import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { SearchProvider, SearchConfig } from 'pliny/search'
import { KBarSearchProvider } from 'pliny/search/KBar'
import { AlgoliaSearchProvider } from 'pliny/search/Algolia'

// Context to let buttons know status
export const LazySearchContext = createContext({
  isLoaded: false,
  toggleSearch: () => {},
})

export const useLazySearch = () => useContext(LazySearchContext)

export const SearchProviderClient = ({
  children,
  searchConfig,
}: {
  children: ReactNode
  searchConfig: SearchConfig
}) => {
  const [isLoaded, setIsLoaded] = useState(false)

  // Listen for Cmd+K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault() // Prevent default browser behavior
        setIsLoaded(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleSearch = () => {
    setIsLoaded(true)
  }

  return (
    <LazySearchContext.Provider value={{ isLoaded, toggleSearch }}>
      {isLoaded ? (
        <SearchProvider searchConfig={searchConfig}>{children}</SearchProvider>
      ) : (
        children
      )}
    </LazySearchContext.Provider>
  )
}
