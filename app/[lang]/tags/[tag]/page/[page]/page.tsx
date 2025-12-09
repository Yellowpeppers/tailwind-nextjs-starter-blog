import { slug } from 'github-slugger'
import { allCoreContent } from 'pliny/utils/contentlayer'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { notFound } from 'next/navigation'
import { locales, resolveLocale } from '@/lib/i18n'
import { genPageMetadata } from 'app/seo'
import siteMetadata from '@/data/siteMetadata'
import { getTagCounts } from '@/lib/tagData'
import { getLocalizedPosts } from '@/lib/posts'

const POSTS_PER_PAGE = 5

export const generateStaticParams = async () => {
  return locales.flatMap((lang) => {
    const { counts } = getTagCounts(lang)
    return Object.keys(counts).flatMap((tag) => {
      const postCount = counts[tag] ?? 0
      const totalPages = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE))
      return Array.from({ length: totalPages }, (_, i) => ({
        lang,
        tag: encodeURI(tag),
        page: (i + 1).toString(),
      }))
    })
  })
}

export async function generateMetadata(props: {
  params: Promise<{ lang: string; tag: string; page: string }>
}) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const tag = decodeURI(params.tag)
  const { counts } = getTagCounts(locale)
  const postCount = counts[tag] ?? 0
  const totalPages = Math.max(1, Math.ceil(postCount / POSTS_PER_PAGE))
  const pageNumber = parseInt(params.page)
  const noIndex = pageNumber > totalPages || postCount < 2

  return genPageMetadata({
    title: `${tag} — Page ${pageNumber}`,
    description: `${siteMetadata.title} ${tag} tagged content (page ${pageNumber}).`,
    path: `/tags/${params.tag}/page/${params.page}`,
    locale,
    robots: {
      index: !noIndex,
      follow: true,
    },
  })
}

export default async function TagPage(props: {
  params: Promise<{ lang: string; tag: string; page: string }>
}) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const tag = decodeURI(params.tag)
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  const pageNumber = parseInt(params.page)
  const { posts, localeUsed } = getLocalizedPosts(locale)
  const filteredPosts = posts.filter(
    (post) => post.tags && post.tags.map((t) => slug(t)).includes(tag)
  )
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))

  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }

  const coreContent = allCoreContent(filteredPosts)
  const initialDisplayPosts = coreContent.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )

  return (
    <ListLayout
      posts={coreContent}
      initialDisplayPosts={initialDisplayPosts}
      pagination={{ currentPage: pageNumber, totalPages }}
      title={title}
      contentLocale={localeUsed}
    />
  )
}
