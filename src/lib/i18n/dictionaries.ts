import ar from '@/dictionaries/ar.json'
import en from '@/dictionaries/en.json'

import type { Locale } from './config'

/** Shape of the Arabic dictionary. English must satisfy the same shape. */
export type Dictionary = typeof ar

const dictionaries: Record<Locale, Dictionary> = { ar, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
