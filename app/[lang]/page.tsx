import HomeContent from '@/components/HomeContent'
import siteMetadata from '@/data/siteMetadata'
import { getDictionary } from '@/data/locale/dictionary'
import { genPageMetadata } from 'app/seo'
import { locales, resolveLocale } from '@/lib/i18n'
import { getLocalizedCoreContent } from '@/lib/posts'

const baseSiteUrl = siteMetadata.siteUrl.replace(/\/$/, '')
const languageAlternates: Record<string, string> = Object.fromEntries(
  locales.map((locale) => [locale, `${baseSiteUrl}/${locale}`])
)

export async function generateMetadata(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const canonical = `${baseSiteUrl}/${locale}`

  if (locale === 'en') {
    return {
      title: {
        absolute: 'Free ADHD Test Online & Focus Tools | NeuroHacks Lab',
      },
      description:
        'Take the free Adult ADHD Test (WHO ASRS v1.1). Private, instant results, no email required. Plus, access our Focus Lab dashboard to boost productivity.',
      keywords: ['adhd test online', 'free adhd assessment', 'focus tools', 'neurohacks lab'],
      alternates: {
        canonical,
        languages: languageAlternates,
      },
    }
  }

  if (locale === 'zh') {
    return {
      title: {
        absolute: '免费成人 ADHD 专业筛查 & 专注力工具箱 | NeuroHacks Lab',
      },
      description:
        '基于 WHO ASRS v1.1 标准的免费在线自测。隐私保护，无需邮箱，即时出分。内置白噪音与番茄钟专注工具。',
      keywords: ['ADHD自测', '成人多动症', '专注力工具', '免费测试', 'NeuroHacks Lab'],
      alternates: {
        canonical,
        languages: languageAlternates,
      },
    }
  }

  const dictionary = await getDictionary(locale)
  return genPageMetadata({
    title: dictionary.home.heroHeadline,
    description: dictionary.home.heroSubheadline,
    path: '/',
    appendSiteName: false,
    locale,
  })
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const { posts } = getLocalizedCoreContent(locale)
  return <HomeContent posts={posts} />
}
