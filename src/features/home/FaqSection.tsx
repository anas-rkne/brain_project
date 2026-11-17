'use client'

import { useState } from 'react'

import type { SectionsContent } from '@/content/sections'
import type { Locale } from '@/lib/i18n/config'

interface FaqSectionProps {
  data: SectionsContent['faq']
  locale: Locale
}

export function FaqSection({ data, locale }: FaqSectionProps) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="sec sec--line" id="insights">
      <div className="shell frame">
        <span className="x x--tl" />
        <span className="x x--tr" />

        <div className="faq">
          <div className="faq__side rv">
            <span className="label">{data.label}</span>
            <h2 className="h-lg">{data.title}</h2>
            <p>{data.body}</p>

            <div className="faq__help">
              <h3>{data.helpTitle}</h3>
              <p>{data.helpBody}</p>
              <div className="faq__btns">
                <a className="btn btn--primary" href={`/${locale}#contact`} style={{ height: 44, paddingInline: 18, fontSize: 13 }}>
                  {data.callCta} <span className="ar">←</span>
                </a>
                <a className="btn btn--ghost" href="https://wa.me/971000000000" style={{ height: 44, paddingInline: 16, fontSize: 13 }}>
                  {data.whatsapp}
                </a>
              </div>
              <a className="faq__mail" href="mailto:hello@brainmedia.ae">
                {data.mail}
              </a>
            </div>
          </div>

          <div className="acc">
            {data.items.map((item, index) => {
              const isOpen = open === index
              return (
                <div className={`acc__item${isOpen ? ' open' : ''}`} key={item.q}>
                  <button
                    className="acc__q"
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${index}`}
                    onClick={() => setOpen(isOpen ? null : index)}
                  >
                    <span>{item.q}</span>
                    <span className="acc__plus" aria-hidden="true" />
                  </button>
                  <div className="acc__a" id={`faq-a-${index}`} role="region" aria-label={item.q}>
                    <div>
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
