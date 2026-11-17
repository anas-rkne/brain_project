'use client'

import type { CSSProperties } from 'react'

import type { SectionsContent } from '@/content/sections'
import type { PreviewCopy } from './preview-copy'
import { useProgressVar } from './hooks'
import styles from './manifesto.module.css'

interface VariantManifestoProps {
  data: SectionsContent['studio']
  copy: PreviewCopy
}

export function VariantManifesto({ data, copy }: VariantManifestoProps) {
  const ref = useProgressVar<HTMLElement>(0.94, 0.42)

  const lines = data.title
    .split('\n')
    .map((line) => line.trim().split(/\s+/).filter(Boolean))
  const total = lines.reduce((count, line) => count + line.length, 0)

  let wordIndex = -1

  return (
    <section className={styles.wrap} ref={ref}>
      <div className={styles.inner}>
        <div className={styles.meta}>
          <span className={styles.label}>{data.label}</span>
          <span className={styles.idx}>BRM / STATEMENT / 04</span>
        </div>

        <h2 className={styles.title} style={{ '--n': total } as CSSProperties}>
          {lines.map((line, lineIdx) => (
            <span className={styles.line} key={lineIdx}>
              {lineIdx > 0 && <br />}
              {line.map((word) => {
                wordIndex += 1
                return (
                  <span className={styles.word} key={`${lineIdx}-${wordIndex}`} style={{ '--i': wordIndex } as CSSProperties}>
                    {word}
                  </span>
                )
              })}
            </span>
          ))}
        </h2>

        <div className={styles.rule} />

        <div className={styles.grid}>
          <div className={styles.prose}>
            {data.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            <span className={styles.sign}>— فريق Brain Media</span>
          </div>

          <ol className={styles.notes}>
            {data.problems.map((problem, index) => (
              <li className={styles.note} key={problem.n} style={{ '--i': index } as CSSProperties}>
                <span className={styles.num}>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{problem.title}</h3>
                  <p>{problem.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.foot}>
          <span>{copy.problemTag} · 04</span>
          <span>↓</span>
          <span>BRM-001</span>
        </div>
      </div>
    </section>
  )
}
