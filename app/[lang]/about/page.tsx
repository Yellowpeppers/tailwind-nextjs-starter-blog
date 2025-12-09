import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import { components } from '@/components/MDXComponents'
import AboutContent from '@/components/AboutContent'
import { resolveLocale } from '@/lib/i18n'

export async function generateMetadata(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const baseMetadata = genPageMetadata({
    title: 'About Us: Privacy-First ADHD Tools | NeuroHacks Lab',
    description:
      'NeuroHacks Lab is a free, privacy-first project built by an ADHD developer. We provide scientific screening and focus tools without collecting your data.',
    keywords: ['privacy first adhd', 'neurohacks lab', 'about us', 'adhd developer'],
    path: '/about',
    appendSiteName: false,
    locale,
  })
  return {
    ...baseMetadata,
    title: {
      absolute: 'About Us: Privacy-First ADHD Tools | NeuroHacks Lab',
    },
  }
}

export default function Page() {
  const authorEn = allAuthors.find((p) => p.slug === 'default') as Authors
  const authorCn = allAuthors.find((p) => p.slug === 'default-zh') as Authors
  const mainContentEn = coreContent(authorEn)
  const mainContentCn = coreContent(authorCn)

  return (
    <AboutContent
      authorEn={authorEn}
      authorCn={authorCn}
      mainContentEn={mainContentEn}
      mainContentCn={mainContentCn}
    />
  )
}
