'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { LocaleSwitch } from '@/components/layout/LocaleSwitch'
import type { Locale } from '@/lib/i18n/config'

interface NavLink {
  label: string
  href: string
}

interface MobileMenuProps {
  locale: Locale
  links: NavLink[]
  cta: string
  labels: { menu: string; close: string; navigation: string }
}

export function MobileMenu({ locale, links, cta, labels }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.close : labels.menu}
        onClick={() => setOpen((value) => !value)}
        className="grid size-11 flex-none place-items-center rounded-full border border-white/12 bg-white/6 text-txt transition-colors hover:bg-white/10 lg:hidden"
      >
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
          {open ? (
            <path d="M2 2l12 8M14 2L2 10" stroke="currentColor" strokeWidth="1.4" />
          ) : (
            <path d="M0 1h16M0 6h16M0 11h10" stroke="currentColor" strokeWidth="1.4" />
          )}
        </svg>
      </button>

      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-[calc(100%+10px)] rounded-[28px] border border-white/10 bg-[#0d0d0d] p-3 shadow-[0_30px_70px_-30px_rgba(0,0,0,.9)] lg:hidden"
      >
        <nav aria-label={labels.navigation} className="flex flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-[15px] text-txt/85 transition-colors hover:bg-white/6 hover:text-txt"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/8 px-2 pt-3">
          <Link
            href={`/${locale}#contact`}
            onClick={() => setOpen(false)}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[linear-gradient(105deg,#fff07a,#fbe23d_42%,#d9bf13)] px-5 text-[13px] font-semibold text-[#0a0a0a]"
          >
            {cta}
          </Link>
          <LocaleSwitch locale={locale} />
        </div>
      </div>
    </>
  )
}
