'use client'

import { useState } from 'react'

import type { SectionsContent } from '@/content/sections'
import type { PreviewCopy } from './preview-copy'
import styles from './index-rows.module.css'

interface VariantIndexProps {
  data: SectionsContent['studio']
  copy: PreviewCopy
}

export function VariantIndex({ data, copy }: VariantIndexProps) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <span className={styles.label}>{data.label}</span>
            <h2 className={styles.title}>
              {data.title.split('\n').map((line, index) => (
                <span key={line}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>
          </div>

          <div className={styles.aside}>
            <p>{data.body[0]}</p>
            <span className={styles.count}>04 / 04</span>
          </div>
        </div>

        <div className={styles.rows}>
          {data.problems.map((problem, index) => {
            const isOpen = open === index
            const keyword = problem.n.split('—')[1]?.trim() ?? problem.n

            return (
              <div className={styles.row} key={problem.n} data-open={isOpen || undefined}>
                <button
                  type="button"
                  className={styles.trigger}
                  aria-expanded={isOpen}
                  aria-controls={`studio-row-${index}`}
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <span className={styles.num}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.name}>{problem.title}</span>
                  <span className={styles.tag}>{keyword}</span>
                  <span className={styles.plus} aria-hidden="true" />
                </button>

                <div className={styles.panel} id={`studio-row-${index}`} role="region" aria-label={problem.title}>
                  <div className={styles.panelClip}>
                    <div className={styles.panelIn}>
                      <p className={styles.desc}>{problem.desc}</p>
                      <p className={styles.fix}>
                        <span className={styles.fixLabel}>{copy.fixTag}</span>
                        {copy.solutions[index]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
