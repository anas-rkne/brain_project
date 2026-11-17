/**
 * Copy used only by the Studio section previews (/[lang]/preview).
 * Kept out of `sections.ts` so the production content type stays untouched.
 */
export interface PreviewCopy {
  tabs: readonly [string, string, string, string]
  tabsAria: string
  kicker: string
  notes: readonly [string, string, string, string]
  back: string
  problemTag: string
  fixTag: string
  fail: string
  ok: string
  systemLabel: string
  systemTitle: string
  systemNote: string
  flipHint: string
  counter: string
  solutions: readonly [string, string, string, string]
  end: string
}

export const previewCopy: Record<'ar' | 'en', PreviewCopy> = {
  ar: {
    tabs: ['مانيفستو', 'فهرس', 'نظام مكسور', 'قبل / بعد'],
    tabsAria: 'اختيار معاينة قسم الفكرة',
    kicker: 'معاينة القسم — الخيار',
    notes: [
      'البيان الكبير يتلوّن كلمة كلمة مع السكرول، والمشاكل الأربعة تتحوّل لحاشية تحريرية بدل كروت.',
      'كل مشكلة صف بعرض الشاشة؛ يفتح على الهوفر أو الضغط ويكشف الحل — بلا أيقونات وبلا صناديق.',
      'خط نظام واحد: نبضة صفراء تنزل مع السكرول، وكل نود بتنقلب من FAIL لـOK لحد ما يصير نظام.',
      'ستيكنغ على البيان + أربع بطاقات تنقلب 3D من المشكلة للحل، وعدّاد بيكمّل لما تقلب الأربعة.',
    ],
    back: 'رجوع للموقع',
    problemTag: 'المشكلة',
    fixTag: 'الحل',
    fail: 'FAIL',
    ok: 'OK',
    systemLabel: 'SYSTEM ONLINE',
    systemTitle: 'نظام واحد.',
    systemNote: 'أربع وحدات، إيقاع واحد — هوية، تشغيل، رقمي، وصوت.',
    flipHint: 'اضغط على البطاقة لتشوف الحل',
    counter: 'مقلوبة',
    solutions: [
      'نظام واحد: شعار، لون، خط، وتطبيقات — كلها من نفس القاعدة، وبراند بوك بيمشي عليه أي فريق.',
      'تقويم شهري وإيقاع محتوى ثابت — البراند حاضر كل يوم، بلا ما حدا يلحق وراه.',
      'موقع مبني على قمع واحد: يشرح، يبني ثقة، ويحوّل الزائر لعميل — وبتقدر تقيسه.',
      'لهجة واضحة ونبرة واحدة من أول سطر لآخر منشور — صوتك بينعرف بلا ما تشوف اللوغو.',
    ],
    end: 'نهاية المعاينة',
  },
  en: {
    tabs: ['Manifesto', 'Index', 'Circuit', 'Before / After'],
    tabsAria: 'Choose a Studio section preview',
    kicker: 'Section preview — option',
    notes: [
      'The statement fills word by word as you scroll; the four problems become editorial footnotes instead of cards.',
      'Each problem is a full-width row that opens on hover or click to reveal the fix — no icons, no boxes.',
      'One system line: a yellow pulse travels with scroll and every node flips from FAIL to OK until it becomes a system.',
      'Sticky statement + four cards that flip 3D from problem to fix, with a counter that completes at four.',
    ],
    back: 'Back to site',
    problemTag: 'Problem',
    fixTag: 'Fix',
    fail: 'FAIL',
    ok: 'OK',
    systemLabel: 'SYSTEM ONLINE',
    systemTitle: 'One system.',
    systemNote: 'Four parts, one rhythm — identity, operations, digital, and voice.',
    flipHint: 'Tap a card to see the fix',
    counter: 'flipped',
    solutions: [
      'One system: logo, colour, type, and applications — all from the same base, with a brand book any team can run.',
      'A monthly calendar and a steady content rhythm — the brand shows up every day without anyone chasing it.',
      'A site built on one funnel: it explains, builds trust, and converts — and you can measure it.',
      'One clear dialect and one tone from first line to last post — your voice is recognisable without the logo.',
    ],
    end: 'End of preview',
  },
}
