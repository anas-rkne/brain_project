import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

type ButtonVariant = 'primary' | 'ghost'

interface ButtonProps {
  children: ReactNode
  href?: string
  type?: 'button' | 'submit'
  variant?: ButtonVariant
  className?: string
  disabled?: boolean
}

const base =
  'inline-flex h-11 items-center justify-center gap-2.5 rounded-full px-5 text-[13px] font-semibold transition-[transform,box-shadow,background-color,border-color] duration-500 ease-[var(--ease)] disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[linear-gradient(105deg,#fff07a,#fbe23d_42%,#d9bf13)] text-[#0a0a0a] shadow-[0_10px_26px_-14px_rgba(251,226,61,.55)] hover:-translate-y-px hover:shadow-[0_16px_34px_-14px_rgba(251,226,61,.7)]',
  ghost: 'border border-white/15 text-txt hover:bg-white/5',
}

export function Button({ children, href, type = 'button', variant = 'primary', className, disabled }: ButtonProps) {
  const classes = cn(base, variants[variant], className)

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled}>
      {children}
    </button>
  )
}
