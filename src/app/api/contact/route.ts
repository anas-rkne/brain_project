import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let body: Record<string, unknown>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = String(body.name ?? '').trim()
  const mail = String(body.mail ?? '').trim()
  const message = String(body.message ?? '').trim()
  const need = String(body.need ?? '')

  if (!name || !mail || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 422 })
  }

  // TODO(email): wire a real provider (Resend / SES / SMTP) using an env secret.
  // Until then the lead is logged server-side so the flow is testable end-to-end.
  console.info('[contact] new lead', { name, mail, need, message })

  return NextResponse.json({ ok: true })
}
