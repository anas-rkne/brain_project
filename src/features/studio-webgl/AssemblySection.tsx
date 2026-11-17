'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'

import type { SectionsContent } from '@/content/sections'
import type { AssemblyHandle } from './assembly'
import { frameAt } from './frames'
import styles from './assembly.module.css'

interface AssemblySectionProps {
  data: SectionsContent['studio']
}

const COUNTS = { high: 6000, low: 3200 }

export function AssemblySection({ data }: AssemblySectionProps) {
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const [percent, setPercent] = useState(0)
  const [failed, setFailed] = useState(false)

  const words = [...data.problems.map((problem) => problem.word), data.word]

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return

    let cancelled = false
    let handle: AssemblyHandle | null = null
    let ticker: ((time: number) => void) | null = null
    let gsapTicker: { add: (fn: (time: number) => void) => void; remove: (fn: (time: number) => void) => void } | null = null
    let scrollTrigger: { kill: () => void } | null = null
    let observer: IntersectionObserver | null = null

    const onResize = () => handle?.resize()

    const onPointerMove = (event: PointerEvent) => {
      handle?.setPointer(event.clientX, event.clientY)
      const stage = stageRef.current
      if (stage) {
        stage.style.setProperty('--mx', `${event.clientX}px`)
        stage.style.setProperty('--my', `${event.clientY}px`)
      }
    }

    const onPointerLeave = () => handle?.setHover(0)

    const onVisibility = () => {
      if (!gsapTicker || !ticker) return
      if (document.hidden) gsapTicker.remove(ticker)
      else gsapTicker.add(ticker)
    }

    const boot = async () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const lowPower = window.innerWidth < 760 || (navigator.hardwareConcurrency ?? 8) <= 4

      try {
        await document.fonts.ready
      } catch {
        /* font loading is best-effort */
      }
      if (cancelled) return

      const { createAssembly } = await import('./assembly')
      if (cancelled) return

      try {
        handle = createAssembly({
          canvas,
          words,
          count: lowPower ? COUNTS.low : COUNTS.high,
        })
      } catch {
        setFailed(true)
        setPercent(100)
        return
      }

      if (reduced) {
        handle.setFrame(4, 1)
        handle.render(0)
        setPercent(100)
        return
      }

      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      if (cancelled) {
        handle.dispose()
        return
      }

      gsap.registerPlugin(ScrollTrigger)

      scrollTrigger = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          progressRef.current = self.progress
          const frame = frameAt(self.progress)
          handle?.setFrame(frame.phase, frame.assemble)
        },
      })

      ticker = (time: number) => {
        handle?.render(time)
        const next = Math.round(progressRef.current * 100)
        setPercent((current) => (current === next ? current : next))
      }

      gsapTicker = gsap.ticker
      gsapTicker.add(ticker)

      window.addEventListener('resize', onResize)
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('pointerleave', onPointerLeave)
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

      handle.render(0)
    }

    void boot()

    return () => {
      cancelled = true
      if (observer) observer.disconnect()
      if (gsapTicker && ticker) gsapTicker.remove(ticker)
      if (scrollTrigger) scrollTrigger.kill()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      handle?.dispose()
    }
    // `words` is derived from `data`, which is stable content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const frame = frameAt(percent / 100)
  const chapter = Math.min(4, Math.max(0, frame.chapter))
  const isFinal = chapter === 4
  const problem = data.problems[Math.min(chapter, data.problems.length - 1)]
  const [num, tag] = problem.n.split('—').map((part) => part.trim())
  /* the problem text flips to the fix only once the word has landed */
  const showFix = !isFinal && frame.landed
  /* the echo word: Latin, huge, cropped by the stage edge */
  const ghost = isFinal ? data.solution.label : tag
  const ghostOpacity = Math.min(1, Math.max(0, (percent - 10) / 8))

  return (
    <section className={styles.wrap} id="studio" ref={rootRef} aria-labelledby="assembly-title">
      <div className={styles.stage} ref={stageRef}>
        <div className={styles.field} aria-hidden="true" />
        <div className={styles.fieldLit} aria-hidden="true" />
        <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
        <div className={styles.sweep} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.ghost} style={{ opacity: ghostOpacity }} aria-hidden="true">
          <span key={ghost}>{ghost}</span>
        </div>

        {failed && <div className={styles.fallback}>{data.word}</div>}

        <div className={styles.hud}>
          <div className={styles.top}>
            <span className={styles.label}>{data.label}</span>

            <span className={styles.meta}>
              <span className={styles.hint} data-on={percent < 2 || undefined} aria-hidden="true">
                ↓ SCROLL
              </span>
              <span className={styles.count} aria-hidden="true">
                {String(chapter + 1).padStart(2, '0')}
                <i>/</i>05
              </span>
            </span>
          </div>

          <div className={styles.headline} style={{ '--fade': Math.min(1, percent / 14) } as CSSProperties}>
            <h2 className={styles.statement} id="assembly-title">
              {data.title.split('\n').map((line, index) => (
                <span key={line}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>

            <p className={styles.kicker}>
              <i aria-hidden="true" />
              {data.kicker}
            </p>
          </div>

          <span className={styles.side} aria-hidden="true">
            <i />
            {isFinal ? data.solution.label : tag}
          </span>

          <footer className={styles.bottom}>
            <div
              className={styles.slot}
              style={{ '--p': percent / 100 } as CSSProperties}
              data-fix={showFix || undefined}
              data-final={isFinal || undefined}
            >
              <div className={styles.chapterHead}>
                <span className={styles.numeral}>{isFinal ? '05' : num}</span>
                <span className={styles.chapterTag}>{isFinal ? data.solution.label : tag}</span>
                <span className={styles.rule} aria-hidden="true" />
              </div>

              <h3 className={styles.chapterTitle} key={chapter}>
                {isFinal ? data.solution.title : problem.title}
              </h3>

              {isFinal ? (
                <p className={styles.note}>{data.solution.note}</p>
              ) : (
                <div className={styles.swap}>
                  <p className={styles.desc}>{problem.desc}</p>
                  <p className={styles.fix}>
                    <span className={styles.fixLabel}>{data.fixLabel}</span>
                    {problem.fix}
                  </p>
                </div>
              )}
            </div>
          </footer>
        </div>
      </div>
    </section>
  )
}
