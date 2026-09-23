import type { Locale } from "@/i18n/locales";

// Dates on public pages follow the reader's language: an English visitor
// should see "9/23/2026", not the "2026. 9. 23." that a hardcoded "ko-KR"
// produces. Admin screens format with "ko-KR" directly and stay Korean on
// purpose (project convention), so they don't go through here.
//
// This deliberately uses toLocaleDateString rather than next-intl's
// formatter: no global `timeZone` is configured for next-intl, so its
// formatter would warn and fall back to the server zone anyway. Keeping the
// platform call means the only thing this change alters is the locale tag.
export function formatDate(value: string | Date, locale: Locale): string {
  return new Date(value).toLocaleDateString(locale);
}
