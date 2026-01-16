import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '@/context/LanguageContext'

// Web Speech API types (not in standard TypeScript lib)
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

interface UseVoiceInputReturn {
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  isSupported: boolean
  clearError: () => void
  error: 'not-allowed' | 'network' | 'unknown' | null
  interimTranscript: string
}

export const useVoiceInput = (): UseVoiceInputReturn => {
  const { language } = useTranslation()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<UseVoiceInputReturn['error']>(null)
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any
      const SpeechRecognition = (win.SpeechRecognition || win.webkitSpeechRecognition) as
        | SpeechRecognitionConstructor
        | undefined

      if (SpeechRecognition) {
        setIsSupported(true)
        const recognitionInstance = new SpeechRecognition()

        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        // 立即设置语言，Chrome 的云端语音识别服务需要在 start() 前设置好语言
        recognitionInstance.lang = language === 'zh' ? 'zh-CN' : 'en-US'

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscriptChunk = ''
          let currentInterim = ''

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i]
            if (result.isFinal) {
              finalTranscriptChunk += result[0].transcript
            } else {
              currentInterim += result[0].transcript
            }
          }

          if (finalTranscriptChunk) {
            setTranscript((prev) => prev + finalTranscriptChunk)
          }
          setInterimTranscript(currentInterim)
        }

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          // no-speech is not a real error - user just didn't speak, silently stop
          if (event.error === 'no-speech') {
            setIsListening(false)
            return
          }

          console.error('Speech recognition error', event.error)
          if (event.error === 'not-allowed') {
            setError('not-allowed')
          } else if (event.error === 'network') {
            setError('network')
          } else if (event.error === 'aborted') {
            // User cancelled, not an error
            setIsListening(false)
            return
          } else {
            setError('unknown')
          }
          setIsListening(false)
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        setRecognition(recognitionInstance)

        return () => {
          recognitionInstance.onend = null // Prevent Loop
          recognitionInstance.abort()
        }
      }
    }
  }, [language])

  // Update language when it changes
  useEffect(() => {
    if (recognition) {
      recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US'
    }
  }, [language, recognition])

  const startListening = useCallback(() => {
    if (recognition) {
      try {
        setError(null)
        recognition.start()
        setIsListening(true)
      } catch (e: unknown) {
        console.error('[Voice] Speech recognition start failed', e)
        const error = e as Error & { name?: string }
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setError('not-allowed')
        } else {
          setError('unknown')
        }
      }
    }
  }, [recognition])

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }, [recognition])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
    clearError,
    interimTranscript,
  }
}
