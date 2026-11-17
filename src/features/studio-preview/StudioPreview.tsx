'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { SectionsContent } from '@/content/sections'
import type { Locale } from '@/lib/i18n/config'
import { previewCopy } from './preview-copy'
import { VariantCircuit } from './VariantCircuit'
import { VariantFlip } from './VariantFlip'
import { VariantIndex } from './VariantIndex'
import { VariantManifesto } from './VariantManifesto'
import styles from './shell.module.css'

interface StudioPreviewProps {
  locale: Locale
  data: SectionsContent['studio']
}

const OPTIONS = 4

export function StudioPreview({ locale, data }: StudioPreviewProps) {
  const copy = previewCopy[locale === 'ar' ? 'ar' : 'en']
  const [active, setActive] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [active])

  const variant =
    active === 0 ? (
      <VariantManifesto data={data} copy={copy} />
    ) : active === 1 ? (
      <VariantIndex data={data} copy={copy} />
    ) : active === 2 ? (
      <VariantCircuit data={data} copy={copy} />
    ) : (
      <VariantFlip data={data} copy={copy} />
    )

  return (
    <div className={styles.shell}>
      <div className={styles.barWrap}>
        <div className={styles.bar}>
          <span className={styles.barLabel}>{copy.kicker}</span>

          <div className={styles.tabs} role="tablist" aria-label={copy.tabsAria}>
            {copy.tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active === index}
                data-active={active === index || undefined}
                className={styles.tab}
                onClick={() => setActive(index)}
              >
                <span className={styles.tabNum}>{String(index + 1).padStart(2, '0')}</span>
                {tab}
              </button>
            ))}
          </div>

          <Link href={`/${locale}`} className={styles.back}>
            {copy.back}
          </Link>
        </div>
      </div>

      <div className={styles.head}>
        <div className={styles.headInner}>
          <span className={styles.headNum}>{String(active + 1).padStart(2, '0')} / 04</span>
          <p className={styles.headNote}>{copy.notes[active]}</p>
        </div>
      </div>

      <div className={styles.stage} key={active}>
        {variant}
      </div>

      <div className={styles.end}>
        <span>
          — {copy.end} · {String(active + 1).padStart(2, '0')}/{OPTIONS}
        </span>
        <span>BRAIN MEDIA · BRM-001</span>
      </div>
    </div>
  )
}
