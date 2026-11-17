import Image from 'next/image'

import { SectionIntro } from '@/components/shared/SectionIntro'
import type { SectionsContent } from '@/content/sections'

interface WorkSectionProps {
  data: SectionsContent['work']
  locale: string
}

export function WorkSection({ data, locale }: WorkSectionProps) {
  return (
    <section className="sec sec--line" id="work">
      <div className="shell frame">
        <span className="x x--tl" />
        <span className="x x--tr" />

        <SectionIntro label={data.label} title={data.title} body={data.body} size="xl" />

        <div className="cases">
          {data.cases.map((item) => (
            <article className="case rv" key={item.client}>
              <div className="case__txt">
                <h3>{item.title}</h3>
                <div className="tags">
                  {item.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="case__client">
                  <span className={`case__av${item.avClass ? ` case__av${item.avClass}` : ''}`}>{item.av}</span>
                  <div className="case__who">
                    <b>{item.client}</b>
                    <span>{item.who}</span>
                  </div>
                </div>
                <blockquote className="case__quote">
                  {item.quotePlain}
                  <em>{item.quoteEm}</em>
                  {item.quoteRest}
                </blockquote>
              </div>

              <a className="case__media" href={`/${locale}#contact`} aria-label={item.client}>
                <Image src={item.img} alt={item.alt} fill sizes="(max-width: 920px) 100vw, 48vw" />
                <span className="case__go">↗</span>
                <span className="case__badge">{item.badge}</span>
              </a>
            </article>
          ))}
        </div>

        <div className="work__all rv">
          <a className="btn btn--ghost" href={`/${locale}#contact`}>
            {data.all} <span className="ar">↖</span>
          </a>
        </div>
      </div>
    </section>
  )
}
