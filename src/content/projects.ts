import type { Project } from '@/types/project'

const LADUNE = { width: 900, height: 1112 } as const
const RIMTH = { width: 900, height: 1130 } as const

function frame(name: string, alt: string, size: { width: number; height: number }) {
  return { src: `/assets/${name}`, alt, ...size }
}

/**
 * Temporary seed used until the Payload `projects` collection is populated.
 * TODO(cms): remove once `npm run seed` exists and the CMS has real content.
 */
export const seedProjects: Project[] = [
  {
    id: 'seed-la-dune-brand-book',
    slug: 'la-dune-brand-book',
    code: 'LD·01',
    name: 'LĀ DUNE',
    scope: 'BRAND BOOK · 2026',
    sector: 'F&B',
    year: 2026,
    description: 'هوية وتغليف لمقهى سعودي — من الاسم للعلبة.',
    cover: frame('la-dune-03.jpg', 'LĀ DUNE — هوية وتغليف', LADUNE),
    frames: [
      frame('la-dune-03.jpg', 'LĀ DUNE — كشك', LADUNE),
      frame('la-dune-07.jpg', 'LĀ DUNE — حملة', LADUNE),
      frame('la-dune-05.jpg', 'LĀ DUNE — تغليف', LADUNE),
    ],
  },
  {
    id: 'seed-rimth-identity',
    slug: 'rimth-identity',
    code: 'RM·02',
    name: 'RIMTH',
    scope: 'BRAND IDENTITY · 2026',
    sector: 'قهوة مختصة',
    year: 2026,
    description: 'هوية عربية معاصرة لعلامة قهوة.',
    cover: frame('proj-b-04.jpg', 'RIMTH — هوية', RIMTH),
    frames: [
      frame('proj-b-04.jpg', 'RIMTH — تغليف', RIMTH),
      frame('proj-b-02.jpg', 'RIMTH — طباعة', RIMTH),
      frame('proj-b-01.jpg', 'RIMTH — هوية عربية', RIMTH),
    ],
  },
  {
    id: 'seed-la-dune-social',
    slug: 'la-dune-social',
    code: 'LD·03',
    name: 'LĀ DUNE',
    scope: 'ONGOING · SOCIAL',
    sector: 'F&B',
    year: 2026,
    description: 'تشغيل المحتوى والقنوات اليومية.',
    cover: frame('la-dune-07.jpg', 'LĀ DUNE — تشغيل ومحتوى', LADUNE),
    frames: [
      frame('la-dune-04.jpg', 'LĀ DUNE — محتوى', LADUNE),
      frame('la-dune-06.jpg', 'LĀ DUNE — حملة', LADUNE),
      frame('la-dune-02.jpg', 'LĀ DUNE — كتاب', LADUNE),
    ],
  },
  {
    id: 'seed-rimth-packaging',
    slug: 'rimth-packaging',
    code: 'RM·04',
    name: 'RIMTH',
    scope: 'PACKAGING · 2026',
    sector: 'قهوة مختصة',
    year: 2026,
    description: 'تغليف وطباعة — من العلبة للكوب.',
    cover: frame('proj-b-02.jpg', 'RIMTH — تغليف', RIMTH),
    frames: [
      frame('proj-b-07.jpg', 'RIMTH — كوب', RIMTH),
      frame('proj-b-05.jpg', 'RIMTH — زجاج', RIMTH),
      frame('proj-b-03.jpg', 'RIMTH — مطبوعات', RIMTH),
    ],
  },
  {
    id: 'seed-la-dune-digital',
    slug: 'la-dune-digital',
    code: 'LD·05',
    name: 'LĀ DUNE',
    scope: 'DIGITAL · 2026',
    sector: 'F&B',
    year: 2026,
    description: 'موقع ومتجر يبيع فعلاً.',
    cover: frame('la-dune-05.jpg', 'LĀ DUNE — رقمي', LADUNE),
    frames: [
      frame('la-dune-05.jpg', 'LĀ DUNE — تغليف', LADUNE),
      frame('la-dune-08.jpg', 'LĀ DUNE — طباعة', LADUNE),
      frame('la-dune-09.jpg', 'LĀ DUNE — كوب', LADUNE),
    ],
  },
]
