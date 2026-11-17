'use client'

import { useEffect } from 'react'

/**
 * Replaces the prototype's reveal loop: observes every `.rv` and adds `.in`
 * when it enters the viewport. Runs once after hydration.
 */
export function ScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('.rv')

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('in'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return null
}
