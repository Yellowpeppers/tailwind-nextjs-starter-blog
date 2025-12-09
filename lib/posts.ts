import { allBlogs, Blog } from 'contentlayer/generated'
import { CoreContent, allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { defaultLocale, Locale } from './i18n'

interface LocalizedResult<T> {
  posts: T[]
  localeUsed: Locale
}

const collectPosts = (locale: Locale) =>
  sortPosts(allBlogs.filter((post) => (post.locale || defaultLocale) === locale))

export const getLocalizedPosts = (locale: Locale): LocalizedResult<Blog> => {
  const localized = collectPosts(locale)
  if (localized.length > 0 || locale === defaultLocale) {
    return { posts: localized, localeUsed: locale }
  }

  const fallback = collectPosts(defaultLocale)
  return {
    posts: fallback,
    localeUsed: defaultLocale,
  }
}

export const getLocalizedCoreContent = (locale: Locale): LocalizedResult<CoreContent<Blog>> => {
  const { posts, localeUsed } = getLocalizedPosts(locale)
  return {
    posts: allCoreContent(posts),
    localeUsed,
  }
}
