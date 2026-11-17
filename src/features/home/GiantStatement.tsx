'use client'

import { useEffect, useRef, useState } from 'react'

import type { SectionsContent } from '@/content/sections'
import type { Locale } from '@/lib/i18n/config'
import { PlateField } from './PlateField'
import styles from './giant.module.css'

interface GiantStatementProps {
  data: SectionsContent['giant']
  locale: Locale
}

/**
 * The nameplate: the thesis line is engraved on a machine plate.
 * It powers on once (outline → solid, a current travelling along the rule)
 * and stays on — no fade, no glow.
 */
export function GiantStatement({ data, locale }: GiantStatementProps) {
  const ref = useRef<HTMLElement>(null)
  const [powered, setPowered] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const section = ref.current
    if (!section) return

    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const section = ref.current
    if (!section) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frame = requestAnimationFrame(() => setPowered(true))
      return () => cancelAnimationFrame(frame)
    }

    let ticking = false

    const update = () => {
      ticking = false
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.62) setPowered(true)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    const firstFrame = requestAnimationFrame(update)

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(firstFrame)
    }
  }, [])

  return (
    <section className={styles.wrap} ref={ref} aria-labelledby="giant-title">
      <div className={styles.plate} data-on={powered ? 'true' : 'false'} data-visible={visible ? 'true' : 'false'}>
        <PlateField powered={powered} paused={!visible} rtl={locale === 'ar'} />
        <span className={styles.plotTrack} aria-hidden="true">
          <i className={styles.plot} />
        </span>

        <span className={styles.tick} data-c="tl" aria-hidden="true" />
        <span className={styles.tick} data-c="tr" aria-hidden="true" />
        <span className={styles.tick} data-c="bl" aria-hidden="true" />
        <span className={styles.tick} data-c="br" aria-hidden="true" />

        <div className={styles.bar}>
          <span className={styles.lab}>{data.lab}</span>
          <span className={styles.no}>{data.plate}</span>
        </div>

        <h2 className={styles.lines} id="giant-title">
          {data.lines.map((line, index) => (
            <span key={line.text} className={styles.line} data-i={index + 1}>
              {line.text}
            </span>
          ))}
        </h2>

        <span className={styles.current} aria-hidden="true" />

        <div className={styles.foot}>
          <p>{data.foot}</p>

          <div className={styles.switchWrap}>
            <a className={styles.switch} href={`/${locale}#services`}>
              <span className={styles.track} aria-hidden="true">
                <i />
              </span>
              <span className={styles.switchLabel}>{data.cta}</span>
              <span className={styles.arrow} aria-hidden="true">
                {locale === 'ar' ? '←' : '→'}
              </span>
            </a>
            <span className={styles.reg} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}
