import siteMetadata from '@/data/siteMetadata'
import { FocusLabDashboard } from './FocusLabDashboard'
import { genPageMetadata } from 'app/seo'

const focusLabDescription =
  'A browser-based ADHD workspace. Features AI task breakdown, Brown Noise, Pomodoro timer, and "Body Doubling" tools to hack executive dysfunction.'

export async function generateMetadata(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  return genPageMetadata({
    title: 'Focus Lab: Free ADHD Productivity Dashboard & Body Doubling Tools',
    params: { lang: params.lang },
    description: focusLabDescription,
  })
}

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
      {/* 
         FocusLabDashboard manages the entire view: 
         1. Landing Page (default)
         2. Application Dashboard (lazy loaded)
      */}
      <FocusLabDashboard />
    </>
  )
}
