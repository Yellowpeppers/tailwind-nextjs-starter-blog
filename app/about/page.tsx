import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'
import { components } from '@/components/MDXComponents'

import AboutContent from '@/components/AboutContent'

export const metadata = genPageMetadata({ title: 'About', path: '/about' })

export default function Page() {
  const authorEn = allAuthors.find((p) => p.slug === 'default') as Authors
  const authorCn = allAuthors.find((p) => p.slug === 'default-cn') as Authors
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
