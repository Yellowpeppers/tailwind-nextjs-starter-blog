import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { genPageMetadata } from 'app/seo'
import { FocusLabDashboard } from '../FocusLabDashboard'

const focusLabDescription =
  'Free ADHD workspace with Brown Noise, AI Task Breaker, and Pomodoro timer. Beat executive dysfunction and enter flow state.'

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const params = await props.params
  return genPageMetadata({
    title: 'Focus Lab Dashboard',
    params: { lang: params.lang },
    description: focusLabDescription,
    appendSiteName: true,
    keywords: [
      'ADHD productivity tools',
      'AI task breaker',
      'brown noise',
      'pomodoro timer',
      'executive dysfunction',
    ],
  })
}

const focusLabAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Focus Lab Dashboard',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    category: 'Free Tier',
  },
  description: focusLabDescription,
  url: `${siteMetadata.siteUrl}/focuslab/app`,
  creator: {
    '@type': 'Organization',
    name: siteMetadata.title,
    url: siteMetadata.siteUrl,
  },
}

export default async function FocusLabAppPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const exitHref = `/${lang}/focuslab`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(focusLabAppSchema) }}
      />
      <FocusLabDashboard onExitHref={exitHref} />
    </>
  )
}
