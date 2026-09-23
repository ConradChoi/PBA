import { LOCALE_LABELS, isLocale } from "@/i18n/locales";

// Admin is Korean-only and reads the raw `locale` column (a DB-checked
// string, not the typed `Locale`) straight off the assessment/draft row --
// render its own-language name with the code alongside, e.g. "日本語 (ja)".
export function formatLocaleLabel(locale: string): string {
  return isLocale(locale) ? `${LOCALE_LABELS[locale]} (${locale})` : locale;
}
