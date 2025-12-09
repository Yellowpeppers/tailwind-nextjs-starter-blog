import { ReactNode } from 'react'
import { genPageMetadata } from 'app/seo'
import { defaultLocale, resolveLocale, Locale } from '@/lib/i18n'

type ListItem = { label?: string; text: ReactNode }

interface Section {
  title: string
  paragraphs?: ReactNode[]
  list?: ListItem[]
}

interface PrivacyContent {
  title: string
  lastUpdatedLabel: string
  lastUpdated: string
  intro: ReactNode
  sections: Section[]
}

const privacyCopy: Record<Locale, PrivacyContent> = {
  en: {
    title: 'Privacy Policy',
    lastUpdatedLabel: 'Last updated',
    lastUpdated: 'November 25, 2025',
    intro:
      'NeuroHacks Lab (“we,” “us,” or “our”) operates digital tools, educational content, and services focused on neurodivergent-friendly workflows. This Privacy Policy explains how we collect, use, and protect your information when you visit our website, access interactive tools, or subscribe to our resources.',
    sections: [
      {
        title: 'Information We Collect',
        list: [
          {
            label: 'Email Addresses.',
            text: 'When you subscribe to our mailing list or download a toolkit, we collect your email address to deliver the requested resources.',
          },
          {
            label: 'Usage Data.',
            text: 'Through Google Analytics 4 (GA4), we collect anonymized information about how you browse our site (pages visited, approximate location, device type, time-on-page) to understand engagement trends.',
          },
          {
            label: 'Technical Data.',
            text: 'Cookies and similar technologies store preferences, authentication status, and measurement data necessary to keep the site secure and responsive.',
          },
        ],
      },
      {
        title: 'How We Use Your Information',
        list: [
          { text: 'Deliver checklists, guides, and email sequences you specifically request.' },
          {
            text: 'Analyze anonymized usage data to improve site performance and prioritize new tools.',
          },
          { text: 'Maintain the safety, security, and reliability of our infrastructure.' },
          { text: 'Respond to questions or feedback you send to our team.' },
        ],
      },
      {
        title: 'Cookies & Analytics',
        paragraphs: [
          <>
            We rely on first-party cookies and GA4 analytics cookies to understand aggregate
            behavior. You can control cookie preferences through your browser settings or opt out of
            GA4 via the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">
              Google Analytics Opt-out Browser Add-on
            </a>
            . Disabling cookies may limit some functionality (for example, saving quiz progress).
          </>,
        ],
      },
      {
        title: 'Data Security',
        paragraphs: [
          'We use SSL encryption, access controls, and vendor-level safeguards to protect the data we store. While no online service can guarantee absolute security, we review access logs and tooling regularly to reduce risk and respond quickly if an issue occurs.',
        ],
      },
      {
        title: 'Retention & Your Choices',
        paragraphs: [
          'Email data is retained until you unsubscribe or request deletion. Analytics data is retained in GA4 according to Google’s configurable retention windows. You may opt out of emails at any time via the unsubscribe link in each message or by contacting us directly.',
        ],
      },
      {
        title: 'Contact Us',
        paragraphs: [
          <>
            If you have questions about this Privacy Policy or wish to exercise any data rights,
            email us at <a href="mailto:contact@neurohackslab.com">contact@neurohackslab.com</a>.
          </>,
        ],
      },
    ],
  },
  zh: {
    title: '隐私政策',
    lastUpdatedLabel: '最后更新',
    lastUpdated: '2025 年 11 月 25 日',
    intro:
      'NeuroHacks Lab（“我们”）运营与神经多样性友好工作流相关的数字工具、教育内容与配套服务。本隐私政策说明当你访问我们的网站、使用交互式工具或订阅资源时，我们如何收集、使用并保护你的信息。',
    sections: [
      {
        title: '我们收集的信息',
        list: [
          {
            label: '邮件地址。',
            text: '当你订阅邮件列表或下载工具包时，我们会收集你的邮箱，以便发送所请求的资料。',
          },
          {
            label: '使用数据。',
            text: '通过 Google Analytics 4（GA4），我们会匿名统计你在网站上的浏览行为（访问的页面、大致位置、设备类型、停留时长等），以便了解整体使用趋势。',
          },
          {
            label: '技术数据。',
            text: 'Cookies 及类似技术会保存偏好设置、登录状态与必要的度量信息，帮助网站保持安全与流畅。',
          },
        ],
      },
      {
        title: '我们如何使用这些信息',
        list: [
          { text: '向你发送所请求的清单、指南与邮件课程。' },
          { text: '分析匿名数据，以改进网站性能并优先开发新工具。' },
          { text: '维护基础设施的安全性与可靠性。' },
          { text: '回应你提交的问题或反馈。' },
        ],
      },
      {
        title: 'Cookies 与分析',
        paragraphs: [
          <>
            我们依赖第一方 Cookies 和 GA4 分析 Cookies 来理解整体行为。你可以在浏览器中调整 Cookies
            偏好，或通过{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">
              Google Analytics 退出浏览器插件
            </a>
            选择退出 GA4。禁用 Cookies 可能会限制部分功能（例如保存测评进度）。
          </>,
        ],
      },
      {
        title: '数据安全',
        paragraphs: [
          '我们使用 SSL 加密、访问控制及供应商级别的安全措施来保护所存储的数据。虽然任何在线服务都无法保证绝对安全，我们会定期审查访问日志和工具，一旦发现风险会迅速响应。',
        ],
      },
      {
        title: '保留期限与选择',
        paragraphs: [
          '邮件数据会保留至你主动取消订阅或提出删除请求为止。分析数据则依据 GA4 可配置的保留窗口存储。你可随时通过邮件中的“取消订阅”链接或直接联系我们来退出邮件推送。',
        ],
      },
      {
        title: '联系我们',
        paragraphs: [
          <>
            如对本隐私政策有任何疑问，或希望行使数据相关权利，请发送邮件至{' '}
            <a href="mailto:contact@neurohackslab.com">contact@neurohackslab.com</a>。
          </>,
        ],
      },
    ],
  },
}

const getPrivacyCopy = (locale: Locale) => privacyCopy[locale] ?? privacyCopy[defaultLocale]

export async function generateMetadata(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const copy = getPrivacyCopy(locale)
  return genPageMetadata({
    title: copy.title,
    description: typeof copy.intro === 'string' ? copy.intro : undefined,
    path: '/privacy',
    locale,
  })
}

export default async function PrivacyPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const copy = getPrivacyCopy(locale)

  return (
    <section className="py-12">
      <article className="prose prose-neutral dark:prose-invert mx-auto">
        <h1>{copy.title}</h1>
        <p>
          {copy.lastUpdatedLabel}: {copy.lastUpdated}
        </p>
        <p>{copy.intro}</p>

        {copy.sections.map((section) => (
          <div key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs?.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {section.list && (
              <ul>
                {section.list.map((item, index) => (
                  <li key={index}>
                    {item.label && <strong>{item.label} </strong>}
                    {item.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </article>
    </section>
  )
}
