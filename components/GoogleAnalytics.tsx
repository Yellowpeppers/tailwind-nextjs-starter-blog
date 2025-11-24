'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import siteMetadata from '@/data/siteMetadata'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

type AnalyticsWithGA = typeof siteMetadata.analytics & { googleAnalyticsId?: string }

export default function GoogleAnalytics() {
  const measurementId = (siteMetadata.analytics as AnalyticsWithGA | undefined)?.googleAnalyticsId
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()

  useEffect(() => {
    if (!measurementId) return

    const url = searchParamsString ? `${pathname}?${searchParamsString}` : pathname
    window.gtag?.('config', measurementId, {
      page_path: url,
    })
  }, [measurementId, pathname, searchParamsString])

  if (!measurementId) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  )
}
