'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { cn } from '@/lib/utils/cn'
import type { Project } from '@/types/project'

import { HeroWord } from './HeroWord'
import { useBeltCamera } from './useBeltCamera'
import styles from './hero.module.css'

const BEAT = 6200
const FLASH_HOLD = 2650

interface HeroSectionProps {
  locale: Locale
  dict: Dictionary
  projects: Project[]
}

export function HeroSection({ locale, dict, projects }: HeroSectionProps) {
  const isMobile = useMediaQuery('(max-width: 1023px)')
  const reduced = usePrefersReducedMotion()

  const total = projects.length || 5
  const [active, setActive] = useState(0)
  const [flash, setFlash] = useState<{ index: number; step: number } | null>(null)

  const activeRef = useRef(0)
  const beatStart = useRef(0)
  const hoverRef = useRef(false)
  const hoverLock = useRef(0)
  const barRef = useRef<HTMLElement>(null)
  const beltRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<Array<HTMLAnchorElement | null>>([])
  const timers = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }, [])

  const flashWord = useCallback(
    (index: number) => {
      clearTimers()
      setFlash({ index, step: 0 })

      timers.current.push(
        window.setTimeout(() => setFlash((current) => (current?.index === index ? { index, step: 1 } : current)), 860),
      )
      timers.current.push(
        window.setTimeout(() => setFlash((current) => (current?.index === index ? { index, step: 2 } : current)), 1720),
      )
      timers.current.push(
        window.setTimeout(() => setFlash((current) => (current?.index === index ? null : current)), FLASH_HOLD),
      )
    },
    [clearTimers],
  )

  const activate = useCallback(
    (index: number, silent = false) => {
      if (index < 0 || index >= total || index === activeRef.current) return

      activeRef.current = index
      setActive(index)
      beatStart.current = performance.now()

      if (!silent && !reduced) flashWord(index)
    },
    [flashWord, reduced, total],
  )

  const activateRef = useRef(activate)
  useEffect(() => {
    activateRef.current = activate
  }, [activate])

  /* one clock: progress → next project → word/photo → belt */
  useEffect(() => {
    beatStart.current = performance.now()
    activeRef.current = 0
    setActive(0)
    setFlash(null)

    if (reduced) return

    let raf = 0
    const frame = (time: number) => {
      const progress = Math.min(1, (time - beatStart.current) / BEAT)

      if (!hoverRef.current) {
        if (progress >= 1) activateRef.current((activeRef.current + 1) % total)
        if (barRef.current) barRef.current.style.transform = `scaleX(${progress.toFixed(3)})`
      }

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [reduced, total])

  useEffect(() => clearTimers, [clearTimers])

  /* mobile: the belt scrolls to the active card */
  useEffect(() => {
    if (!isMobile) return
    const belt = beltRef.current
    const card = cardsRef.current[active]
    if (!belt || !card) return

    belt.scrollTo({
      left: card.offsetLeft - (belt.clientWidth - card.offsetWidth) / 2,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }, [active, isMobile, reduced])

  useBeltCamera({
    containerRef: beltRef,
    cardsRef,
    active,
    enabled: !isMobile,
    reduced,
    count: total,
  })

  const onCardEnter = (index: number) => (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === 'touch') return
    hoverRef.current = true

    const now = performance.now()
    if (now < hoverLock.current) return
    hoverLock.current = now + 650
    activate(index)
  }

  const handWords = dict.hero.line2b.split(/\s+/).filter(Boolean)
  const wordTexts = [dict.hero.line1a, dict.hero.line1b, dict.hero.line2a, ...handWords]

  const wordProps = (index: number) => ({
    active: flash?.index === index,
    step: flash?.index === index ? flash.step : -1,
  })

  return (
    <section id="hero" className={styles.hero}>
      <div aria-hidden className={styles.frame} />

      <div className={styles.type}>
        <h1 className={styles.mega} aria-label={dict.hero.aria}>
          <span aria-hidden className={styles.line}>
            <span className={styles.inner}>
              <span className={styles.row}>
                <HeroWord text={wordTexts[0]} project={projects[0]} {...wordProps(0)} />
                <HeroWord text={wordTexts[1]} project={projects[1]} {...wordProps(1)} />
              </span>
            </span>
          </span>

          <span aria-hidden className={styles.line}>
            <span className={`${styles.inner} ${styles.inner2}`}>
              <span className={`${styles.row} ${styles.row2}`}>
                <HeroWord text={wordTexts[2]} project={projects[2]} {...wordProps(2)} />
                <span aria-hidden className={styles.dot} />
                <span className={styles.hand}>
                  {handWords.map((word, index) => (
                    <HeroWord
                      key={word}
                      text={word}
                      project={projects[3 + index]}
                      small
                      {...wordProps(3 + index)}
                    />
                  ))}
                </span>
              </span>
            </span>
          </span>
        </h1>
      </div>

      <div className={styles.cta}>
        <p className={styles.lead}>{dict.hero.lead}</p>
        <div className={styles.actions}>
          <Button href={`/${locale}#contact`}>
            {dict.hero.primaryCta}
            <span aria-hidden>←</span>
          </Button>
          <Button href={`/${locale}#work`} variant="ghost">
            {dict.hero.secondaryCta}
            <span aria-hidden>↖</span>
          </Button>
        </div>
      </div>

      <div className={styles.bar}>
        <span className={styles.barLeft}>
          <i aria-hidden />
          {dict.hero.barLabel}
        </span>
        <span className={styles.barCount}>
          <b>{String(active + 1).padStart(2, '0')}</b>
          <em> / {String(total).padStart(2, '0')}</em>
        </span>
        <span aria-hidden className={styles.track}>
          <i ref={barRef} className={styles.trackFill} />
        </span>
        <span className={styles.barRight}>
          <b>{projects[active]?.name ?? '—'}</b>
          <span>{projects[active]?.scope ?? dict.hero.barScope}</span>
        </span>
      </div>

      <div
        className={styles.belt}
        ref={beltRef}
        aria-label={dict.hero.beltLabel}
        onPointerDown={() => {
          hoverRef.current = true
        }}
        onPointerUp={() => {
          hoverRef.current = false
          beatStart.current = performance.now()
        }}
        onPointerCancel={() => {
          hoverRef.current = false
          beatStart.current = performance.now()
        }}
        onPointerLeave={() => {
          hoverRef.current = false
          beatStart.current = performance.now()
        }}
      >
        <div className={styles.beltTrack}>
          {projects.map((project, index) => (
            <a
              key={project.id}
              href={`/${locale}#work`}
              ref={(element) => {
                cardsRef.current[index] = element
              }}
              className={cn(styles.card, index === active && styles.cardOn)}
              style={{ '--i': index } as CSSProperties}
              onPointerEnter={onCardEnter(index)}
              onFocus={() => activate(index)}
              aria-label={`${project.name} — ${project.scope}`}
            >
              <span className={styles.cardLb}>
                {project.code} — {project.name}
              </span>
              <span className={styles.cardFrame}>
                <Image
                  src={project.cover.src}
                  alt={project.cover.alt}
                  fill
                  sizes="(max-width: 560px) 84vw, (max-width: 1023px) 80vw, 272px"
                  className={styles.cardImg}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
