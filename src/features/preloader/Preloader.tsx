'use client'

import { useEffect, useState } from 'react'

export function Preloader() {
  const [percent, setPercent] = useState(0)
  const [stats, setStats] = useState<number[]>([0, 0, 0, 0, 0, 0])
  const [done, setDone] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let raf = 0
    let timeout: number | undefined

    const finish = () => {
      setDone(true)
      timeout = window.setTimeout(() => setGone(true), 900)
      document.body.style.overflow = ''
    }

    document.body.style.overflow = 'hidden'

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }

    const duration = 1650
    let start: number | null = null

    const tick = (time: number) => {
      if (start === null) start = time
      const progress = Math.min(1, (time - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)

      setPercent(Math.round(eased * 100))
      setStats(Array.from({ length: 6 }, (_, index) => Math.min(99, Math.round(eased * 100 * (0.55 + 0.09 * index)))))

      if (progress < 1) raf = requestAnimationFrame(tick)
      else timeout = window.setTimeout(finish, 260)
    }

    raf = requestAnimationFrame(tick)

    const skip = () => finish()
    window.addEventListener('wheel', skip, { once: true, passive: true })
    window.addEventListener('touchstart', skip, { once: true, passive: true })
    window.addEventListener('click', skip, { once: true })

    const guard = window.setTimeout(finish, 5200)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timeout)
      window.clearTimeout(guard)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchstart', skip)
      window.removeEventListener('click', skip)
      document.body.style.overflow = ''
    }
  }, [])

  if (gone) return null

  return (
    <div className={`boot${done ? ' done' : ''}`} aria-hidden="true">
      <div className="boot__top">
        <span>مش مصمّم للحظة.</span>
        <span>BRM-001 · SYSTEM ONLINE</span>
        <span>مصمّم للي بعدها.</span>
      </div>

      <div className="boot__body">
        <div className="boot__col">
          <div className="boot__stat"><b>الهوية</b><i>{String(stats[0]).padStart(3, '0')}%</i></div>
          <div className="boot__stat"><b>التشغيل</b><i>{String(stats[1]).padStart(3, '0')}%</i></div>
          <div className="boot__stat"><b>البناء الرقمي</b><i>{String(stats[2]).padStart(3, '0')}%</i></div>
        </div>

        <div className="boot__core">
          <div className="boot__ring" />
          <div className="boot__ring boot__ring--d" />
          <div className="boot__disc">
            <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
              <g fill="#fbe23d" opacity="0.85">
                <circle cx="100" cy="44" r="2.6" /><circle cx="130" cy="52" r="3.4" /><circle cx="150" cy="82" r="2.2" />
                <circle cx="152" cy="118" r="3" /><circle cx="128" cy="148" r="2.4" /><circle cx="98" cy="158" r="3.2" />
                <circle cx="66" cy="146" r="2.3" /><circle cx="48" cy="116" r="3.1" /><circle cx="52" cy="80" r="2.2" />
                <circle cx="76" cy="54" r="3.5" /><circle cx="108" cy="86" r="2.4" /><circle cx="86" cy="112" r="2.8" />
              </g>
              <g stroke="rgba(255,255,255,.16)" strokeWidth=".8" fill="none">
                <path d="M100 44 L130 52 L150 82 L152 118 L128 148 L98 158 L66 146 L48 116 L52 80 L76 54 Z" />
                <path d="M100 44 L108 86 L86 112 L76 54" /><path d="M130 52 L108 86 L98 158" />
                <path d="M150 82 L108 86 L128 148" /><path d="M152 118 L86 112 L128 148" />
                <path d="M48 116 L86 112 L66 146" />
              </g>
            </svg>
          </div>
          <div className="boot__tags">
            <span className="boot__tag boot__tag--a">BUILD_ID // BRM-001<i /></span>
            <span className="boot__tag boot__tag--b"><i />SYSTEM // BRAIN MEDIA</span>
            <span className="boot__tag boot__tag--c">PROTOCOL // BRAND<i /></span>
            <span className="boot__tag boot__tag--d"><i />STATUS // INITIALIZING</span>
          </div>
          <span className="boot__dash boot__dash--l" />
          <span className="boot__dash boot__dash--r" />
        </div>

        <div className="boot__col boot__col--r">
          <div className="boot__stat" style={{ textAlign: 'left' }}><b>Identity</b><i>{String(stats[3]).padStart(3, '0')}%</i></div>
          <div className="boot__stat" style={{ textAlign: 'left' }}><b>Operations</b><i>{String(stats[4]).padStart(3, '0')}%</i></div>
          <div className="boot__stat" style={{ textAlign: 'left' }}><b>Digital</b><i>{String(stats[5]).padStart(3, '0')}%</i></div>
        </div>
      </div>

      <div className="boot__pct">{String(percent).padStart(3, '0')}%</div>
      <div className="boot__hatch" />
      <div className="boot__bar" />
    </div>
  )
}
