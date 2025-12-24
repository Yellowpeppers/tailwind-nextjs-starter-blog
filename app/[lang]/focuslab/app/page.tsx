import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { genPageMetadata } from 'app/seo'
import { FocusLabDashboard } from '../FocusLabDashboard'
import { resolveLocale } from '@/lib/i18n'

const focusLabAppDescription = {
  en: 'Free ADHD workspace with Brown Noise, AI Task Breaker, and Pomodoro timer. Beat executive dysfunction and enter flow state.',
  zh: '免费的 ADHD 专注工作台，内置红/白噪音、AI 任务拆解器和番茄钟。对抗执行功能障碍，快速进入心流状态。',
}

const focusLabAppTitle = {
  en: 'Free Brown Noise, Pomodoro & ADHD Tools - Focus Lab App',
  zh: '免费红噪音、番茄钟在线工具 - Focus Lab 专注面板',
}

const focusLabAppKeywords = {
  en: ['ADHD dashboard', 'brown noise online', 'task breaker', 'pomodoro timer', 'focus app'],
  zh: ['ADHD面板', '红噪音在线', '任务拆解', '番茄钟', '专注软件'],
}

export async function generateMetadata(props: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const params = await props.params
  const locale = resolveLocale(params.lang)

  return genPageMetadata({
    title: locale === 'zh' ? focusLabAppTitle.zh : focusLabAppTitle.en,
    params: { lang: params.lang },
    path: '/focuslab/app',
    description: locale === 'zh' ? focusLabAppDescription.zh : focusLabAppDescription.en,
    appendSiteName: false,
    keywords: locale === 'zh' ? focusLabAppKeywords.zh : focusLabAppKeywords.en,
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
  description: focusLabAppDescription.en,
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
