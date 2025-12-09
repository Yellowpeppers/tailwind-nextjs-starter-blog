import rawTagData from 'app/tag-data.json'
import { defaultLocale, Locale } from './i18n'

export type TagCountMap = Partial<Record<Locale, Record<string, number>>>

const storedTagData = rawTagData as TagCountMap

export const getTagCounts = (
  locale: Locale
): { counts: Record<string, number>; localeUsed: Locale } => {
  const localeCounts = storedTagData[locale]
  if (localeCounts && Object.keys(localeCounts).length > 0) {
    return { counts: localeCounts, localeUsed: locale }
  }

  const fallbackCounts = storedTagData[defaultLocale] ?? {}
  return {
    counts: fallbackCounts,
    localeUsed: defaultLocale,
  }
}
