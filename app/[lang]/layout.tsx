import { ReactNode, Suspense } from 'react'
import { notFound } from 'next/navigation'
import { SearchConfig } from 'pliny/search'
import { Analytics } from '@vercel/analytics/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SectionContainer from '@/components/SectionContainer'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import MicrosoftClarity from '@/components/MicrosoftClarity'
import siteMetadata from '@/data/siteMetadata'
import { LanguageProvider } from '@/context/LanguageContext'
import { isLocale, locales, Locale } from '@/lib/i18n'
import { getDictionary } from '@/data/locale/dictionary'
import { SearchProviderClient } from '@/components/SearchProviderClient'

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const resolvedParams = await params
  if (!isLocale(resolvedParams.lang)) {
    notFound()
  }

  const locale: Locale = resolvedParams.lang
  const dictionary = await getDictionary(locale)

  return (
    <LanguageProvider locale={locale} dictionary={dictionary}>
      <Suspense fallback={null}>
        <GoogleAnalytics />
        <MicrosoftClarity />
      </Suspense>
      <Analytics />
      <SectionContainer>
        <SearchProviderClient searchConfig={siteMetadata.search as SearchConfig}>
          <Header />
          <main className="mb-auto">{children}</main>
        </SearchProviderClient>
        <Footer />
      </SectionContainer>
    </LanguageProvider>
  )
}
