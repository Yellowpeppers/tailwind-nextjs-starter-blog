'use client'

import Image from 'next/image'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import LanguageSwitch from './LanguageSwitch'

import { useTranslation } from '@/context/LanguageContext'

const Header = () => {
  const { t } = useTranslation()
  let headerClass =
    'flex w-full flex-col gap-4 bg-white py-6 dark:bg-gray-950 sm:gap-6 sm:py-8 lg:py-10'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50'
  }

  return (
    <header className={headerClass}>
      <div className="flex w-full items-center justify-between gap-4">
        <Link
          href="/"
          aria-label={siteMetadata.headerTitle}
          className="flex items-center gap-3"
          title="Go to homepage"
        >
          <Image
            src={siteMetadata.siteLogo}
            alt="NeuroHacks Lab logo"
            width={48}
            height={48}
            className="h-10 w-auto"
            priority
          />
          {typeof siteMetadata.headerTitle === 'string' ? (
            <span className="text-xl font-semibold sm:text-2xl">{siteMetadata.headerTitle}</span>
          ) : (
            siteMetadata.headerTitle
          )}
        </Link>
        <div className="flex items-center gap-3 leading-5 sm:-mr-4 sm:gap-4">
          <div className="no-scrollbar hidden items-center gap-x-5 overflow-x-auto lg:flex">
            {headerNavLinks
              .filter((link) => link.href !== '/')
              .map((link) => {
                const navLabel = t.nav[link.translationKey as keyof typeof t.nav]
                return (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="hover:text-primary-500 dark:hover:text-primary-400 text-sm font-semibold text-gray-900 dark:text-gray-100"
                    title={`Go to ${navLabel}`}
                  >
                    {navLabel}
                  </Link>
                )
              })}
          </div>
          <SearchButton />
          <ThemeSwitch />
          <LanguageSwitch />
          <MobileNav />
        </div>
      </div>

      <div className="no-scrollbar mt-2 hidden w-full items-center gap-2 overflow-x-auto rounded-2xl border border-gray-200/70 bg-white/80 px-2 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-black/[0.02] sm:flex lg:hidden dark:border-gray-800/80 dark:bg-gray-900/70 dark:text-gray-100 dark:ring-white/[0.04]">
        {headerNavLinks
          .filter((link) => link.href !== '/')
          .map((link) => {
            const navLabel = t.nav[link.translationKey as keyof typeof t.nav]
            return (
              <Link
                key={`${link.title}-compact`}
                href={link.href}
                className="hover:text-primary-500 dark:hover:text-primary-400 rounded-xl px-3 py-1 whitespace-nowrap"
                title={`Go to ${navLabel}`}
              >
                {navLabel}
              </Link>
            )
          })}
      </div>
    </header>
  )
}

export default Header
