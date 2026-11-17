import type { CSSProperties } from 'react'

interface SectionIntroProps {
  label: string
  title: string
  body?: string | string[]
  size?: 'lg' | 'xl'
}

export function SectionIntro({ label, title, body, size = 'lg' }: SectionIntroProps) {
  const heading = size === 'xl' ? 'h-xl' : 'h-lg'
  const paragraphs = Array.isArray(body) ? body : body ? [body] : []

  return (
    <div className="split">
      <div className="rv">
        <span className="label">{label}</span>
        <h2 className={heading} style={{ marginTop: 16 }}>
          {title.split('\n').map((line, index) => (
            <span key={index}>
              {index > 0 && <br />}
              {line}
            </span>
          ))}
        </h2>
      </div>

      {paragraphs.length > 0 && (
        <div className="right rv" style={{ '--d': 120 } as CSSProperties}>
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  )
}
