import { Dictionary } from '@/data/locale/dictionary'

export default function TrustFeatures({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.home

  const trustFeatures = [
    {
      title: t.trust.scientific.title,
      description: t.trust.scientific.desc,
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
      title: t.trust.privacy.title,
      description: t.trust.privacy.desc,
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
      title: t.trust.actionable.title,
      description: t.trust.actionable.desc,
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
    <div className="mx-auto w-full max-w-6xl px-6 pb-16 text-left">
      <div className="grid gap-8 border-t border-gray-100 pt-12 md:grid-cols-3 dark:border-gray-800">
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
    </div>
  )
}
