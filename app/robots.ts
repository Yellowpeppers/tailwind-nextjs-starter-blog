import { MetadataRoute } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { locales } from '@/lib/i18n'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const allowPaths = ['/', ...locales.map((locale) => `/${locale}/`)]
  return {
    rules: [
      {
        userAgent: '*',
        allow: allowPaths,
      },
    ],
    sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
    host: siteMetadata.siteUrl,
  }
}
