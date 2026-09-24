import { describe, expect, it } from "vitest";
import ko from "./ko";
import en from "./en";
import ja from "./ja";
import zhCN from "./zh-CN";
import zhTW from "./zh-TW";

// `satisfies Messages` already pins the key structure at compile time, but it
// says nothing about the two things that break the paid-session offer at
// runtime:
//
//   1. The `<b>` markup. `t.rich` throws on an unclosed or unknown tag, so a
//      translation that drops (or renames) a tag turns the result page into a
//      500 for that locale only -- exactly the kind of break nobody notices
//      until a non-Korean visitor hits it.
//   2. The price. It is the whole point of this block: a locale that silently
//      ships the offer without a number would put someone in front of the
//      form still believing the session is free.
const LOCALES = {
  ko,
  en,
  ja,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
} as const;

// Copy that carries mid-sentence emphasis, rendered through `t.rich`.
const RICH_KEYS = ["body", "includes.roadmap"] as const;

function offerString(
  messages: (typeof LOCALES)[keyof typeof LOCALES],
  key: string
): string {
  const value = key
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined,
      messages.result.sessionOffer
    );
  expect(typeof value, `result.sessionOffer.${key} is missing`).toBe("string");
  return value as string;
}

describe("session offer copy", () => {
  for (const [locale, messages] of Object.entries(LOCALES)) {
    describe(locale, () => {
      it("keeps every <b> tag balanced in the rich-text copy", () => {
        for (const key of RICH_KEYS) {
          const value = offerString(messages, key);
          expect(value.match(/<b>/g) ?? [], `result.sessionOffer.${key}`).toHaveLength(1);
          expect(value.match(/<\/b>/g) ?? [], `result.sessionOffer.${key}`).toHaveLength(1);
          expect(value.indexOf("<b>"), `result.sessionOffer.${key}`).toBeLessThan(
            value.indexOf("</b>")
          );
        }
      });

      it("uses no markup outside the rich-text copy", () => {
        for (const key of ["heading", "priceLine", "vatNote", "format", "cta", "ctaNote"]) {
          expect(offerString(messages, key), `result.sessionOffer.${key}`).not.toMatch(/<\/?\w+>/);
        }
      });

      it("names the price and that it excludes VAT", () => {
        // Korean keeps the owner's wording (39만원); every other locale spells
        // the amount out with the ₩ symbol, like the revenue bands do.
        expect(offerString(messages, "priceLine")).toContain(
          locale === "ko" ? "39만원" : "₩390,000"
        );
        expect(offerString(messages, "vatNote").length).toBeGreaterThan(0);
      });
    });
  }
});
