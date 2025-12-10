import Link from 'next/link'
import Image from 'next/image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'
import { CoreContent } from 'pliny/utils/contentlayer'
import { Blog } from 'contentlayer/generated'
import { Dictionary } from '@/data/locale/dictionary'

const MAX_DISPLAY = 5

export default function BlogList({
  posts,
  dictionary,
  locale,
}: {
  posts: CoreContent<Blog>[]
  dictionary: Dictionary
  locale: string
}) {
  const t = dictionary.home

  return (
    <section className="py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-12 space-y-4 text-left">
          <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">
            {t.blog.tagline}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t.blog.title}
          </h2>
          <p className="max-w-3xl text-base text-gray-600 dark:text-gray-300">{t.blog.desc}</p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {!posts.length && t.blog.noPosts}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, title, summary, tags, images } = post
            const coverImage = images?.[0]
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-5 xl:items-center xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date, locale)}</time>
                      </dd>
                    </dl>
                    <div className={`space-y-5 ${coverImage ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`/guides/${slug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h3>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                      <div className="text-base leading-6 font-medium">
                        <Link
                          href={`/guides/${slug}`}
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`Read "${title}"`}
                        >
                          {t.blog.readMore} &rarr;
                        </Link>
                      </div>
                    </div>
                    {coverImage && (
                      <div className="mt-6 xl:mt-0 xl:pl-6">
                        <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm dark:border-gray-800">
                          <Image
                            src={coverImage}
                            alt={`Cover image for ${title}`}
                            width={480}
                            height={320}
                            className="h-40 w-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
        {posts.length > MAX_DISPLAY && (
          <div className="flex justify-end text-base leading-6 font-medium">
            <Link
              href="/guides"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label="All posts"
            >
              {t.blog.allPosts} &rarr;
            </Link>
          </div>
        )}
        {siteMetadata.newsletter?.provider && (
          <div className="flex items-center justify-center pt-4">
            <NewsletterForm />
          </div>
        )}
      </div>
    </section>
  )
}
