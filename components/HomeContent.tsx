'use client'

import Image from 'next/image'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'
import { useTranslation } from '@/context/LanguageContext'
import { CoreContent } from 'pliny/utils/contentlayer'
import { Blog } from 'contentlayer/generated'
import { BeakerIcon } from '@heroicons/react/24/outline'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Fragment, ReactNode } from 'react'

const MAX_DISPLAY = 5

export default function HomeContent({ posts }: { posts: CoreContent<Blog>[] }) {
  const { t, language } = useTranslation()
  const locale = language === 'zh' ? 'zh-CN' : 'en-US'
  const containerClass = 'mx-auto w-full max-w-6xl px-6'
  const sectionAnimation = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  }

  const renderRichText = (text: string) => {
    const nodes: ReactNode[] = []
    const pattern = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(
          <Fragment key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</Fragment>
        )
      }

      if (match[2] && match[3]) {
        nodes.push(
          <Link
            key={`link-${match.index}-${match[3]}`}
            href={match[3]}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-semibold"
          >
            {match[2]}
          </Link>
        )
      } else if (match[4]) {
        nodes.push(
          <strong
            key={`bold-${match.index}`}
            className="font-semibold text-gray-900 dark:text-gray-100"
          >
            {match[4]}
          </strong>
        )
      }

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      nodes.push(<Fragment key={`text-${lastIndex}`}>{text.slice(lastIndex)}</Fragment>)
    }

    return nodes
  }

  const trustFeatures = [
    {
      title: t.home.trust.scientific.title,
      description: t.home.trust.scientific.desc,
      icon: (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 3l7.5 4.33v8.66L12 20l-7.5-4.01V7.33z" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: t.home.trust.privacy.title,
      description: t.home.trust.privacy.desc,
      icon: (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M12 3a6 6 0 016 6v2.5a7.5 7.5 0 01-5.42 7.19L12 20l-.58-1.31A7.5 7.5 0 016 11.5V9a6 6 0 016-6z"
            strokeLinejoin="round"
          />
          <path d="M9 11.5a3 3 0 006 0" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: t.home.trust.actionable.title,
      description: t.home.trust.actionable.desc,
      icon: (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14" strokeLinecap="round" />
          <path d="M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-0">
      <motion.section {...sectionAnimation} className="py-16">
        <div className={`${containerClass} text-left`}>
          <p className="text-primary-500 text-sm font-semibold tracking-[0.2em] uppercase">
            {t.home.heroTagline}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100">
            {t.home.heroHeadline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            {t.home.heroSubheadline}
          </p>
          <div className="mt-8 flex flex-col items-start gap-4">
            <Link
              href="/test"
              className="bg-primary-500 shadow-primary-500/40 hover:bg-primary-600 focus-visible:ring-primary-500 inline-flex items-center justify-center rounded-2xl px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:-translate-y-1 focus:outline-none focus-visible:ring-2"
            >
              {t.home.startAssessment}
            </Link>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t.home.privacyNote}
            </span>
          </div>
          <div className="mt-20 grid gap-8 border-t border-gray-100 pt-12 md:grid-cols-3 dark:border-gray-800">
            {trustFeatures.map((feature) => (
              <div key={feature.title} className="space-y-4">
                <div className="bg-primary-50 text-primary-600 dark:bg-primary-500/10 flex h-12 w-12 items-center justify-center rounded-2xl dark:text-white">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionAnimation} className="bg-gray-50 py-24 dark:bg-gray-900/50">
        <div className={containerClass}>
          <div className="mb-16">
            <div className="text-primary-500 mb-4 flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
              <span className="bg-primary-500 flex h-1 w-1 rounded-full"></span>
              {t.home.resourceHub.tagline}
              <span className="bg-primary-500 flex h-1 w-1 rounded-full"></span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              {t.home.resourceHub.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">{t.home.resourceHub.desc}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Link
              href="/focuslab"
              className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 mb-6 inline-flex items-center justify-center rounded-full p-3">
                <BeakerIcon className="h-10 w-10" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                {t.nav.focusLab}
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                {t.home.resourceHub.focusLabDesc}
              </p>
              <div className="text-primary-600 mt-8 flex items-center justify-between font-semibold">
                <span>{t.home.resourceHub.enterFocusLab}</span>
                <span className="text-xl transition-transform duration-300 group-hover:translate-x-1">
                  -&gt;
                </span>
              </div>
            </Link>

            <Link
              href="/guides"
              className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300 mb-6 inline-flex items-center justify-center rounded-full p-3">
                <BookOpenIcon className="h-10 w-10" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                {t.nav.guides}
              </h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                {t.home.resourceHub.guidesDesc}
              </p>
              <div className="text-primary-600 mt-8 flex items-center justify-between font-semibold">
                <span>{t.home.resourceHub.exploreGuides}</span>
                <span className="text-xl transition-transform duration-300 group-hover:translate-x-1">
                  -&gt;
                </span>
              </div>
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionAnimation} className="bg-white py-24 dark:bg-gray-950">
        <div className={containerClass}>
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">
              {t.home.faq.tagline}
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t.home.faq.title}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300">{t.home.faq.desc}</p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl space-y-4">
            {t.home.faq.items.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60"
              >
                <summary className="flex cursor-pointer items-center justify-between font-bold text-gray-900 dark:text-gray-100">
                  {faq.q}
                  <span className="ml-4 transition-transform group-open:rotate-180">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  {renderRichText(faq.a)}
                </div>
              </details>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...sectionAnimation} className="py-24">
        <div className={containerClass}>
          <div className="mb-12 space-y-4 text-left">
            <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">
              {t.home.blog.tagline}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {t.home.blog.title}
            </h2>
            <p className="max-w-3xl text-base text-gray-600 dark:text-gray-300">
              {t.home.blog.desc}
            </p>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {!posts.length && t.home.blog.noPosts}
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
                      <div
                        className={`space-y-5 ${coverImage ? 'xl:col-span-3' : 'xl:col-span-4'}`}
                      >
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
                            {t.home.blog.readMore} &rarr;
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
                {t.home.blog.allPosts} &rarr;
              </Link>
            </div>
          )}
          {siteMetadata.newsletter?.provider && (
            <div className="flex items-center justify-center pt-4">
              <NewsletterForm />
            </div>
          )}
        </div>
      </motion.section>
    </div>
  )
}
