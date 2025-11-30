'use client'

import { useTranslation } from '@/context/LanguageContext'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { components } from '@/components/MDXComponents'
import type { Authors } from 'contentlayer/generated'

interface Props {
  authorEn: Authors
  authorCn: Authors
  mainContentEn: Omit<Authors, '_id' | '_raw' | 'body'>
  mainContentCn: Omit<Authors, '_id' | '_raw' | 'body'>
}

export default function AboutContent({ authorEn, authorCn, mainContentEn, mainContentCn }: Props) {
  const { language } = useTranslation()
  const isCn = language === 'cn'

  const author = isCn ? authorCn : authorEn
  const content = isCn ? mainContentCn : mainContentEn

  return (
    <AuthorLayout content={content}>
      <MDXLayoutRenderer code={author.body.code} components={components} />
    </AuthorLayout>
  )
}
