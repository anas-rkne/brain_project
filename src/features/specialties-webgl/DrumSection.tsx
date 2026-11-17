'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import type { SectionsContent } from '@/content/sections'
import type { DrumHandle } from './drum'
import styles from './drum.module.css'

interface DrumSectionProps {
  data: SectionsContent['specialties']
}

export function DrumSection({ data }: DrumSectionProps) {
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [active, setActive] = useState(0)
  const [ready, setReady] = useState(false)
  const [fallback, setFallback] = useState(false)

  const items = data.items
  const item = items[Math.min(active, items.length - 1)]

  useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!root || !stage || !canvas) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFallback(true)
      return
    }

    let cancelled = false
    let handle: DrumHandle | null = null
    let ticker: ((time: number) => void) | null = null
    let gsapTicker: { add: (fn: (time: number) => void) => void; remove: (fn: (time: number) => void) => void } | null = null
    let trigger: { kill: () => void } | null = null
    let observer: IntersectionObserver | null = null

    const onResize = () => handle?.resize()

    const onVisibility = () => {
      if (!gsapTicker || !ticker) return
      if (document.hidden) gsapTicker.remove(ticker)
      else gsapTicker.add(ticker)
    }

    const boot = async () => {
      try {
        const { createDrum } = await import('./drum')
        if (cancelled) return

        handle = createDrum({
          canvas,
          images: items.map((entry) => entry.img),
          onActive: setActive,
        })
        setReady(true)
      } catch {
        setFallback(true)
        return
      }

      try {
        const { gsap } = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        if (cancelled) {
          handle.dispose()
          return
        }

        gsap.registerPlugin(ScrollTrigger)

        trigger = ScrollTrigger.create({
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            handle?.setProgress(self.progress)
            stage.style.setProperty('--p', self.progress.toFixed(4))
          },
        })

        ticker = (time: number) => handle?.render(time)
        gsapTicker = gsap.ticker
        gsapTicker.add(ticker)

        window.addEventListener('resize', onResize)
        document.addEventListener('visibilitychange', onVisibility)

        if ('IntersectionObserver' in window) {
          observer = new IntersectionObserver(
            ([entry]) => {
              if (!gsapTicker || !ticker) return
              if (entry.isIntersecting) gsapTicker.add(ticker)
              else gsapTicker.remove(ticker)
            },
            { threshold: 0 },
          )
          observer.observe(root)
        }
      } catch {
        setFallback(true)
      }
    }

    void boot()

    return () => {
      cancelled = true
      if (observer) observer.disconnect()
      if (gsapTicker && ticker) gsapTicker.remove(ticker)
      if (trigger) trigger.kill()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      handle?.dispose()
    }
    // content is a stable module constant; re-boot would leak a GL context
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (fallback) {
    return (
      <section className={styles.static} id="specialties" aria-labelledby="specialties-title">
        <div className={styles.staticIn}>
          <span className={styles.label}>{data.label}</span>
          <h2 className={styles.staticTitle} id="specialties-title">
            {data.title}
          </h2>
          <p className={styles.staticBody}>{data.body}</p>

          <div className={styles.archive}>
            {items.map((entry) => (
              <figure key={entry.num}>
                <div className={styles.archivePlate}>
                  <Image src={entry.img} alt="" fill sizes="(max-width: 820px) 50vw, 25vw" />
                </div>
                <figcaption>
                  <span className={styles.archiveNum}>{entry.num}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.desc}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.wrap} id="specialties" ref={rootRef} aria-labelledby="specialties-title">
      <div className={styles.stage} ref={stageRef}>
        <header className={styles.intro}>
          <span className={styles.label}>{data.label}</span>
          <h2 className={styles.title} id="specialties-title">
            {data.title.split('\n').map((line, index) => (
              <span key={line}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </h2>
          <p className={styles.body}>{data.body}</p>
        </header>

        <div className={styles.carousel}>
          <canvas className={styles.canvas} ref={canvasRef} data-ready={ready || undefined} aria-hidden="true" />
          <div className={styles.vignette} aria-hidden="true" />
        </div>

        <footer className={styles.copy} key={item.num}>
          <span className={styles.index}>
            {item.num}
            <b aria-hidden="true">/</b>
            {items[items.length - 1].num}
          </span>
          <h3>{item.title}</h3>
          <p>{item.desc}</p>

          <span className={styles.pill}>
            <i aria-hidden="true" />
            {item.pill}
          </span>

          <span className={styles.ticks} aria-hidden="true">
            {items.map((entry, index) => (
              <i key={entry.num} data-on={index === active || undefined} />
            ))}
          </span>
        </footer>

        <span className={styles.progress} aria-hidden="true" />

        <ol className={styles.sr}>
          {items.map((entry) => (
            <li key={entry.num}>
              {entry.num} — {entry.title}: {entry.desc}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
