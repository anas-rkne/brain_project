import Image from 'next/image'
import type { CSSProperties } from 'react'

import { SectionIntro } from '@/components/shared/SectionIntro'
import type { SectionsContent } from '@/content/sections'

interface SpecialtiesSectionProps {
  data: SectionsContent['specialties']
}

export function SpecialtiesSection({ data }: SpecialtiesSectionProps) {
  return (
    <section className="sec sec--line">
      <div className="shell frame">
        <SectionIntro label={data.label} title={data.title} body={data.body} />

        <div className="inds">
          {data.items.map((item, index) => (
            <article className="ind rv" key={item.num} style={{ '--d': index * 80 } as CSSProperties}>
              <Image src={item.img} alt="" fill sizes="(max-width: 1100px) 50vw, 25vw" className="ind__bg" />
              <span className="ind__num">{item.num}</span>
              <div className="ind__body">
                <span className="pill pill--sm">{item.pill}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
