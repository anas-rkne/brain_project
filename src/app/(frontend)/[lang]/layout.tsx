import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { FloatingDock } from '@/components/layout/FloatingDock'
import { GrainOverlay } from '@/components/shared/GrainOverlay'
import { Preloader } from '@/features/preloader/Preloader'
import { isLocale, localeDirection, locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

import '@/styles/fonts.css'
import '@/styles/sections.css'
import '../globals.css'

type LocaleParams = { params: Promise<{ lang: string }> }

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}

  const dict = getDictionary(lang)

  return {
    title: { default: dict.meta.title, template: `%s — Brain Media` },
    description: dict.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { ar: '/ar', en: '/en' },
    },
    openGraph: {
      type: 'website',
      locale: lang === 'ar' ? 'ar_AE' : 'en_AE',
      title: dict.meta.title,
      description: dict.meta.description,
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const dict = getDictionary(lang)

  return (
    <html lang={lang} dir={localeDirection[lang]}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-yellow focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-[#0a0a0a]"
        >
          {dict.common.skip}
        </a>

        <SiteHeader locale={lang} dict={dict} />
        <main id="main">{children}</main>
        <SiteFooter locale={lang} dict={dict} />

        <GrainOverlay />
        <FloatingDock locale={lang} quoteLabel={dict.footer.quote} />
        <Preloader />
      </body>
    </html>
  )
}
