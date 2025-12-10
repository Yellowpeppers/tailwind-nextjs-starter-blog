import Link from 'next/link'
import { Dictionary } from '@/data/locale/dictionary'
import { Fragment, ReactNode } from 'react'

export default function FAQ({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.home

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

  return (
    <section className="bg-white py-24 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <p className="text-primary-500 text-sm font-semibold tracking-[0.3em] uppercase">
            {t.faq.tagline}
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.faq.title}</h2>
          <p className="text-base text-gray-600 dark:text-gray-300">{t.faq.desc}</p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {t.faq.items.map((faq) => (
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
    </section>
  )
}
