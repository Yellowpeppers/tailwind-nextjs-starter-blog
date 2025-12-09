import Link from '@/components/Link'
import { slug } from 'github-slugger'
import { genPageMetadata } from 'app/seo'
import { resolveLocale } from '@/lib/i18n'
import { getDictionary } from '@/data/locale/dictionary'
import { getTagCounts } from '@/lib/tagData'

export async function generateMetadata(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const dictionary = await getDictionary(locale)
  return genPageMetadata({
    title: dictionary.tags.metaTitle,
    description: dictionary.tags.metaDescription,
    path: '/tags',
    locale,
  })
}

const formatTag = (tag: string) =>
  tag
    .split(/[-\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const dictionary = await getDictionary(locale)
  const { counts } = getTagCounts(locale)
  const sortedTags = Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .filter((tag) => counts[tag] >= 2)

  return (
    <div className="space-y-10">
      <div className="space-y-4 text-center md:text-left">
        <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">
          {dictionary.tags.eyebrow}
        </p>
        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
          {dictionary.tags.title}
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300">{dictionary.tags.description}</p>
      </div>

      {sortedTags.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">{dictionary.tags.empty}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedTags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${slug(tag)}`}
              className="group hover:border-primary-400 flex h-full flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
              aria-label={dictionary.tags.cardAria.replace('{tag}', formatTag(tag))}
            >
              <div>
                <p className="group-hover:text-primary-500 text-2xl font-bold text-gray-900 transition dark:text-gray-100">
                  {formatTag(tag)}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {dictionary.tags.cardDescription.replace('{tag}', formatTag(tag))}
                </p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <span>
                  {counts[tag]}{' '}
                  {counts[tag] === 1 ? dictionary.tags.single : dictionary.tags.plural}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
