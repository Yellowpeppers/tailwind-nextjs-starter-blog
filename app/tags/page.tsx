import Link from '@/components/Link'
import { slug } from 'github-slugger'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Explore Topics',
  description: 'Browse our growing library of guides, reviews, and hacks by category.',
})

const formatTag = (tag: string) =>
  tag
    .split(/[-\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export default async function Page() {
  const tagCounts = tagData as Record<string, number>
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])

  return (
    <div className="space-y-10">
      <div className="space-y-4 text-center md:text-left">
        <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">Topics</p>
        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-gray-100">
          Explore Topics
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300">
          Browse our growing library of guides, reviews, and hacks by category.
        </p>
      </div>

      {sortedTags.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No topics found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedTags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${slug(tag)}`}
              className="group hover:border-primary-400 flex h-full flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
              aria-label={`View posts tagged ${tag}`}
            >
              <div>
                <p className="group-hover:text-primary-500 text-2xl font-bold text-gray-900 transition dark:text-gray-100">
                  {formatTag(tag)}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Insights, guides, and reviews curated for {formatTag(tag)}.
                </p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <span>
                  {tagCounts[tag]} {tagCounts[tag] === 1 ? 'post' : 'posts'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
