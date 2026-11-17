'use client'

import { useEffect, useRef } from 'react'

/**
 * Writes scroll progress (0 → 1) straight to a CSS variable on the element.
 * No React re-renders, no timers — one rAF per scroll frame.
 *
 * `start` = viewport position (0..1) where progress is 0.
 * `end`   = viewport position (0..1) where progress is 1.
 */
export function useProgressVar<T extends HTMLElement>(start = 0.92, end = 0.35) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.style.setProperty('--p', '1')
      return
    }

    let frame = 0

    const measure = () => {
      frame = 0
      const rect = element.getBoundingClientRect()
      const viewport = window.innerHeight
      const span = rect.height + viewport * (start - end)
      const passed = viewport * start - rect.top
      const progress = span <= 0 ? 1 : passed / span
      element.style.setProperty('--p', String(Math.min(1, Math.max(0, progress))))
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [start, end])

  return ref
}
