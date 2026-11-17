import type { CSSProperties } from 'react'

import { SectionIntro } from '@/components/shared/SectionIntro'
import type { SectionsContent } from '@/content/sections'

interface ServicesSectionProps {
  data: SectionsContent['services']
  locale: string
}

export function ServicesSection({ data, locale }: ServicesSectionProps) {
  return (
    <section className="sec" id="services">
      <div className="shell frame">
        <SectionIntro label={data.label} title={data.title} body={data.body} />

        <div className="svc">
          {data.rows.map((row, index) => (
            <a className="srow rv" href={`/${locale}#contact`} key={row.n} style={{ '--d': index * 70 } as CSSProperties}>
              <span className="srow__n">{row.n}</span>
              <div>
                <h3>{row.title}</h3>
                <p>{row.desc}</p>
              </div>
              <span className="srow__ar">↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
