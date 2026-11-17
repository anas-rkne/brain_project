'use client'

import type { CSSProperties } from 'react'

import type { SectionsContent } from '@/content/sections'
import type { PreviewCopy } from './preview-copy'
import { useProgressVar } from './hooks'
import styles from './circuit.module.css'

interface VariantCircuitProps {
  data: SectionsContent['studio']
  copy: PreviewCopy
}

const THRESHOLDS = [0.1, 0.3, 0.5, 0.7]

export function VariantCircuit({ data, copy }: VariantCircuitProps) {
  const ref = useProgressVar<HTMLElement>(0.9, 0.3)

  return (
    <section className={styles.wrap} ref={ref}>
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
            <p>{data.body[1]}</p>
            <span className={styles.live}>
              <i aria-hidden="true" />
              SYSTEM DIAGNOSTIC
            </span>
          </div>
        </div>

        <div className={styles.board}>
          <div className={styles.list}>
            <span className={styles.spine} aria-hidden="true">
              <span className={styles.fill} />
              <span className={styles.dot} />
            </span>

            {data.problems.map((problem, index) => (
              <div className={styles.item} key={problem.n} style={{ '--t': THRESHOLDS[index] } as CSSProperties}>
                <span className={styles.node} aria-hidden="true">
                  <span className={styles.nodeIdle} />
                  <span className={styles.nodeOn} />
                  <b className={styles.numIdle}>{index + 1}</b>
                  <b className={styles.numOn}>{index + 1}</b>
                </span>

                <div className={styles.copy}>
                  <div className={styles.copyTop}>
                    <span className={styles.status}>
                      <i className={styles.fail}>{copy.fail}</i>
                      <i className={styles.ok}>{copy.ok}</i>
                    </span>
                    <h3>{problem.title}</h3>
                  </div>
                  <p>{problem.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.result}>
            <span className={styles.resultLabel}>{copy.systemLabel}</span>
            <h3 className={styles.resultTitle}>{copy.systemTitle}</h3>
            <p className={styles.resultNote}>{copy.systemNote}</p>

            <div className={styles.chips}>
              {data.problems.map((problem, index) => (
                <span key={problem.n} className={styles.chip} style={{ '--c': index } as CSSProperties}>
                  {problem.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
