export const locales = ['en', 'zh'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const isLocale = (value: string): value is Locale => locales.includes(value as Locale)

export const localeToHtmlLang = (locale: Locale) => (locale === 'zh' ? 'zh-CN' : 'en-US')

const ensureLeadingSlash = (path: string) => (path.startsWith('/') ? path : `/${path}`)

export const hasLocalePrefix = (path: string) => {
  const normalized = ensureLeadingSlash(path)
  return locales.some(
    (locale) => normalized === `/${locale}` || normalized.startsWith(`/${locale}/`)
  )
}

export const addLocalePrefix = (locale: Locale, path: string) => {
  if (!path) {
    return `/${locale}`
  }
  if (!path.startsWith('/')) {
    return path
  }
  if (hasLocalePrefix(path)) {
    return path
  }
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

export const replaceLocaleInPathname = (pathname: string, locale: Locale) => {
  const normalized = ensureLeadingSlash(pathname || '/')
  const segments = normalized.split('/')
  if (segments.length > 1 && isLocale(segments[1])) {
    segments[1] = locale
    const replaced = segments.join('/')
    return replaced === '' ? `/${locale}` : replaced
  }
  return addLocalePrefix(locale, normalized)
}

export const resolveLocale = (value?: string | null): Locale =>
  isLocale(value ?? '') ? (value as Locale) : defaultLocale
