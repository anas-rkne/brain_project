import Link from 'next/link'

import { LocaleSwitch } from '@/components/layout/LocaleSwitch'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'

interface SiteFooterProps {
  locale: Locale
  dict: Dictionary
}

export function SiteFooter({ locale, dict }: SiteFooterProps) {
  const { footer } = dict
  const columns = [footer.capabilities, footer.studio, footer.contact]

  return (
    <footer className="relative mt-24 border-t border-white/8 bg-bg">
      <div className="mx-auto w-full max-w-[var(--maxw)] px-[var(--pad)]">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-dashed border-white/10 py-3 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-2">
          {footer.rail.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-[1.1fr_1.6fr]">
          <div className="flex min-h-[260px] flex-col justify-between rounded-3xl border border-white/10 bg-surface p-7">
            <div className="font-latin text-[clamp(38px,4.4vw,54px)] font-bold leading-[0.88] tracking-[-0.02em]">
              {footer.logo.a}
              <i className="not-italic text-yellow">{footer.logo.b}</i>
              <small className="mt-2 block font-mono text-[9px] font-normal tracking-[0.3em] text-muted">
                {footer.logo.c}
              </small>
            </div>
            <Link
              href={`/${locale}#work`}
              className="flex items-center justify-between border-t border-white/10 pt-4 text-[13px] text-txt/85 transition-colors hover:text-txt"
            >
              {footer.arch}
              <span aria-hidden>↖</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-2.5">
                <h4 className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-2">
                  {column.title}
                </h4>
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="w-fit text-[13.5px] text-txt/75 transition-colors hover:text-txt"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 border-t border-white/8 py-8 md:flex-row md:items-start">
          <div className="font-mono text-[10px] uppercase leading-[1.9] tracking-[0.16em] text-muted-2">
            {footer.meta.map((item) => (
              <span key={item} className="block">
                {item}
              </span>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <small className="block font-mono text-[9px] tracking-[0.2em] text-muted-2">
                {footer.call.talkLabel}
              </small>
              <Link href={`/${locale}#contact`} className="text-[15px] text-txt transition-colors hover:text-yellow">
                {footer.call.talk}
              </Link>
            </div>
            <div>
              <small className="block font-mono text-[9px] tracking-[0.2em] text-muted-2">
                {footer.call.mailLabel}
              </small>
              <a
                href={`mailto:${footer.call.mail}`}
                className="text-[15px] text-txt transition-colors hover:text-yellow"
              >
                {footer.call.mail}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 py-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-2">
            {footer.bottom.copy}
          </span>

          <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] text-muted">
            <Link href="#" className="transition-colors hover:text-txt">
              {footer.bottom.privacy}
            </Link>
            <Link href="#" className="transition-colors hover:text-txt">
              {footer.bottom.terms}
            </Link>

            <LocaleSwitch locale={locale} />

            <div className="flex items-center gap-1.5">
              {footer.socials.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="grid size-8 place-items-center rounded-full border border-white/12 text-[10px] text-txt/70 transition-colors hover:bg-white/6 hover:text-txt"
                >
                  {social.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-2 bg-[linear-gradient(90deg,#fff6b0,#fbe23d_30%,#a08a00_62%,#0a0a0a_100%)]" />
    </footer>
  )
}
