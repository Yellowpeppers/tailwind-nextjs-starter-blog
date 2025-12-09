import { NextRequest, NextResponse } from 'next/server'
import { defaultLocale, isLocale } from './lib/i18n'

const PUBLIC_FILE = /\.(.*)$/

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (!firstSegment || !isLocale(firstSegment)) {
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-path-locale', firstSegment)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|sw.js).*)',
  ],
}
