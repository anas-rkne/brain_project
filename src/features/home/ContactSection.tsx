'use client'

import { useState, type CSSProperties, type FormEvent } from 'react'

import type { SectionsContent } from '@/content/sections'
import type { Locale } from '@/lib/i18n/config'

interface ContactSectionProps {
  data: SectionsContent['cta']
  locale: Locale
}

export function ContactSection({ data, locale }: ContactSectionProps) {
  const [name, setName] = useState('')
  const [mail, setMail] = useState('')
  const [message, setMessage] = useState('')
  const [chip, setChip] = useState(0)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('sending')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mail, message, need: data.form.chips[chip] }),
      })
      setStatus(response.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="sec cta" id="contact">
      <div className="shell frame">
        <div className="rv">
          <h2>
            {data.titleA}
            <br />
            <span className="hand">{data.hand}</span>
          </h2>
          <p>{data.body}</p>
        </div>

        <div className="cta__panel rv" style={{ '--d': 100 } as CSSProperties}>
          <form className="cta__form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="f-name">{data.form.name}</label>
              <input id="f-name" type="text" placeholder={data.form.namePh} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="f-mail">{data.form.mail}</label>
              <input id="f-mail" type="text" placeholder={data.form.mailPh} value={mail} onChange={(e) => setMail(e.target.value)} required />
            </div>

            <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: '.14em', color: 'var(--muted-2)', marginBottom: 9 }}>
              {data.form.budget}
            </label>
            <div className="chips">
              {data.form.chips.map((item, index) => (
                <button
                  type="button"
                  className={`chip${index === chip ? ' on' : ''}`}
                  key={item}
                  onClick={() => setChip(index)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="field">
              <label htmlFor="f-msg">{data.form.msg}</label>
              <textarea id="f-msg" rows={3} placeholder={data.form.msgPh} value={message} onChange={(e) => setMessage(e.target.value)} required />
            </div>

            <button className="btn btn--primary cta__send" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? '…' : data.form.send} <span className="ar">←</span>
            </button>

            {status === 'done' && <p style={{ marginTop: 14, color: 'var(--green)', fontSize: 13 }}>وصل طلبك — بنرجعلك خلال ٢٤ ساعة.</p>}
            {status === 'error' && <p style={{ marginTop: 14, color: 'var(--red)', fontSize: 13 }}>في مشكلة بالإرسال — جرّب واتساب أو الإيميل.</p>}
          </form>

          <aside className="cta__side">
            {data.aside.map((row) => (
              <div className="row" key={row.small}>
                <small>{row.small}</small>
                {row.text.includes('@') ? (
                  <a href={`mailto:${row.text}`}>{row.text}</a>
                ) : row.small === "LET'S TALK" ? (
                  <a href={`/${locale}#contact`}>{row.text}</a>
                ) : (
                  <b style={row.green ? { color: 'var(--green)' } : undefined}>{row.text}</b>
                )}
                {row.sub ? <p style={{ marginTop: 6 }}>{row.sub}</p> : null}
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  )
}
