'use client'

import { useAppStore } from '@/lib/store'
import { translations, type TranslationKey } from '@/lib/i18n'

export function useTranslation() {
  const locale = useAppStore((s) => s.locale)
  const t = (key: TranslationKey) => translations[locale][key]
  return { t, locale, translations: translations[locale] }
}
