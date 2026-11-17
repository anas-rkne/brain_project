import Image from 'next/image'
import type { CSSProperties } from 'react'

import { SectionIntro } from '@/components/shared/SectionIntro'
import type { SectionsContent } from '@/content/sections'

interface WaysSectionProps {
  data: SectionsContent['ways']
}

export function WaysSection({ data }: WaysSectionProps) {
  return (
    <section className="sec sec--line">
      <div className="shell frame">
        <SectionIntro label={data.label} title={data.title} body={data.body} />

        <div className="ways-media rv">
          <Image src="/assets/la-dune-08.jpg" alt="" fill sizes="(max-width: 920px) 100vw, 1200px" />
          <span className="ways-media__cap">
            <i aria-hidden /> {data.mediaCap}
          </span>
        </div>

        <div className="ways">
          {data.ways.map((way, index) => (
            <article className="way rv" key={way.n} style={{ '--d': index * 90 } as CSSProperties}>
              <span className="n">{way.n}</span>
              <h3>{way.title}</h3>
              <p>{way.desc}</p>
              <span className="way__meta">{way.meta}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
