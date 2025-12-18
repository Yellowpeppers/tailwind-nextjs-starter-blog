import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { FocusLabDashboard } from './FocusLabDashboard'
import { genPageMetadata } from 'app/seo'

const focusLabDescription =
  'Free ADHD workspace with Brown Noise, Body Doubling, and Pomodoro timer. Beat executive dysfunction and enter flow state.'

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const params = await props.params
  return genPageMetadata({
    title: 'Focus Lab: ADHD Productivity Dashboard',
    params: { lang: params.lang },
    description: focusLabDescription,
    appendSiteName: false,
    keywords: [
      'ADHD productivity tools',
      'body doubling',
      'brown noise',
      'pomodoro timer',
      'executive dysfunction',
    ],
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
    category: 'Free Tier',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
  description: focusLabDescription,
  featureList: [
    'Brown, pink, and white noise soundboard',
    'AI task breaker and dopamine menu',
    'Body doubling rituals and Pomodoro timers',
    'Drag-and-drop ADHD workspace widgets',
    'Local-first data privacy',
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
