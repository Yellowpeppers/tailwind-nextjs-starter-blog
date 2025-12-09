import { genPageMetadata } from 'app/seo'
import siteMetadata from '@/data/siteMetadata'
import FocusLabInfo from '@/components/FocusLabInfo'
import { FocusLabLazy } from './FocusLabLazy'
import { resolveLocale } from '@/lib/i18n'

const focusLabDescription =
  'A browser-based ADHD workspace. Features AI task breakdown, Brown Noise, Pomodoro timer, and "Body Doubling" tools to hack executive dysfunction.'

export async function generateMetadata(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const baseMetadata = genPageMetadata({
    title: 'Focus Lab: Free ADHD Productivity Dashboard & Body Doubling Tools',
    description: focusLabDescription,
    path: '/focuslab',
    appendSiteName: false,
    keywords: [
      'adhd productivity dashboard',
      'body doubling app',
      'online adhd planner',
      'brown noise generator',
      'ai task breaker',
      'focus lab',
    ],
    openGraph: {
      images: [`${siteMetadata.siteUrl}/static/images/twitter-card.png`],
    },
    locale,
  })

  return {
    ...baseMetadata,
    title: {
      absolute: 'Focus Lab: Free ADHD Productivity Dashboard & Body Doubling Tools',
    },
  }
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
      <div className="min-h-screen">
        <FocusLabLazy />
        <FocusLabInfo />
      </div>
    </>
  )
}
