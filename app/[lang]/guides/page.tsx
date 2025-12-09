import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { resolveLocale } from '@/lib/i18n'
import { getLocalizedCoreContent } from '@/lib/posts'
import { getDictionary } from '@/data/locale/dictionary'

const POSTS_PER_PAGE = 5

export async function generateMetadata(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const baseMetadata = genPageMetadata({
    title: 'ADHD Guides, Tips & Sensory Product Reviews | NeuroHacks Lab',
    description:
      'Curated guides for neurodivergent minds. Reviews of quiet fidget toys, low-stim morning routines, and sensory regulation strategies.',
    keywords: ['adhd guides', 'sensory toys reviews', 'adhd life hacks', 'neurohacks lab blog'],
    path: '/guides',
    appendSiteName: false,
    locale,
  })
  return {
    ...baseMetadata,
    title: {
      absolute: 'ADHD Guides, Tips & Sensory Product Reviews | NeuroHacks Lab',
    },
  }
}

export default async function BlogPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const dictionary = await getDictionary(locale)
  const { posts, localeUsed } = getLocalizedCoreContent(locale)
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE)

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={{ currentPage: 1, totalPages }}
      title={dictionary.guides.pageTitle}
      contentLocale={localeUsed}
    />
  )
}
