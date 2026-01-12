import { MetadataRoute } from 'next'
import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { addLocalePrefix, locales } from '@/lib/i18n'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  // NOTE: This sitemap is manually maintained for static routes.
  // If you add a new static page (e.g. app/new-page/page.tsx), you MUST add it to the `staticRoutes` array below.
  const siteUrl = siteMetadata.siteUrl

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .flatMap((post) =>
      locales.map((locale) => ({
        url: `${siteUrl}${addLocalePrefix(locale, `/${post.path}`)}`,
        lastModified: post.lastmod || post.date,
      }))
    )

  const staticRoutes = [
    '',
    'test',
    'guides',
    'focuslab',
    'tags',
    'about',
    'privacy',
    'tools/dopamine-menu',
    'tools/noise',
    'focuslab/app',
  ]

  const routes = locales.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: `${siteUrl}${addLocalePrefix(locale, route ? `/${route}` : '/')}`,
      lastModified: new Date().toISOString().split('T')[0],
    }))
  )

  return [...routes, ...blogRoutes]
}
