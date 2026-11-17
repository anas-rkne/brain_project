import { cacheLife, cacheTag } from 'next/cache'

import { seedProjects } from '@/content/projects'
import { getPayloadClient } from '@/lib/payload'
import type { Locale } from '@/lib/i18n/config'
import type { Project, ProjectImage } from '@/types/project'

interface MediaDoc {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

interface ProjectDoc {
  id: string | number
  slug?: string | null
  title?: string | null
  client?: string | null
  sector?: string | null
  year?: number | null
  description?: string | null
  cover?: MediaDoc | number | null
  gallery?: Array<{ image?: MediaDoc | number | null }> | null
}

function toImage(media: MediaDoc | number | null | undefined, fallbackAlt: string): ProjectImage | null {
  if (!media || typeof media === 'number') return null
  if (!media.url) return null

  return {
    src: media.url,
    alt: media.alt ?? fallbackAlt,
    width: media.width ?? 900,
    height: media.height ?? 1125,
  }
}

function toProject(doc: ProjectDoc, index: number): Project | null {
  const name = doc.client ?? doc.title ?? 'Untitled'
  const cover = toImage(doc.cover, name)
  if (!cover) return null

  const frames = (doc.gallery ?? [])
    .map((item) => toImage(item.image, name))
    .filter((image): image is ProjectImage => image !== null)

  return {
    id: String(doc.id),
    slug: doc.slug ?? String(doc.id),
    // TODO(cms): add a `code` field to the Projects collection; derived for now.
    code: `${name.slice(0, 2).toUpperCase()}·${String(index + 1).padStart(2, '0')}`,
    name,
    scope: [doc.sector, doc.year].filter(Boolean).join(' · '),
    sector: doc.sector ?? undefined,
    year: doc.year ?? undefined,
    description: doc.description ?? undefined,
    cover,
    frames: frames.length ? frames : [cover],
  }
}

/**
 * Home page projects, localized through Payload.
 * Falls back to seed content while the CMS is still empty.
 */
export async function getHomeProjects(locale: Locale): Promise<Project[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('projects', `projects:${locale}`)

  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'projects',
      locale,
      limit: 8,
      depth: 2,
      sort: 'order',
    })

    const projects = (docs as unknown as ProjectDoc[])
      .map(toProject)
      .filter((project): project is Project => project !== null)

    if (projects.length > 0) return projects
  } catch (error) {
    console.warn('[projects] Payload query failed — using seed content.', error)
  }

  return seedProjects
}
