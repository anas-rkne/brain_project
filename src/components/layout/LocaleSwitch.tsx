'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { locales, type Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/utils/cn'

interface LocaleSwitchProps {
  locale: Locale
  className?: string
}

export function LocaleSwitch({ locale, className }: LocaleSwitchProps) {
  const pathname = usePathname() ?? `/${locale}`
  const rest = pathname.replace(/^\/(ar|en)(?=\/|$)/, '')

  return (
    <div
      className={cn('flex flex-none items-center gap-0.5 rounded-full border border-white/12 p-0.5', className)}
      aria-label="Language"
    >
      {locales.map((item) => {
        const active = item === locale
        return (
          <Link
            key={item}
            href={`/${item}${rest}`}
            hrefLang={item}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'rounded-full px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors',
              active ? 'bg-yellow text-[#0a0a0a]' : 'text-muted hover:text-txt',
            )}
          >
            {item === 'ar' ? 'العربية' : 'EN'}
          </Link>
        )
      })}
    </div>
  )
}
