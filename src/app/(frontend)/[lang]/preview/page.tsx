import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ar, en } from '@/content/sections'
import { StudioPreview } from '@/features/studio-preview/StudioPreview'
import { isLocale } from '@/lib/i18n/config'

export const metadata: Metadata = {
  title: 'Studio section previews',
  robots: { index: false, follow: false },
}

type PreviewPageProps = { params: Promise<{ lang: string }> }

export default async function StudioPreviewPage({ params }: PreviewPageProps) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const content = lang === 'ar' ? ar : en

  return <StudioPreview locale={lang} data={content.studio} />
}
