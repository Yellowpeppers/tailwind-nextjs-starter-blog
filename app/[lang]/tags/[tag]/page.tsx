import { slug } from 'github-slugger'
import { allCoreContent } from 'pliny/utils/contentlayer'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { genPageMetadata } from 'app/seo'
import { Metadata } from 'next'
import { addLocalePrefix, locales, resolveLocale } from '@/lib/i18n'
import { getTagCounts } from '@/lib/tagData'
import { getLocalizedPosts } from '@/lib/posts'

const POSTS_PER_PAGE = 5

export async function generateMetadata(props: {
  params: Promise<{ lang: string; tag: string }>
}): Promise<Metadata> {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const encodedTag = params.tag
  const tag = decodeURI(encodedTag)
  const { counts } = getTagCounts(locale)
  const postCount = counts[tag] ?? 0
  const noIndex = postCount < 2

  return genPageMetadata({
    title: tag,
    description: `${siteMetadata.title} ${tag} tagged content`,
    path: `/tags/${encodedTag}`,
    locale,
    alternates: {
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}${addLocalePrefix(
          locale,
          `/tags/${tag}/feed.xml`
        )}`,
      },
    },
    robots: {
      index: !noIndex,
      follow: true,
    },
  })
}

export const generateStaticParams = async () => {
  return locales.flatMap((lang) => {
    const { counts } = getTagCounts(lang)
    const tagKeys = Object.keys(counts)
    return tagKeys.map((tag) => ({
      lang,
      tag: encodeURI(tag),
    }))
  })
}

export default async function TagPage(props: { params: Promise<{ lang: string; tag: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const tag = decodeURI(params.tag)
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  const { posts, localeUsed } = getLocalizedPosts(locale)
  const filteredPosts = posts.filter(
    (post) => post.tags && post.tags.map((t) => slug(t)).includes(tag)
  )
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const coreContent = allCoreContent(filteredPosts)
  const initialDisplayPosts = coreContent.slice(0, POSTS_PER_PAGE)

  return (
    <ListLayout
      posts={coreContent}
      initialDisplayPosts={initialDisplayPosts}
      pagination={{ currentPage: 1, totalPages }}
      title={title}
      contentLocale={localeUsed}
    />
  )
}
