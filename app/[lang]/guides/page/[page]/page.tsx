import ListLayout from '@/layouts/ListLayoutWithTags'
import { notFound } from 'next/navigation'
import { locales, resolveLocale } from '@/lib/i18n'
import { genPageMetadata } from 'app/seo'
import { getLocalizedCoreContent, getLocalizedPosts } from '@/lib/posts'
import { getDictionary } from '@/data/locale/dictionary'

const POSTS_PER_PAGE = 5

export const generateStaticParams = async () => {
  return locales.flatMap((lang) => {
    const { posts } = getLocalizedPosts(lang)
    const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))
    return Array.from({ length: totalPages }, (_, i) => ({
      lang,
      page: (i + 1).toString(),
    }))
  })
}

export async function generateMetadata(props: { params: Promise<{ lang: string; page: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const dictionary = await getDictionary(locale)
  const pageNumber = params.page
  return genPageMetadata({
    title: `${dictionary.guides.metaTitle} — Page ${pageNumber}`,
    description: dictionary.guides.metaDescription,
    path: `/guides/page/${pageNumber}`,
    locale,
  })
}

export default async function Page(props: { params: Promise<{ lang: string; page: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const dictionary = await getDictionary(locale)
  const { posts, localeUsed } = getLocalizedCoreContent(locale)
  const pageNumber = parseInt(params.page as string)
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))

  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound()
  }

  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={{ currentPage: pageNumber, totalPages }}
      title={dictionary.guides.pageTitle}
      contentLocale={localeUsed}
    />
  )
}
