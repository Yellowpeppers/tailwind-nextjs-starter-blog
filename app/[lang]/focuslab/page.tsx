import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { FocusLabLandingEntry } from './FocusLabLandingEntry'
import { genPageMetadata } from 'app/seo'
import { resolveLocale } from '@/lib/i18n'

const focusLabDescription = {
  en: 'Free ADHD workspace with Brown Noise, AI Task Breaker, and Pomodoro timer. Beat executive dysfunction and enter flow state.',
  zh: '免费的 ADHD 专注工作台，内置红/白噪音、AI 任务拆解器和番茄钟。对抗执行功能障碍，快速进入心流状态。',
}

const focusLabTitle = {
  en: 'White Noise, AI Task Breaker & ADHD Timer - Focus Lab',
  zh: '白噪音、AI 任务拆解与番茄钟 - Focus Lab 专注工作台',
}

const focusLabKeywords = {
  en: [
    'ADHD workspace',
    'brown noise player',
    'AI task breakdown',
    'pomodoro timer',
    'focus tools',
  ],
  zh: ['ADHD工作台', '白噪音', '任务拆解', '番茄钟', '专注工具'],
}

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const params = await props.params
  const locale = resolveLocale(params.lang)

  return genPageMetadata({
    title: locale === 'zh' ? focusLabTitle.zh : focusLabTitle.en,
    params: { lang: params.lang },
    path: '/focuslab',
    description: locale === 'zh' ? focusLabDescription.zh : focusLabDescription.en,
    appendSiteName: false,
    keywords: locale === 'zh' ? focusLabKeywords.zh : focusLabKeywords.en,
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
  description: focusLabDescription.en,
  featureList: [
    'Brown, pink, and white noise soundboard',
    'AI task breaker and dopamine menu',
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

export default async function Projects({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const appHref = `/${lang}/focuslab/app`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(focusLabSchema) }}
      />
      <FocusLabLandingEntry appHref={appHref} />
    </>
  )
}
