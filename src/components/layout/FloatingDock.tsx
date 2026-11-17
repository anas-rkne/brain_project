import Link from 'next/link'

import type { Locale } from '@/lib/i18n/config'

interface FloatingDockProps {
  locale: Locale
  quoteLabel: string
}

export function FloatingDock({ locale, quoteLabel }: FloatingDockProps) {
  return (
    <div className="float-quote">
      <a className="wa" href="https://wa.me/971000000000" target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.4 14.1c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.2-.9-2.7-1.2-4.4-4-4.5-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.3.2-.3.5-.4.7-.4h.5c.2 0 .4-.1.6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.4.3.1.2.1.7-.1 1.2Z" />
        </svg>
      </a>
      <Link href={`/${locale}#contact`} className="btn btn--primary" style={{ height: 46, fontSize: 13 }}>
        {quoteLabel}
      </Link>
    </div>
  )
}
