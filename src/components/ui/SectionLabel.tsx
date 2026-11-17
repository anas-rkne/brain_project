import type { ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

interface SectionLabelProps {
  children: ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-2',
        className,
      )}
    >
      <span aria-hidden className="size-1 shrink-0 rounded-full bg-yellow" />
      {children}
    </span>
  )
}
