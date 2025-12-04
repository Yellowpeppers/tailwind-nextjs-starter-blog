import { genPageMetadata } from 'app/seo'
import siteMetadata from '@/data/siteMetadata'
import FocusLabInfo from '@/components/FocusLabInfo'
import { FocusLabLazy } from './FocusLabLazy'

const focusLabDescription =
  'Overwhelmed? This free ADHD dashboard helps you hack executive dysfunction with AI task breakdowns, Brown Noise, Pomodoro timers, and body doubling rituals.'

export const metadata = genPageMetadata({
  title: 'Focus Lab: ADHD Dashboard, Brown Noise & AI Timer',
  description: focusLabDescription,
  path: '/focuslab',
  appendSiteName: false,
  keywords: [
    'adhd dashboard',
    'brown noise generator',
    'ai task breaker',
    'visual timer',
    'body doubling app',
    'dopamine menu',
    'executive dysfunction',
    'goblin tools alternative',
    'focus timer',
  ],
  openGraph: {
    images: [`${siteMetadata.siteUrl}/static/images/twitter-card.png`],
  },
})

const focusLabSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Focus Lab — Quiet ADHD Dashboard',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description: focusLabDescription,
  featureList: [
    'Brown, pink, and white noise soundboard',
    'AI task breaker and dopamine menu',
    'Body doubling rituals and Pomodoro timers',
    'Drag-and-drop ADHD workspace widgets',
  ],
  url: `${siteMetadata.siteUrl}/focuslab`,
  creator: {
    '@type': 'Organization',
    name: siteMetadata.title,
    url: siteMetadata.siteUrl,
  },
}

export default function Projects() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(focusLabSchema) }}
      />
      <div className="min-h-screen">
        <FocusLabLazy />
        <FocusLabInfo />
      </div>
    </>
  )
}
