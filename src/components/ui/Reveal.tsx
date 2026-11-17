'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils/cn'

interface RevealProps {
  children: ReactNode
  /** Delay in milliseconds, applied as a transition delay. */
  delay?: number
  className?: string
}

/**
 * IntersectionObserver-based reveal. Replaces the prototype `[data-io]` loop.
 * Motion is skipped entirely for `prefers-reduced-motion: reduce`.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-shown={shown}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        'translate-y-6 opacity-0 transition-[opacity,transform] duration-700 ease-[var(--ease)]',
        'data-[shown=true]:translate-y-0 data-[shown=true]:opacity-100',
        className,
      )}
    >
      {children}
    </div>
  )
}
