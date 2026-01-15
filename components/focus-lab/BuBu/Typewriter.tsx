import { useState, useEffect, useRef } from 'react'

interface TypewriterProps {
  text: string
  speed?: number
  onComplete?: () => void
}

export const Typewriter = ({ text, speed = 30, onComplete }: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('')
  const indexRef = useRef(0)
  const onCompleteRef = useRef(onComplete)

  // Keep onComplete ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    // Reset when text changes
    indexRef.current = 0
    setDisplayedText('')

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        const nextChar = text.charAt(indexRef.current)
        setDisplayedText((prev) => prev + nextChar)
        indexRef.current++
      } else {
        clearInterval(timer)
        onCompleteRef.current?.()
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return <>{displayedText}</>
}
