import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ar, en } from '@/content/sections'
import { AssemblySection } from '@/features/studio-webgl/AssemblySection'
import { isLocale } from '@/lib/i18n/config'

export const metadata: Metadata = {
  title: 'Studio — ASSEMBLY preview',
  robots: { index: false, follow: false },
}

type AssemblyPreviewPageProps = { params: Promise<{ lang: string }> }

export default async function AssemblyPreviewPage({ params }: AssemblyPreviewPageProps) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const content = lang === 'ar' ? ar : en

  return (
    <main>
      <AssemblySection data={content.studio} />

      <div className="mx-auto flex w-full max-w-[var(--maxw)] items-center justify-between gap-4 px-[var(--pad)] py-8 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-2)]">
        <span>ASSEMBLY — WEBGL DEMO · BRM-001</span>
        <Link href={`/${lang}/preview`} className="transition-colors hover:text-[var(--txt)]">
          ← {lang === 'ar' ? 'باقي المعاينات' : 'Other previews'}
        </Link>
      </div>
    </main>
  )
}
