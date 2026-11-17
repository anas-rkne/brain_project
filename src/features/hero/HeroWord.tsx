'use client'

import Image from 'next/image'

import { cn } from '@/lib/utils/cn'
import type { Project } from '@/types/project'

import styles from './hero.module.css'

interface HeroWordProps {
  text: string
  project?: Project
  active: boolean
  step: number
  small?: boolean
}

/**
 * One word of the headline. On the beat it flips from the glyph to a printed
 * photograph of the matching project (C-1), cycling three frames.
 */
export function HeroWord({ text, project, active, step, small }: HeroWordProps) {
  return (
    <span className={cn(styles.slot, small && styles.slotSmall, active && styles.slotPhoto)}>
      <span className={styles.glyph}>{text}</span>

      {project ? (
        <span aria-hidden className={styles.plate}>
          {project.frames.slice(0, 3).map((frame, index) => (
            <Image
              key={`${frame.src}-${index}`}
              src={frame.src}
              alt=""
              fill
              sizes="(max-width: 1023px) 45vw, 460px"
              className={styles.plateImg}
              data-on={active && index === step}
            />
          ))}
          <span className={styles.plateTag}>{project.code}</span>
        </span>
      ) : null}
    </span>
  )
}
