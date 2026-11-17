'use client'

import { useState } from 'react'

import type { SectionsContent } from '@/content/sections'
import type { PreviewCopy } from './preview-copy'
import styles from './flip.module.css'

interface VariantFlipProps {
  data: SectionsContent['studio']
  copy: PreviewCopy
}

export function VariantFlip({ data, copy }: VariantFlipProps) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const complete = flipped.size === data.problems.length
  const [firstLine, ...rest] = data.title.split('\n')

  const toggle = (index: number) => {
    setFlipped((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <section className={styles.wrap} data-complete={complete || undefined}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.side}>
            <span className={styles.label}>{data.label}</span>

            <h2 className={styles.title}>
              {firstLine}
              <br />
              <span className={styles.mark}>{rest.join(' ')}</span>
            </h2>

            <p className={styles.body}>{data.body[1]}</p>

            <div className={styles.counter}>
              <span className={styles.counterNum}>
                {String(flipped.size).padStart(2, '0')} / 04
              </span>
              <span className={styles.counterLabel}>{copy.counter}</span>
            </div>

            <div className={styles.bars} aria-hidden="true">
              {data.problems.map((problem, index) => (
                <span className={styles.bar} key={problem.n} data-on={flipped.has(index) || undefined} />
              ))}
            </div>

            <span className={styles.hint}>
              <i aria-hidden="true" />
              {copy.flipHint}
            </span>
          </div>

          <div className={styles.cells}>
            {data.problems.map((problem, index) => {
              const isFlipped = flipped.has(index)

              return (
                <button
                  type="button"
                  key={problem.n}
                  className={styles.cell}
                  data-flipped={isFlipped || undefined}
                  aria-pressed={isFlipped}
                  aria-label={`${problem.title} — ${copy.solutions[index]}`}
                  onClick={() => toggle(index)}
                >
                  <span className={styles.inner} aria-hidden="true">
                    <span className={`${styles.face} ${styles.front}`}>
                      <span className={styles.faceTop}>
                        <span className={styles.num}>{String(index + 1).padStart(2, '0')}</span>
                        <span className={styles.tag}>{copy.problemTag}</span>
                      </span>
                      <span className={styles.name}>{problem.title}</span>
                    </span>

                    <span className={`${styles.face} ${styles.back}`}>
                      <span className={styles.faceTop}>
                        <span className={styles.num}>{String(index + 1).padStart(2, '0')}</span>
                        <span className={styles.tag}>{copy.fixTag}</span>
                      </span>
                      <span className={styles.sol}>{copy.solutions[index]}</span>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
