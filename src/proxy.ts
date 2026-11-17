import { NextResponse, type NextRequest } from 'next/server'

import { defaultLocale, isLocale, locales } from '@/lib/i18n/config'

/**
 * Next.js 16 renamed Middleware to Proxy.
 * Responsibilities: prefix every public path with a supported locale.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )

  if (hasLocale) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${detectLocale(request)}${pathname === '/' ? '' : pathname}`

  return NextResponse.redirect(url)
}

function detectLocale(request: NextRequest) {
  const cookie = request.cookies.get('NEXT_LOCALE')?.value
  if (cookie && isLocale(cookie)) return cookie

  const header = request.headers.get('accept-language')?.toLowerCase() ?? ''
  const preferred = header.split(',')[0]?.trim() ?? ''

  return preferred.startsWith('en') ? 'en' : defaultLocale
}

export const config = {
  // Skip Payload admin/API, Next internals, and anything with a file extension.
  matcher: ['/((?!_next|api|admin|media|assets|favicon|.*\\..*).*)'],
}
