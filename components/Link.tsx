'use client'

/* eslint-disable jsx-a11y/anchor-has-content */
import NextLink from 'next/link'
import type { LinkProps } from 'next/link'
import { AnchorHTMLAttributes, useMemo } from 'react'
import clsx from 'clsx'
import { useTranslation } from '@/context/LanguageContext'
import { addLocalePrefix, Locale } from '@/lib/i18n'

type CustomLinkProps = LinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    locale?: Locale
    preserveLocale?: boolean
  }

const resolveInternalHref = (
  href: LinkProps['href'],
  locale: Locale,
  preserveLocale: boolean
): LinkProps['href'] => {
  if (!preserveLocale || !href) {
    return href
  }

  if (typeof href === 'string') {
    if (!href.startsWith('/')) {
      return href
    }
    return addLocalePrefix(locale, href)
  }

  if (href.pathname && typeof href.pathname === 'string' && href.pathname.startsWith('/')) {
    return {
      ...href,
      pathname: addLocalePrefix(locale, href.pathname),
    }
  }

  return href
}

const CustomLink = ({
  href,
  className,
  locale,
  preserveLocale = true,
  ...rest
}: CustomLinkProps) => {
  const { language } = useTranslation()
  const targetLocale = locale ?? language
  const isAnchorLink = typeof href === 'string' && href.startsWith('#')
  const isInternalLink =
    typeof href === 'string'
      ? href.startsWith('/')
      : typeof href === 'object' &&
        href !== null &&
        typeof (href as { pathname?: string }).pathname === 'string' &&
        (href as { pathname?: string }).pathname?.startsWith('/')
  const combinedClass = clsx('break-words', className)

  const localizedHref = useMemo(
    () => resolveInternalHref(href, targetLocale, preserveLocale),
    [href, targetLocale, preserveLocale]
  )

  if (isInternalLink) {
    return <NextLink className={combinedClass} href={(localizedHref ?? href)!} {...rest} />
  }

  if (isAnchorLink) {
    return <a className={combinedClass} href={href as string} {...rest} />
  }

  return (
    <a
      className={combinedClass}
      target="_blank"
      rel="noopener noreferrer"
      href={href as string}
      {...rest}
    />
  )
}

export default CustomLink
