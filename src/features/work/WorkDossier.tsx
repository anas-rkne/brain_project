'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { SectionsContent } from '@/content/sections'
import styles from './work.module.css'

type WorkContent = SectionsContent['work']

const pad = (value: number) => String(value).padStart(2, '0')

interface WorkDossierProps {
  data: WorkContent
  locale: string
}

/**
 * (03) Selected work — an archive drawer, not a card grid.
 * The index row is the folder spine; the panel is the open folder.
 * Clicking a row opens the full sheet deck in an in-page stage.
 */
export function WorkDossier({ data, locale }: WorkDossierProps) {
  const rtl = locale === 'ar'
  const files = data.cases

  const [active, setActive] = useState(0)
  const [opened, setOpened] = useState<number | null>(null)
  const [sheet, setSheet] = useState(0)

  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const swipeX = useRef<number | null>(null)

  const file = opened === null ? null : files[opened]
  const sheetCount = file ? file.sheets.length : 0

  const open = useCallback((index: number) => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setSheet(0)
    setOpened(index)
  }, [])

  const close = useCallback(() => {
    setOpened(null)
    openerRef.current?.focus()
  }, [])

  const step = useCallback(
    (delta: number) => {
      setSheet((current) => {
        if (!sheetCount) return current
        return (current + delta + sheetCount) % sheetCount
      })
    },
    [sheetCount],
  )

  /* scroll lock, keyboard, focus trap */
  useEffect(() => {
    if (!file) return

    const body = document.body
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    const trapFocus = (event: KeyboardEvent) => {
      const root = dialogRef.current
      if (!root) return
      const nodes = root.querySelectorAll<HTMLElement>('button:not([disabled])')
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key === 'Tab') {
        trapFocus(event)
        return
      }
      const nextKey = rtl ? 'ArrowLeft' : 'ArrowRight'
      const prevKey = rtl ? 'ArrowRight' : 'ArrowLeft'
      if (event.key === nextKey) {
        event.preventDefault()
        step(1)
      } else if (event.key === prevKey) {
        event.preventDefault()
        step(-1)
      }
    }

    window.addEventListener('keydown', onKey)
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 40)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(focusTimer)
      body.style.overflow = previousOverflow
    }
  }, [file, close, step, rtl])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    swipeX.current = event.clientX
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (swipeX.current === null) return
    const delta = event.clientX - swipeX.current
    swipeX.current = null
    if (Math.abs(delta) < 46) return
    const forward = rtl ? delta > 0 : delta < 0
    step(forward ? 1 : -1)
  }

  const totalSheets = files.reduce((sum, entry) => sum + entry.sheets.length, 0)

  return (
    <section className="sec sec--line" id="work" aria-labelledby="work-title">
      <div className="shell frame">
        <span className="x x--tl" />
        <span className="x x--tr" />

        <header className={styles.head}>
          <div>
            <span className="label">{data.label}</span>
            <h2 className={styles.title} id="work-title">
              {data.title.split('\n').map((line, index) => (
                <span key={line}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>
          </div>

          <div className={styles.headSide}>
            <p className={styles.body}>{data.body}</p>
            <div className={styles.meta}>
              <span>
                <b>{pad(files.length)}</b>
                {data.filesWord}
              </span>
              <span>
                <b>{pad(totalSheets)}</b>
                {data.sheetsWord}
              </span>
            </div>
          </div>
        </header>

        <div className={styles.desk}>
          <div className={styles.panel}>
            {files.map((item, index) => (
              <article
                key={`${item.client}-spread`}
                className={styles.spread}
                data-on={index === active}
                inert={index !== active}
                aria-hidden={index !== active}
              >
                <div className={styles.fan}>
                  <span className={styles.back} aria-hidden="true">
                    <Image src={item.sheets[2] ?? item.sheets[0]} alt="" fill sizes="(max-width: 980px) 60vw, 26vw" />
                  </span>
                  <span className={styles.mid} aria-hidden="true">
                    <Image src={item.sheets[1] ?? item.sheets[0]} alt="" fill sizes="(max-width: 980px) 62vw, 28vw" />
                  </span>

                  <button
                    type="button"
                    className={styles.cover}
                    onClick={() => open(index)}
                    aria-label={`${data.openLabel} — ${item.client}`}
                  >
                    <Image
                      src={item.img}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 980px) 78vw, 34vw"
                    />
                    <span className={styles.tab}>{item.badge}</span>
                    <span className={styles.fileNo} aria-hidden="true">
                      FILE {pad(index + 1)}
                    </span>
                    <span className={styles.coverGo} aria-hidden="true">
                      ↗
                    </span>
                  </button>
                </div>

                <blockquote className={styles.quote}>
                  {item.quotePlain}
                  <em>{item.quoteEm}</em>
                  {item.quoteRest}
                </blockquote>
              </article>
            ))}
          </div>

          <ol className={styles.index}>
            {files.map((item, index) => (
              <li key={`${item.client}-row`} className={styles.item}>
                <button
                  type="button"
                  className={styles.row}
                  data-on={index === active}
                  onClick={() => {
                    setActive(index)
                    open(index)
                  }}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  aria-haspopup="dialog"
                  aria-label={`${data.openLabel} — ${item.client}`}
                >
                  <span className={styles.num}>{pad(index + 1)}</span>
                  <span className={styles.client}>{item.client}</span>
                  <span className={styles.rowTitle}>{item.title}</span>
                  <span className={styles.rowTags}>{item.tags.join(' / ')}</span>
                  <span className={styles.count}>
                    <b>{pad(item.sheets.length)}</b>
                    {data.sheetsWord}
                  </span>
                  <span className={styles.go} aria-hidden="true">
                    ↗
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <p className={styles.foot}>{data.foot}</p>
      </div>

      {file && (
        <div className={styles.deck} role="dialog" aria-modal="true" aria-labelledby="deck-title" ref={dialogRef}>
          <div className={styles.deckBar}>
            <span className={styles.deckCount} aria-live="polite">
              <b>{pad(sheet + 1)}</b>
              <i>/</i>
              {pad(sheetCount)}
            </span>

            <h3 className={styles.deckTitle} id="deck-title">
              {file.client}
              <span>
                {file.year} · {file.who}
              </span>
            </h3>

            <button
              type="button"
              className={styles.deckClose}
              onClick={close}
              aria-label={data.closeLabel}
              ref={closeRef}
            >
              ✕
            </button>
          </div>

          <div className={styles.deckStage} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
            <button type="button" className={styles.arrow} onClick={() => step(-1)} aria-label={data.prevLabel}>
              {rtl ? '→' : '←'}
            </button>

            <figure className={styles.plate} key={sheet}>
              <Image
                src={file.sheets[sheet]}
                alt={`${file.alt} — ${sheet + 1}`}
                fill
                sizes="(max-width: 720px) 86vw, 56vh"
                priority
              />
            </figure>

            <button type="button" className={styles.arrow} onClick={() => step(1)} aria-label={data.nextLabel}>
              {rtl ? '←' : '→'}
            </button>
          </div>

          <div className={styles.deckFoot}>
            <ol className={styles.thumbs}>
              {file.sheets.map((src, index) => (
                <li key={src}>
                  <button
                    type="button"
                    data-on={index === sheet}
                    onClick={() => setSheet(index)}
                    aria-label={`${data.sheetsWord} ${index + 1}`}
                    aria-current={index === sheet}
                  >
                    {pad(index + 1)}
                  </button>
                </li>
              ))}
            </ol>

            <p className={styles.deckQuote}>
              {file.quotePlain}
              <em>{file.quoteEm}</em>
              {file.quoteRest}
            </p>

            <span className={styles.hint}>
              <span className={styles.hintKeys}>{data.hint}</span>
              <span className={styles.hintSwipe}>{data.hintSwipe}</span>
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
