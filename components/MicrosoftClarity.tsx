'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

const MicrosoftClarity = () => {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const handleInteraction = () => {
      setShouldLoad(true)
    }

    // Load on interaction
    window.addEventListener('scroll', handleInteraction, { once: true })
    window.addEventListener('mousemove', handleInteraction, { once: true })
    window.addEventListener('touchstart', handleInteraction, { once: true })
    window.addEventListener('click', handleInteraction, { once: true })
    window.addEventListener('keydown', handleInteraction, { once: true })

    // Fallback: load after 5 seconds anyway if no interaction
    const timer = setTimeout(() => {
      setShouldLoad(true)
    }, 5000)

    return () => {
      window.removeEventListener('scroll', handleInteraction)
      window.removeEventListener('mousemove', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
      clearTimeout(timer)
    }
  }, [])

  if (!shouldLoad) return null

  return (
    <Script
      id="microsoft-clarity"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "uf2g8eszrm");
        `,
      }}
    />
  )
}

export default MicrosoftClarity
