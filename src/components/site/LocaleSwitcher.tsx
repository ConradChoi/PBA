"use client";

import { useRouter } from "next/navigation";
import { Dropdown } from "@/components/ui/Dropdown";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/locales";

export function LocaleSwitcher({ locale, ariaLabel }: { locale: Locale; ariaLabel: string }) {
  const router = useRouter();

  function choose(next: Locale) {
    // A year is long enough that a returning visitor keeps their choice, and
    // the cookie is the first thing resolveLocale looks at.
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <Dropdown
      ariaLabel={ariaLabel}
      label={`🌐 ${LOCALE_LABELS[locale]}`}
      items={LOCALES.map((value) => ({
        key: value,
        label: LOCALE_LABELS[value],
        selected: value === locale,
        onSelect: () => choose(value),
      }))}
    />
  );
}
