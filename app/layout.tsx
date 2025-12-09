import 'css/tailwind.css'
import 'pliny/search/algolia.css'
import 'remark-github-blockquote-alert/alert.css'

import { Space_Grotesk } from 'next/font/google'
import siteMetadata from '@/data/siteMetadata'
import { ThemeProviders } from './theme-providers'
import { Metadata } from 'next'
import { ReactNode } from 'react'
import { headers } from 'next/headers'
import { defaultLocale, isLocale, localeToHtmlLang, Locale } from '@/lib/i18n'

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://neurohackslab.com'),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: siteMetadata.siteUrl,
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    images: [siteMetadata.socialBanner],
  },
  verification: {
    other: {
      'p:domain_verify': '54c950362caebcf5010f1b6fe1aa6e24',
    },
  },
}

const getHeaderLocale = async () => {
  try {
    const headerList = await headers()
    if (typeof headerList?.get === 'function') {
      return headerList.get('x-path-locale')
    }
  } catch (error) {
    // headers() is unavailable during static builds; fall back to default
  }
  return null
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const basePath = process.env.BASE_PATH || ''
  const headerLocale = await getHeaderLocale()
  const fallbackLocale: Locale = siteMetadata.language.toLowerCase().startsWith('zh')
    ? 'zh'
    : defaultLocale
  const activeLocale = headerLocale && isLocale(headerLocale) ? headerLocale : fallbackLocale
  const socialProfiles = [
    siteMetadata.github,
    siteMetadata.x,
    siteMetadata.facebook,
    siteMetadata.linkedin,
    siteMetadata.instagram,
    siteMetadata.threads,
    siteMetadata.bluesky,
    siteMetadata.mastodon,
  ].filter(Boolean)
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteMetadata.title,
    url: siteMetadata.siteUrl,
    description: siteMetadata.description,
    logo: `${siteMetadata.siteUrl}${siteMetadata.siteLogo}`,
    sameAs: socialProfiles,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: siteMetadata.email,
        contactType: 'customer support',
        availableLanguage: localeToHtmlLang(activeLocale),
      },
    ],
  }

  return (
    <html
      lang={localeToHtmlLang(activeLocale)}
      className={`${space_grotesk.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* Next.js auto-injects the default favicon link when /app/icon.png exists, so no extra tag is needed. */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${basePath}/static/favicons/apple-touch-icon.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`${basePath}/static/favicons/favicon-32x32.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`${basePath}/static/favicons/favicon-16x16.png`}
        />
        <link rel="manifest" href={`${basePath}/static/favicons/site.webmanifest`} />
        <link
          rel="mask-icon"
          href={`${basePath}/static/favicons/safari-pinned-tab.svg`}
          color="#0EA5E9"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <meta name="msapplication-TileColor" content="#0EA5E9" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />
        <link rel="alternate" type="application/rss+xml" href={`${basePath}/feed.xml`} />
      </head>
      <body
        className={`bg-white pl-[calc(100vw-100%)] text-black antialiased dark:bg-gray-950 dark:text-white ${space_grotesk.variable}`}
        suppressHydrationWarning
      >
        <ThemeProviders>{children}</ThemeProviders>
      </body>
    </html>
  )
}
