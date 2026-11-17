'use client'

import { useEffect, useRef } from 'react'

import styles from './giant.module.css'

interface PlateFieldProps {
  powered: boolean
  paused: boolean
  rtl: boolean
}

const VERT = `attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`

/**
 * Halftone dot plate: a lattice of print dots that react to the pointer
 * and "print" themselves from the inline-start edge when the plate powers on.
 * One quad, one pass. Dots only — no blobs, no gradients.
 */
const FRAG = `precision mediump float;

uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uCell;
uniform float uProgress;
uniform float uRtl;
uniform float uHover;

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 g = px / uCell;
  vec2 f = fract(g) - 0.5;
  float m = length(f);

  // pointer lens: dots swell under the cursor
  float lens = smoothstep(250.0, 0.0, distance(px, uPointer)) * uHover;
  float r = 0.078 + lens * 0.17;

  // ink front travelling across the plate
  float x = mix(px.x, uRes.x - px.x, uRtl);
  float front = uProgress * uRes.x;
  float edge = smoothstep(28.0, 0.0, abs(front - x)) * step(0.001, uProgress);
  r += edge * 0.2;

  float printed = step(x, front);
  float gate = mix(0.5, 1.0, printed);
  float mask = 1.0 - smoothstep(r - 0.05, r + 0.02, m);

  float heat = clamp(lens * 0.85 + edge, 0.0, 1.0);
  vec3 ink = vec3(0.953, 0.945, 0.918);
  vec3 hot = vec3(0.984, 0.886, 0.239);
  vec3 col = mix(ink, hot, heat);

  float a = 0.082 * mask * gate * (0.55 + 0.95 * heat);
  gl_FragColor = vec4(col * a, a);
}`

export function PlateField({ powered, paused, rtl }: PlateFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({ powered: false, paused: true })

  useEffect(() => {
    stateRef.current.powered = powered
  }, [powered])

  useEffect(() => {
    stateRef.current.paused = paused
  }, [paused])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.dataset.static = 'true'
      return
    }

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    })

    if (!gl) {
      canvas.dataset.static = 'true'
      return
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) throw new Error('shader')
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || 'shader compile')
      }
      return shader
    }

    let program: WebGLProgram
    try {
      program = gl.createProgram() as WebGLProgram
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT))
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link')
    } catch {
      canvas.dataset.static = 'true'
      return
    }

    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const u = {
      res: gl.getUniformLocation(program, 'uRes'),
      pointer: gl.getUniformLocation(program, 'uPointer'),
      cell: gl.getUniformLocation(program, 'uCell'),
      progress: gl.getUniformLocation(program, 'uProgress'),
      rtl: gl.getUniformLocation(program, 'uRtl'),
      hover: gl.getUniformLocation(program, 'uHover'),
    }

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)
    gl.uniform1f(u.rtl, rtl ? 1 : 0)

    const pointer = { x: 0, y: 0, hover: 0 }
    const target = { x: 0, y: 0, hover: 0 }

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const width = parent.clientWidth
      const height = parent.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(u.res, canvas.width, canvas.height)
      gl.uniform1f(u.cell, 24 * dpr)
    }

    resize()

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / Math.max(1, rect.width)
      const scaleY = canvas.height / Math.max(1, rect.height)
      target.x = (event.clientX - rect.left) * scaleX
      target.y = (rect.bottom - event.clientY) * scaleY
      target.hover = 1
    }

    const onLeave = () => {
      target.hover = 0
    }

    const host = canvas.parentElement
    host?.addEventListener('pointermove', onMove, { passive: true })
    host?.addEventListener('pointerleave', onLeave, { passive: true })

    const observer = new ResizeObserver(resize)
    if (host) observer.observe(host)

    let raf = 0
    let last = 0
    let sweeping = false
    let sweepStart = 0
    let progress = 0

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      if (stateRef.current.paused) return
      if (now - last < 30) return
      last = now

      if (stateRef.current.powered && !sweeping && progress === 0) {
        sweeping = true
        sweepStart = now
      }

      if (sweeping) {
        progress = Math.min(1, (now - sweepStart) / 1500)
        if (progress >= 1) sweeping = false
      }

      pointer.x += (target.x - pointer.x) * 0.16
      pointer.y += (target.y - pointer.y) * 0.16
      pointer.hover += (target.hover - pointer.hover) * 0.12

      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(u.pointer, pointer.x, pointer.y)
      gl.uniform1f(u.progress, progress)
      gl.uniform1f(u.hover, pointer.hover)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      host?.removeEventListener('pointermove', onMove)
      host?.removeEventListener('pointerleave', onLeave)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [rtl])

  return <canvas ref={canvasRef} className={styles.field} aria-hidden="true" />
}
