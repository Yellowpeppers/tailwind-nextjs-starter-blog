'use client'

import { useCallback } from 'react'
import QuietNewsletterForm from './QuietNewsletterForm'

type WindowWithGtag = Window & {
  gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void
}

interface QuietToolkitCTAProps {
  title?: string
  description?: string
  deliverables?: string[]
  trustBadges?: string[]
  formTitle?: string
  apiUrl?: string
  analyticsEvent?: string
}

const QuietToolkitCTA = ({
  title = 'Download the Quiet Toolkit',
  description = 'Printable checklists, setup guides, and regulation notes delivered straight to your inbox. We send one focused email per release.',
  deliverables = [
    'Quiet Desk Audit + regulation tracker (fillable PDF)',
    'Quiet Sprint timer cards (Pomodoro alternative)',
    'Sensory layering cheat sheet for office / classroom',
  ],
  trustBadges = [
    'Built by NeuroHacks Lab researchers & OT consultants',
    'Library-tested noise ratings under 45 dB',
    'Unsubscribe anytime — zero spam promise',
  ],
  formTitle = 'Email me the Quiet Toolkit',
  apiUrl = '/api/newsletter',
  analyticsEvent = 'quiet_toolkit_download',
}: QuietToolkitCTAProps) => {
  const handleSuccess = useCallback(() => {
    if (typeof window === 'undefined') return
    const win = window as WindowWithGtag
    if (typeof win.gtag === 'function') {
      win.gtag('event', analyticsEvent, {
        event_category: 'engagement',
        event_label: title,
      })
    }
  }, [analyticsEvent, title])

  return (
    <section className="my-12 rounded-3xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-8 shadow-sm dark:border-gray-700 dark:from-gray-900/40 dark:to-gray-900/70">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 md:flex-row">
        <div className="flex-1">
          <p className="text-primary-600 dark:text-primary-400 text-sm font-semibold tracking-wide">
            Quiet Systems Toolkit
          </p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50">{title}</h3>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300">{description}</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-200">
            {deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-inner dark:border-gray-700 dark:bg-gray-900">
          <QuietNewsletterForm title={formTitle} apiUrl={apiUrl} onSuccess={handleSuccess} />
          <ul className="mt-4 space-y-1 text-xs text-gray-500 dark:text-gray-400">
            {trustBadges.map((badge) => (
              <li key={badge}>• {badge}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default QuietToolkitCTA
