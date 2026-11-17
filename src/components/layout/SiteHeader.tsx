import Link from 'next/link'

import { MobileMenu } from '@/components/layout/MobileMenu'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'

interface SiteHeaderProps {
  locale: Locale
  dict: Dictionary
}

export function SiteHeader({ locale, dict }: SiteHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-[18px] z-[90] flex justify-center px-3.5">
      <div className="pointer-events-auto relative flex h-[62px] w-full max-w-[950px] items-center gap-3.5 rounded-full border border-white/10 bg-[rgba(13,13,13,0.82)] py-1.5 pe-1.5 ps-5 shadow-[0_26px_60px_-34px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,255,255,.05)] backdrop-blur-[18px] backdrop-saturate-150 motion-safe:animate-[nav-in_1.2s_var(--spring)_0.55s_both]">
        <Link href={`/${locale}`} className="flex flex-none items-center gap-2.5" aria-label="Brain Media">
          <span className="grid size-[22px] place-items-center rounded-md bg-yellow font-latin text-[12px] font-bold text-[#0a0a0a] shadow-[inset_0_0_0_1px_rgba(0,0,0,.4)]">
            B
          </span>
          <span className="font-latin text-[13.5px] font-bold leading-none tracking-[0.02em] text-txt">
            BRAIN MEDIA
            <small className="mt-[3px] block font-mono text-[7.5px] font-normal tracking-[0.28em] text-muted">
              BRAND FACTORY · AUH
            </small>
          </span>
        </Link>

        <nav aria-label={dict.nav.ariaLabel} className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {dict.nav.links.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              className="relative rounded-full px-3 py-2.5 text-[13.5px] text-[#c8c6bf] transition-[color,background-color] duration-300 ease-[var(--ease)] before:absolute before:start-0.5 before:top-1/2 before:size-1 before:-translate-y-1/2 before:scale-0 before:rounded-full before:bg-yellow before:transition-transform before:duration-300 hover:bg-white/5 hover:text-white hover:before:scale-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href={`/${locale}#contact`}
          className="relative hidden h-[50px] flex-none items-center gap-2.5 overflow-hidden rounded-full bg-[linear-gradient(105deg,#fff07a,#fbe23d_42%,#d9bf13)] px-[22px] text-[13.5px] font-bold text-[#0a0a0a] shadow-[0_10px_26px_-14px_rgba(251,226,61,.55)] transition-[transform,box-shadow] duration-500 ease-[var(--ease)] hover:-translate-y-px hover:shadow-[0_16px_34px_-14px_rgba(251,226,61,.7)] sm:inline-flex"
        >
          {dict.nav.cta}
          <span aria-hidden className="transition-transform duration-500 group-hover:-translate-x-1">←</span>
        </Link>

        <MobileMenu
          locale={locale}
          links={dict.nav.links}
          cta={dict.nav.cta}
          labels={{ menu: dict.common.menu, close: dict.common.close, navigation: dict.nav.ariaLabel }}
        />
      </div>
    </header>
  )
}
