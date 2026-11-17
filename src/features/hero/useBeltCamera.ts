'use client'

import { useEffect, useRef, type RefObject } from 'react'

interface BeltCameraOptions {
  containerRef: RefObject<HTMLDivElement | null>
  cardsRef: RefObject<Array<HTMLAnchorElement | null>>
  active: number
  enabled: boolean
  reduced: boolean
  count: number
}

/**
 * 3D "camera" for the hero belt.
 * The belt always stops on the active card; pointer position adds parallax.
 * All writes are imperative (transform/opacity/z-index) — no React re-render per frame.
 */
export function useBeltCamera({ containerRef, cardsRef, active, enabled, reduced, count }: BeltCameraOptions) {
  const pos = useRef(0)
  const target = useRef(active)
  const pointer = useRef(0)
  const pointerSmooth = useRef(0)

  useEffect(() => {
    target.current = active

    while (target.current - pos.current > count / 2) target.current -= count
    while (target.current - pos.current < -count / 2) target.current += count
  }, [active, count])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointer.current = (event.clientX / window.innerWidth - 0.5) * 2
    }

    container.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => container.removeEventListener('pointermove', onPointerMove)
  }, [containerRef])

  useEffect(() => {
    if (!enabled) return

    let raf = 0

    const frame = (time: number) => {
      const container = containerRef.current
      const cards = cardsRef.current
      const width = container?.clientWidth ?? 0

      if (width) {
        const gap = Math.min(Math.max(width * 0.185, 232), 286)
        const ease = reduced ? 1 : 0.085

        pos.current += (target.current - pos.current) * ease
        if (Math.abs(target.current - pos.current) < 0.0015) pos.current = target.current

        pointerSmooth.current += (pointer.current - pointerSmooth.current) * 0.06
        const breathe = reduced ? 0 : Math.sin(time * 0.0005) * 3

        for (let i = 0; i < count; i += 1) {
          const card = cards[i]
          if (!card) continue

          let offset = i - pos.current
          offset = ((offset % count) + count) % count
          if (offset > count / 2) offset -= count

          const depth = Math.min(1, Math.abs(offset))
          const x = offset * gap + pointerSmooth.current * 16 + breathe
          const z = -depth * 235 + (1 - depth) * 95
          const scale = 1 + (1 - depth) * 0.1
          const rotateY = offset * -8 + pointerSmooth.current * -3
          const y = Math.sin(i * 1.05 + time * 0.0006) * 4

          card.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(3)})`
          card.style.zIndex = String(1000 - Math.round(depth * 400))
          card.style.opacity = String(Math.max(0.26, 1 - depth * 0.7))
          card.style.setProperty('--cb', `${(depth * 2.4).toFixed(2)}px`)
        }
      }

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [cardsRef, containerRef, count, enabled, reduced])
}
