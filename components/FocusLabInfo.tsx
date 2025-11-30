'use client'

import { useTranslation } from '@/context/LanguageContext'

export default function FocusLabInfo() {
  const { t } = useTranslation()
  const seo = t.focusLab.seo

  return (
    <section className="mx-auto max-w-4xl px-4 py-24">
      <div className="prose dark:prose-invert max-w-none">
        <h2 className="text-3xl font-bold">{seo.title}</h2>

        <h3>{seo.sonicShield.title}</h3>
        <p>{seo.sonicShield.content}</p>

        <h3>{seo.pomodoro.title}</h3>
        <p>{seo.pomodoro.content}</p>

        <h3>{seo.taskBreaker.title}</h3>
        <p>{seo.taskBreaker.content}</p>

        <h3>{seo.scratchpad.title}</h3>
        <p>{seo.scratchpad.content}</p>

        <h3>{seo.dopamineMenu.title}</h3>
        <p>{seo.dopamineMenu.content}</p>

        <hr className="my-12 border-gray-200 dark:border-gray-800" />

        <h3>{seo.faq.title}</h3>

        {seo.faq.items.map((item, index) => (
          <div key={index}>
            <h4>{item.q}</h4>
            <p>{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
