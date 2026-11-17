'use client'

import Image from 'next/image'
import { useEffect, useRef, type CSSProperties } from 'react'

import { SectionIntro } from '@/components/shared/SectionIntro'
import type { SectionsContent } from '@/content/sections'

interface ProcessSectionProps {
  data: SectionsContent['process']
}

const ICONS = ['icon-discover.svg', 'icon-define.svg', 'icon-design.svg', 'icon-build.svg']

export function ProcessSection({ data }: ProcessSectionProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<Array<HTMLElement | null>>([])
  const progsRef = useRef<Array<SVGPathElement | null>>([])
  const leadsRef = useRef<Array<HTMLElement | null>>([])
  const nodesRef = useRef<Array<HTMLElement | null>>([])
  const keyRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)

  // mobile timeline
  const mobRef = useRef<HTMLOListElement>(null)
  const mobItemsRef = useRef<Array<HTMLLIElement | null>>([])
  const mobFillRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const board = boardRef.current
    if (!wrap || !board) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const paths = [750, 1150, 750]
    const cards = cardsRef.current
    const progs = progsRef.current
    const leads = leadsRef.current
    const nodes = nodesRef.current
    const key = keyRef.current
    const halo = haloRef.current
    const ring = ringRef.current

    const EASE_OUT = 'cubic-bezier(.16,1,.3,1)'
    const EASE_IO = 'cubic-bezier(.37,0,.63,1)'

    const resize = () => wrap.style.setProperty('--s', (wrap.clientWidth / 954).toFixed(4))
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(wrap)
    window.addEventListener('resize', resize)
    resize()

    const state = { active: 0, drawn: 0, traveling: null as number | null, complete: false, resetting: false }
    let hovered: number | null = null

    const render = () => {
      const act = hovered !== null ? hovered : state.active
      board.toggleAttribute('data-resetting', state.resetting)
      cards.forEach((card, i) => card?.toggleAttribute('data-active', act === i || state.complete))
      progs.forEach((prog, i) => prog?.toggleAttribute('data-on', state.drawn > i || state.traveling === i))
      nodes.forEach((node) => {
        const t = Number(node?.getAttribute('data-path'))
        const on = node?.getAttribute('data-pos') === 'from' ? state.drawn > t || state.traveling === t : state.drawn > t
        node?.toggleAttribute('data-on', on)
      })
    }

    cards.forEach((card, i) => {
      card?.addEventListener('mouseenter', () => {
        hovered = i
        render()
      })
      card?.addEventListener('mouseleave', () => {
        hovered = null
        render()
      })
    })

    let gen = 0
    const wait = (ms: number) => {
      const g = gen
      return new Promise<void>((resolve, reject) => {
        let left = ms
        let last = performance.now()
        const step = (t: number) => {
          if (g !== gen) return reject(new Error('cancelled'))
          if (hovered === null) left -= t - last
          last = t
          if (left <= 0) return resolve()
          requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      })
    }

    const animateKey = (big: boolean) => {
      key?.animate(
        big
          ? [
              { transform: 'translateY(0) scale(1)' },
              { transform: 'translateY(4px) scale(.92)', offset: 0.25, easing: EASE_OUT },
              { transform: 'translateY(-2px) scale(1.03)', offset: 0.55, easing: EASE_IO },
              { transform: 'translateY(0) scale(1)' },
            ]
          : [
              { transform: 'translateY(0) scale(1)' },
              { transform: 'translateY(1.5px) scale(.965)', offset: 0.3, easing: EASE_OUT },
              { transform: 'translateY(0) scale(1)' },
            ],
        { duration: big ? 900 : 520, easing: EASE_IO },
      )
      halo?.animate(
        [
          { opacity: 0.8, transform: 'scale(1)' },
          { opacity: 1, transform: `scale(${big ? 1.35 : 1.08})`, offset: 0.35 },
          { opacity: 0.8, transform: 'scale(1)' },
        ],
        { duration: big ? 1400 : 900, easing: EASE_IO },
      )
      if (big && ring) {
        ring.animate(
          [
            { opacity: 0.9, transform: 'scale(.95)' },
            { opacity: 0, transform: 'scale(1.6)' },
          ],
          { duration: 900, easing: EASE_OUT },
        )
      }
    }

    const sendLead = (i: number) => {
      const el = leads[i]
      if (!el) return
      el.animate(
        [
          { offsetDistance: '0%', opacity: 0 },
          { opacity: 1, offset: 0.12 },
          { offsetDistance: '100%', opacity: 1, offset: 0.88 },
          { offsetDistance: '100%', opacity: 0 },
        ],
        { duration: paths[i] + 250, easing: EASE_IO },
      )
    }

    let inView = false
    const run = () => {
      const g = ++gen
      void (async () => {
        try {
          while (g === gen && inView) {
            state.active = 0
            state.drawn = 0
            state.traveling = null
            state.complete = false
            state.resetting = false
            render()
            await wait(400)

            for (let i = 0; i < paths.length; i += 1) {
              if (g !== gen || !inView) return
              state.traveling = i
              render()
              animateKey(false)
              sendLead(i)
              await wait(paths[i])
              state.traveling = null
              state.drawn = i + 1
              state.active = i + 1
              render()
              await wait(1700)
            }

            if (g !== gen || !inView) return
            state.complete = true
            render()
            animateKey(true)
            await wait(1500)
            state.complete = false
            state.resetting = true
            render()
            await wait(600)
          }
        } catch {
          /* cancelled */
        }
      })()
    }

    render()
    if (reduced) return

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          const visible = entries[0]?.isIntersecting ?? false
          if (visible === inView) return
          inView = visible
          if (visible) run()
          else gen += 1
        },
        { threshold: 0.1 },
      )
      io.observe(wrap)
      return () => io.disconnect()
    }

    inView = true
    run()
    return undefined
  }, [])

  // mobile timeline
  useEffect(() => {
    const list = mobRef.current
    if (!list) return
    const items = mobItemsRef.current.filter(Boolean) as HTMLLIElement[]
    const fill = mobFillRef.current
    if (!items.length) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let index = 0
    let timer: number | null = null

    const render = () => {
      items.forEach((item, k) => {
        item.toggleAttribute('data-active', k === index)
        item.toggleAttribute('data-done', k <= index)
      })
      if (fill) fill.style.height = `calc((100% - 48px) * ${index / (items.length - 1)})`
    }
    render()

    if (reduced || !('IntersectionObserver' in window)) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false
        if (visible && !timer) {
          timer = window.setInterval(() => {
            index = (index + 1) % items.length
            render()
          }, 1900)
        } else if (!visible && timer) {
          window.clearInterval(timer)
          timer = null
        }
      },
      { threshold: 0.2 },
    )
    io.observe(list)
    return () => io.disconnect()
  }, [])

  return (
    <section className="sec sec--line" id="process">
      <div className="shell frame">
        <span className="x x--tl" />
        <span className="x x--tr" />

        <div className="split">
          <div className="rv">
            <span className="label">{data.label}</span>
            <h2 className="h-lg" style={{ marginTop: 16 }}>
              <span className="dim">{data.titleA}</span>
              <br />
              {data.titleB}
            </h2>
          </div>
          <div className="right rv" style={{ '--d': 120 } as CSSProperties}>
            <p>{data.body}</p>
          </div>
        </div>

        <div className="pstage">
          <div className="pwrap" ref={wrapRef}>
            <div className="pboard" ref={boardRef}>
              <svg className="psvg" width="954" height="594" viewBox="0 0 954 594" fill="none" aria-hidden="true" style={{ pointerEvents: 'none', position: 'absolute', inset: 0, overflow: 'visible' }}>
                <path className="ppath" d="M598 116H356" />
                <path className="ppath" d="M173.5 240V254L794.5 340V354" />
                <path className="ppath" d="M598 478H356" />
                <path className="pprog" d="M598 116H356" pathLength={1} style={{ ['--travel' as string]: '750ms' } as CSSProperties} ref={(el) => { progsRef.current[0] = el }} />
                <path className="pprog" d="M173.5 240V254L794.5 340V354" pathLength={1} style={{ ['--travel' as string]: '1150ms' } as CSSProperties} ref={(el) => { progsRef.current[1] = el }} />
                <path className="pprog" d="M598 478H356" pathLength={1} style={{ ['--travel' as string]: '750ms' } as CSSProperties} ref={(el) => { progsRef.current[2] = el }} />
              </svg>

              <i className="plead" ref={(el) => { leadsRef.current[0] = el }} style={{ offsetPath: "path('M598 116H356')" }} aria-hidden="true" />
              <i className="plead" ref={(el) => { leadsRef.current[1] = el }} style={{ offsetPath: "path('M173.5 240V254L794.5 340V354')" }} aria-hidden="true" />
              <i className="plead" ref={(el) => { leadsRef.current[2] = el }} style={{ offsetPath: "path('M598 478H356')" }} aria-hidden="true" />

              {data.cards.map((card, index) => (
                <div className="pfloat" key={card.title} style={{ animationDelay: `${-index}s` }}>
                  <article
                    className="pcard2"
                    data-card={index}
                    data-active={index === 0 ? true : undefined}
                    style={{
                      left: index % 2 === 0 ? 606 : 0,
                      top: index < 2 ? 0 : 362,
                    }}
                    ref={(el) => { cardsRef.current[index] = el }}
                  >
                    <span
                      className="pcard2__icon"
                      style={{ maskImage: `url(/assets/process/${ICONS[index]})`, WebkitMaskImage: `url(/assets/process/${ICONS[index]})` }}
                      aria-hidden="true"
                    />
                    <span className="pcard2__num" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="pcard2__copy">
                      <h3 className="pcard2__title">{card.title}</h3>
                      <p className="pcard2__desc">{card.desc}</p>
                    </div>
                  </article>
                </div>
              ))}

              <div className="phalo" ref={haloRef} aria-hidden="true" />

              <div className="pkeywrap" aria-hidden="true">
                <span className="pring" ref={ringRef} />
                <div className="pkey" ref={keyRef}>
                  <div className="pkey__face" style={{ maskImage: 'url(/assets/process/key-mask.svg)', WebkitMaskImage: 'url(/assets/process/key-mask.svg)' }} />
                  <Image className="pkey__overlay" src="/assets/process/key-overlay.svg" alt="" fill />
                  <div className="pkey__soft">
                    <Image src="/assets/process/key-softlight.svg" alt="" fill />
                  </div>
                  <div className="pkey__bar">
                    <div className="pkey__barfill" style={{ maskImage: 'url(/assets/process/key-bar-mask.svg)', WebkitMaskImage: 'url(/assets/process/key-bar-mask.svg)' }} />
                  </div>
                  <div className="pkey__rim">
                    <Image src="/assets/process/key-rim.svg" alt="" fill />
                  </div>
                </div>
              </div>

              {[
                { path: 0, pos: 'from', left: 586, top: 104 },
                { path: 0, pos: 'to', left: 344, top: 104 },
                { path: 1, pos: 'from', left: 161.5, top: 228 },
                { path: 1, pos: 'to', left: 782.5, top: 342 },
                { path: 2, pos: 'from', left: 586, top: 466 },
                { path: 2, pos: 'to', left: 344, top: 466 },
              ].map((node, index) => (
                <span className="pnode" key={index} data-path={node.path} data-pos={node.pos} style={{ left: node.left, top: node.top }} aria-hidden="true" ref={(el) => { nodesRef.current[index] = el }}>
                  <Image src="/assets/process/node-idle.svg" alt="" fill />
                  <Image className="pnode__on" src="/assets/process/node-active.svg" alt="" fill />
                </span>
              ))}
            </div>
          </div>

          <ol className="pmob" ref={mobRef}>
            <span className="pmob__line" aria-hidden="true" />
            <span className="pmob__fill" ref={mobFillRef} aria-hidden="true" />

            {data.cards.map((card, index) => (
              <li className="pmob__item" key={card.title} data-step={index} ref={(el) => { mobItemsRef.current[index] = el }}>
                <span className="pmob__node" aria-hidden="true">
                  <Image src="/assets/process/node-idle.svg" alt="" fill />
                  <Image className="on" src="/assets/process/node-active.svg" alt="" fill />
                </span>
                <article className="pmob__card">
                  <div className="pmob__top">
                    <span className="pmob__icon" style={{ maskImage: `url(/assets/process/${ICONS[index]})`, WebkitMaskImage: `url(/assets/process/${ICONS[index]})` }} aria-hidden="true" />
                    <span className="pmob__num" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <h3 className="pmob__title">
                      <span className="pmob__sr">{String(index + 1).padStart(2, '0')}. </span>
                      {card.title}
                    </h3>
                    <p className="pmob__desc">{card.desc}</p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
