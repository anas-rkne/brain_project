import { notFound } from 'next/navigation'

import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { ar, en } from '@/content/sections'
import { HeroSection } from '@/features/hero/HeroSection'
import { ContactSection } from '@/features/home/ContactSection'
import { FaqSection } from '@/features/home/FaqSection'
import { GiantStatement } from '@/features/home/GiantStatement'
import { Marquee } from '@/features/home/Marquee'
import { ProcessSection } from '@/features/home/ProcessSection'
import { ServicesSection } from '@/features/home/ServicesSection'
import { WaysSection } from '@/features/home/WaysSection'
import { DrumSection } from '@/features/specialties-webgl/DrumSection'
import { AssemblySection } from '@/features/studio-webgl/AssemblySection'
import { WorkDossier } from '@/features/work/WorkDossier'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getHomeProjects } from '@/lib/queries/projects'

type HomePageProps = { params: Promise<{ lang: string }> }

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const dict = getDictionary(lang)
  const content = lang === 'ar' ? ar : en
  const projects = await getHomeProjects(lang)

  return (
    <>
      <HeroSection locale={lang} dict={dict} projects={projects} />
      <Marquee words={content.marquee} />
      <AssemblySection data={content.studio} />
      <DrumSection data={content.specialties} />
      <WorkDossier data={content.work} locale={lang} />
      <GiantStatement data={content.giant} locale={lang} />
      <ServicesSection data={content.services} locale={lang} />
      <WaysSection data={content.ways} />
      <ProcessSection data={content.process} />
      <FaqSection data={content.faq} locale={lang} />
      <ContactSection data={content.cta} locale={lang} />
      <ScrollReveal />
    </>
  )
}
