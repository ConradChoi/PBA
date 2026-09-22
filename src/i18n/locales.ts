export const LOCALES = ["ko", "en", "zh-CN", "zh-TW", "ja"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ko";

// Shown in the switcher in each language's own name, so a visitor who can't
// read the current language can still find theirs.
export const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ja: "日本語",
};

const COUNTRY_LOCALE: Record<string, Locale> = {
  KR: "ko",
  JP: "ja",
  CN: "zh-CN",
  SG: "zh-CN",
  TW: "zh-TW",
  HK: "zh-TW",
  MO: "zh-TW",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

function matchLanguageTag(tag: string): Locale | null {
  const lower = tag.toLowerCase();

  if (lower.startsWith("zh")) {
    // Script subtag wins; otherwise the region decides. Bare "zh" is
    // Simplified, which is what mainland and Singapore browsers send.
    if (lower.includes("hant") || /\b(tw|hk|mo)\b/.test(lower)) {
      return "zh-TW";
    }
    return "zh-CN";
  }

  const primary = lower.split("-")[0];
  return isLocale(primary) ? primary : null;
}

export function resolveLocale({
  cookie,
  acceptLanguage,
  country,
}: {
  cookie: string | null;
  acceptLanguage: string | null;
  country: string | null;
}): Locale {
  // 1. What the visitor chose in the switcher.
  if (isLocale(cookie)) {
    return cookie;
  }

  // 2. What their browser asks for, in q order.
  if (acceptLanguage) {
    const tags = acceptLanguage
      .split(",")
      .map((part) => {
        const [tag, ...params] = part.trim().split(";");
        const q = params
          .map((param) => param.trim())
          .find((param) => param.startsWith("q="));
        // RFC default is 1 when absent; a malformed value (e.g. "q=abc")
        // shouldn't reorder anything either, so it also falls back to 1.
        const parsedQ = q ? Number(q.slice(2)) : 1;
        return { tag, q: Number.isFinite(parsedQ) ? parsedQ : 1 };
      })
      .filter((entry) => entry.tag.length > 0)
      .sort((a, b) => b.q - a.q);

    for (const { tag } of tags) {
      const match = matchLanguageTag(tag);
      if (match) {
        return match;
      }
    }
  }

  // 3. Where they are, if CloudFront told us.
  if (country) {
    return COUNTRY_LOCALE[country.toUpperCase()] ?? "en";
  }

  // 4. Nothing to go on — including search crawlers, which keeps Korean
  //    indexed.
  return DEFAULT_LOCALE;
}
