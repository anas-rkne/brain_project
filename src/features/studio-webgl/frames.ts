/**
 * Scroll → scene script. One source of truth shared by the WebGL
 * scene and the HUD so the text can never drift from the shards.
 *
 * Five formations: four problems, then the fix.
 *   0 → «هوية»      1 → «تشغيل»      2 → «رقمي»      3 → «صوت»      4 → «الحل»
 */

export const ASSEMBLE_END = 0.14

/** [end of segment, phase to reach]. Segments alternate hold → morph. */
const SEGMENTS: readonly [number, number][] = [
  [0.14, 0], // assembling out of the corner clusters
  [0.3, 0], // hold — identity
  [0.37, 1], // morph
  [0.51, 1], // hold — operations
  [0.58, 2], // morph
  [0.71, 2], // hold — digital
  [0.78, 3], // morph
  [0.88, 3], // hold — voice
  [0.94, 4], // morph into the fix
  [1.01, 4], // hold — the fix
]

export interface Frame {
  /** continuous 0…4, the shader interpolates between formations */
  phase: number
  /** 0…1, scattered → first formation */
  assemble: number
  /** 0…4, which formation is on screen (for copy) */
  chapter: number
  /** true while the shards are holding a finished word */
  landed: boolean
  /** 0…1, overall progress */
  progress: number
}

export function frameAt(progress: number): Frame {
  const p = Math.min(1, Math.max(0, progress))
  const assemble = Math.min(1, p / ASSEMBLE_END)

  let prevEnd = 0
  let prevPhase = 0

  for (const [end, phase] of SEGMENTS) {
    if (p <= end) {
      const local = end <= prevEnd ? 1 : (p - prevEnd) / (end - prevEnd)
      const value = prevPhase + (phase - prevPhase) * local
      /* a segment that doesn't change phase is a hold: the word is
         settled, so the copy is allowed to show the fix. */
      const landed = phase === prevPhase && assemble >= 1
      return { phase: value, assemble, chapter: Math.round(value), landed, progress: p }
    }
    prevEnd = end
    prevPhase = phase
  }

  return { phase: 4, assemble, chapter: 4, landed: true, progress: p }
}
