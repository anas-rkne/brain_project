export interface ProjectImage {
  src: string
  alt: string
  width: number
  height: number
}

/**
 * View model used by the marketing site.
 * Mapped from the Payload `projects` collection in `lib/queries/projects.ts`.
 */
export interface Project {
  id: string
  slug: string
  /** Editorial code shown in the UI, e.g. `RM·02`. */
  code: string
  /** Brand / client name, e.g. `RIMTH`. */
  name: string
  /** Scope line, e.g. `BRAND IDENTITY · 2026`. */
  scope: string
  sector?: string
  year?: number
  description?: string
  cover: ProjectImage
  /** Ordered frames used by the hero word-flip and the case card. */
  frames: ProjectImage[]
}
