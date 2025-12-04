import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'

interface PageSEOProps {
  title: string
  description?: string
  image?: string
  path?: string
  appendSiteName?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

const toAbsoluteUrl = (value?: string) => {
  if (!value) return undefined
  if (value.startsWith('http')) return value
  return new URL(value.startsWith('/') ? value : `/${value}`, siteMetadata.siteUrl).toString()
}

export function genPageMetadata({
  title,
  description,
  image,
  path,
  alternates,
  appendSiteName = true,
  openGraph: openGraphOverrides,
  twitter: twitterOverrides,
  ...rest
}: PageSEOProps): Metadata {
  const canonicalUrl = toAbsoluteUrl(path) ?? siteMetadata.siteUrl
  const resolvedImage = image || siteMetadata.socialBanner
  const ogImages = Array.isArray(resolvedImage)
    ? resolvedImage.map((img) => toAbsoluteUrl(img) ?? img)
    : [toAbsoluteUrl(resolvedImage) ?? resolvedImage]
  const titleValue: Metadata['title'] = appendSiteName ? title : { absolute: title }
  const formattedTitle = appendSiteName ? `${title} | ${siteMetadata.title}` : title

  return {
    title: titleValue,
    description: description || siteMetadata.description,
    alternates: {
      canonical: canonicalUrl,
      ...alternates,
    },
    openGraph: {
      title: formattedTitle,
      description: description || siteMetadata.description,
      url: canonicalUrl,
      siteName: siteMetadata.title,
      images: ogImages,
      locale: 'en_US',
      type: 'website',
      ...openGraphOverrides,
    },
    twitter: {
      title: formattedTitle,
      card: 'summary_large_image',
      images: ogImages,
      ...twitterOverrides,
    },
    ...rest,
  }
}
