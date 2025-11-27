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
    'Take our free, private ADHD test online. Based on the WHO ASRS v1.1 checklist for adults. No email required, instant scoring, and focus tools included.',
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
    title: 'Tools',
    description: 'Interactive screenings and sensory tools.',
    href: '/test',
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M8 3h8l3 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" strokeLinejoin="round" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
        <path d="M12 3v4h4" strokeLinejoin="round" />
      </svg>
    ),
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
  {
    title: 'Topics',
    description: 'Browse by category: Focus, Sleep, Anxiety.',
    href: '/tags',
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M3 7l9-4 9 4-9 4z" strokeLinejoin="round" />
        <path d="M5 9v6l7 4 7-4V9" strokeLinejoin="round" />
        <path d="M12 13v6" strokeLinecap="round" />
      </svg>
    ),
  },
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
          Tools
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
    <div className="space-y-16 py-6 md:space-y-20 md:py-10">
      <section className="from-primary-50 shadow-primary-200/40 dark:to-primary-900/20 overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br via-white to-rose-50 px-8 py-12 shadow-2xl dark:border-gray-800 dark:from-gray-900 dark:via-gray-900">
        <p className="text-primary-500 text-sm font-semibold tracking-[0.2em] uppercase">
          Adult ADHD Test · WHO ASRS v1.1
        </p>
        <h1 className="mt-4 text-4xl leading-tight font-black text-gray-900 sm:text-5xl dark:text-gray-100">
          Free Adult <span className="text-primary-500">ADHD Test Online</span> &amp; Productivity
          Toolkit
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          Is it ADHD or just modern life? Take the{' '}
          <strong>World Health Organization (WHO) ASRS v1.1</strong> screening. No email
          required—just clarity, science, and neurodivergent-friendly tools.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/test"
            className="bg-primary-500 shadow-primary-500/40 hover:bg-primary-600 focus-visible:ring-primary-500 inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition focus:outline-none focus-visible:ring-2"
          >
            Start Free Assessment →
          </Link>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            2-minute ASRS v1.1 · Clinically inspired · 100% client-side
          </span>
        </div>
      </section>

      <section className="shadow-primary-500/10 rounded-3xl border border-gray-200 bg-white/70 p-8 shadow-lg dark:border-gray-800 dark:bg-gray-950/70">
        <div className="grid gap-8 md:grid-cols-3">
          {trustFeatures.map((feature) => (
            <div key={feature.title} className="space-y-4">
              <div className="bg-primary-50 text-primary-600 dark:bg-primary-500/10 flex h-12 w-12 items-center justify-center rounded-2xl dark:text-white">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border-y border-gray-100 bg-gray-50 py-16 dark:border-gray-800 dark:bg-gray-900/50">
        <div className="px-6">
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
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {exploreLinks.map((item) => (
              <Link key={item.title} href={item.href} className="group block h-full">
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/10 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:text-white">
                    {item.icon}
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xl font-semibold text-gray-900 transition group-hover:text-pink-600 dark:text-gray-100 dark:group-hover:text-pink-400">
                        {item.title}
                      </h3>
                      <span className="inline-flex items-center text-sm font-semibold text-pink-600 dark:text-pink-400">
                        Explore {item.title}
                        <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="rounded-3xl border border-gray-100 bg-white/80 px-8 py-16 shadow-xl dark:border-gray-800 dark:bg-gray-950/70">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">
              FAQs
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ADHD Test Online: Frequently Asked Questions
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300">
              Get confident about how this adult ADHD screening works, why it&apos;s free, and what
              to do next once you have your score.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {faqItems.map((faq) => (
              <div
                key={faq.question}
                className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/60"
              >
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{faq.question}</p>
                <p className="text-base text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div className="space-y-4">
          <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">
            Neurodivergent Tools
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Latest Guides &amp; Reviews
          </h2>
          <p className="max-w-2xl text-base text-gray-600 dark:text-gray-300">
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
