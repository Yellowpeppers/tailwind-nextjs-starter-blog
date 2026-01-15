import { useState, useEffect } from 'react'

interface TypewriterProps {
  text: string
  speed?: number
  onComplete?: () => void
}

export const Typewriter = ({ text, speed = 30, onComplete }: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i))
        i++
      } else {
        clearInterval(timer)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, onComplete])

  return <>{displayedText}</>
}
