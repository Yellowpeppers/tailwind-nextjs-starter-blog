import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { uniq } from 'lodash'
import { fetchCloudDopamine, readDopamineStorage, saveDopamine } from '../dopamineStorage'

export const useDopamineSystem = () => {
  const { t, language: lang } = useTranslation()
  const { user } = useAuth()

  // Default options from translation
  const defaultOptions = useMemo(() => {
    return t.focusLab?.widgets?.dopamineMenu?.defaultOptions &&
      Array.isArray(t.focusLab.widgets.dopamineMenu.defaultOptions)
      ? [...t.focusLab.widgets.dopamineMenu.defaultOptions]
      : ['Coffee', 'Walk', 'Nap']
  }, [t])

  // State
  const [options, setOptions] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Refs
  const dataOwnerId = useRef<string | undefined>(undefined)

  // Load
  useEffect(() => {
    const init = async () => {
      if (user) {
        const cloud = await fetchCloudDopamine(user)
        if (cloud && cloud.length > 0) {
          setOptions(uniq(cloud))
          setIsLoaded(true)
          dataOwnerId.current = user.id
          return
        }
      }

      const local = readDopamineStorage(lang, user?.id)
      if (local) {
        setOptions(uniq(local))
      } else {
        setOptions(defaultOptions)
      }
      dataOwnerId.current = user?.id
      setIsLoaded(true)
    }
    init()
  }, [lang, defaultOptions, user])

  // Save
  useEffect(() => {
    if (!isLoaded) return
    if (user?.id !== dataOwnerId.current) {
      if (user || dataOwnerId.current !== undefined) return
    }

    const save = async () => {
      await saveDopamine(options, lang, user)
    }
    const timeout = setTimeout(save, 1000)
    return () => clearTimeout(timeout)
  }, [options, lang, isLoaded, user])

  // Actions
  const addOption = useCallback((option: string) => {
    if (option.trim()) {
      setOptions((prev) => uniq([...prev, option.trim()]))
    }
  }, [])

  const removeOption = useCallback((index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearOptions = useCallback(() => {
    if (options.length === 0) return
    const confirmMsg = lang === 'en' ? 'Clear all dopamine options?' : '清空所有选项？'
    if (window.confirm(confirmMsg)) {
      setOptions([])
    }
  }, [options.length, lang])

  const triggerSpin = useCallback(() => {
    if (options.length === 0) return
    setIsSpinning(true)
    setShowResult(false)
    setSelected(null)

    let count = 0
    const maxCount = 20
    const interval = setInterval(() => {
      setSelected(options[Math.floor(Math.random() * options.length)])
      count++
      if (count > maxCount) {
        clearInterval(interval)
        setIsSpinning(false)
        setShowResult(true)
        const final = options[Math.floor(Math.random() * options.length)]
        setSelected(final)
      }
    }, 100)
  }, [options])

  const resetResult = useCallback(() => {
    setShowResult(false)
  }, [])

  return {
    state: {
      options,
      selected,
      isSpinning,
      showResult,
      isLoaded,
    },
    actions: {
      addOption,
      removeOption,
      clearOptions,
      triggerSpin,
      resetResult,
    },
  }
}

export type UseDopamineSystemResult = ReturnType<typeof useDopamineSystem>
