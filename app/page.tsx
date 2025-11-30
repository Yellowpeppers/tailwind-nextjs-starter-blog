import Image from 'next/image'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'
import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'

export const metadata = {
  title: 'Free Adult ADHD Test Online (ASRS v1.1) - NeuroHacks Lab',
  description:
    'Take our free, private ADHD test online. Based on the WHO ASRS v1.1 checklist for adults. No email required, instant scoring, and the Focus Lab productivity dashboard.',
}

const MAX_DISPLAY = 5

const trustFeatures = [
  {
    title: 'Scientific Rigor',
    description: 'Based on the ASRS v1.1 Symptom Checklist developed by the WHO.',
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
    title: 'Privacy First',
    description: '100% client-side. Your results never leave your browser.',
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
    title: 'Actionable Next Steps',
    description: 'Get matched with tools (like Quiet Fidgets) based on your score.',
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

const exploreLinks = [
  {
    title: 'Focus Lab',
    description:
      'Your personal mission control. Brown noise, task breaker, and timers in one distraction-free space.',
    href: '/projects',
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinejoin="round" />
        <path d="M3 9h18" strokeLinejoin="round" />
        <path d="M9 21V9" strokeLinejoin="round" />
      </svg>
    ),
    linkText: 'Enter Focus Lab',
  },
  {
    title: 'Guides',
    description: 'Honest reviews of fidgets, apps, and gear.',
    href: '/blog',
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M6 3h11a2 2 0 012 2v14l-4-3-4 3-4-3-4 3V5a2 2 0 012-2z" strokeLinejoin="round" />
      </svg>
    ),
  },
  // {
  //   title: 'Topics',
  //   description: 'Browse by category: Focus, Sleep, Anxiety.',
  //   href: '/tags',
  //   icon: (
  //     <svg
  //       viewBox="0 0 24 24"
  //       aria-hidden="true"
  //       className="h-7 w-7"
  //       fill="none"
  //       stroke="currentColor"
  //       strokeWidth="1.8"
  //     >
  //       <path d="M3 7l9-4 9 4-9 4z" strokeLinejoin="round" />
  //       <path d="M5 9v6l7 4 7-4V9" strokeLinejoin="round" />
  //       <path d="M12 13v6" strokeLinecap="round" />
  //     </svg>
  //   ),
  // },
]

const faqItems = [
  {
    question: 'Is this ADHD test online accurate?',
    answer: (
      <>
        This tool uses the ASRS v1.1, which is a scientifically validated screening checklist
        developed by the World Health Organization. While no ADHD test online can replace a
        doctor&apos;s diagnosis, it is highly reliable for identifying symptom patterns.
      </>
    ),
  },
  {
    question: 'Is this really a free ADHD test?',
    answer: (
      <>
        Yes. Unlike other sites that hide results behind a paywall, NeuroHacks Lab provides a
        completely free ADHD test online with instant results.
      </>
    ),
  },
  {
    question: 'Do I need to provide my email?',
    answer: (
      <>
        No. We believe in privacy. You can take this adult ADHD screening directly in your browser
        without signing up.
      </>
    ),
  },
  {
    question: 'What should I do after taking the test?',
    answer: (
      <>
        If your score indicates high symptoms, we recommend consulting a specialist. You can also
        explore our{' '}
        <Link
          href="/projects"
          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-semibold"
        >
          Focus Lab
        </Link>{' '}
        and{' '}
        <Link
          href="/blog"
          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-semibold"
        >
          Guides
        </Link>{' '}
        to manage your focus immediately.
      </>
    ),
  },
]

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  return (
    <div className="space-y-0">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-left">
          <p className="text-primary-500 text-sm font-semibold tracking-[0.2em] uppercase">
            Adult ADHD Test · WHO ASRS v1.1
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100">
            Free Adult <span className="text-primary-500">ADHD Test Online</span>{' '}
            <span className="block text-3xl font-medium text-gray-400 sm:text-4xl">
              &amp; Productivity Toolkit
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Is it ADHD or just modern life? Take the{' '}
            <strong>World Health Organization (WHO) ASRS v1.1</strong> self-screening. No email
            required—just clarity, science, and neurodivergent-friendly tools.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4">
            <Link
              href="/test"
              className="bg-primary-500 shadow-primary-500/40 hover:bg-primary-600 focus-visible:ring-primary-500 inline-flex items-center justify-center rounded-2xl px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:-translate-y-1 focus:outline-none focus-visible:ring-2"
            >
              Start Free Assessment →
            </Link>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              2-minute ASRS v1.1 · 100% Private
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
      </section>

      <section className="bg-gray-50 py-24 dark:bg-gray-900/50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-3 text-center md:text-left">
            <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">
              Explore NeuroHacks
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Resource Hub</h2>
            <p className="text-base text-gray-600 dark:text-gray-300">
              Choose your path—jump straight into the ADHD assessment, shop trusted buying guides,
              or dive into research-backed topics.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
            {exploreLinks.map((item) => (
              <Link key={item.title} href={item.href} className="group block h-full">
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/10 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:text-white">
                    {item.icon}
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-2xl font-bold text-gray-900 transition group-hover:text-pink-600 dark:text-gray-100 dark:group-hover:text-pink-400">
                        {item.title}
                      </h3>
                      <span className="inline-flex items-center text-sm font-semibold text-pink-600 dark:text-pink-400">
                        {/* @ts-ignore */}
                        {item.linkText || `Explore ${item.title}`}
                        <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    </div>
                    <p className="text-base text-gray-600 dark:text-gray-300">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-6">
          <div className="space-y-4 text-center">
            <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">
              FAQs
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ADHD Test Online: Frequently Asked Questions
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300">
              Get confident about how this adult ADHD self-screening works, why it&apos;s free, and
              what to do next once you have your score.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl space-y-4">
            {faqItems.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60"
              >
                <summary className="flex cursor-pointer items-center justify-between font-bold text-gray-900 dark:text-gray-100">
                  {faq.question}
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
                <div className="mt-4 text-base text-gray-600 dark:text-gray-300">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 space-y-4 text-left">
          <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">
            Neurodivergent Tools
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Latest Guides &amp; Reviews
          </h2>
          <p className="max-w-3xl text-base text-gray-600 dark:text-gray-300">
            Deep dives into quiet sensory gear, focus rituals, and ADHD-friendly planning systems to
            pair with your ASRS v1.1 results.
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {!posts.length && 'No posts found.'}
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
                        <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                      </dd>
                    </dl>
                    <div className={`space-y-5 ${coverImage ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`/blog/${slug}`}
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
                          href={`/blog/${slug}`}
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`Read more: "${title}"`}
                        >
                          Read more &rarr;
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
              href="/blog"
              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label="All posts"
            >
              All Posts &rarr;
            </Link>
          </div>
        )}
        {siteMetadata.newsletter?.provider && (
          <div className="flex items-center justify-center pt-4">
            <NewsletterForm />
          </div>
        )}
      </section>
    </div>
  )
}
