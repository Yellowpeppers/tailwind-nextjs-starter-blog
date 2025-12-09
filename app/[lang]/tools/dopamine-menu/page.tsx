import { genPageMetadata } from 'app/seo'
import { resolveLocale } from '@/lib/i18n'
import { getDictionary } from '@/data/locale/dictionary'
import DopamineMenuClient from './DopamineMenuClient'

export async function generateMetadata(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params
  const locale = resolveLocale(params.lang)
  const dict = await getDictionary(locale)
  const copy = dict.tools.dopamine
  return genPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: '/tools/dopamine-menu',
    appendSiteName: false,
    locale,
  })
}

export default function DopamineMenuPage() {
  return <DopamineMenuClient />
}
