import { describe, expect, it } from "vitest";
import { LOCALES, resolveLocale } from "./locales";

describe("resolveLocale", () => {
  it("prefers a supported cookie over everything else", () => {
    expect(
      resolveLocale({ cookie: "ja", acceptLanguage: "en-US,en;q=0.9", country: "KR" })
    ).toBe("ja");
  });

  it("ignores an unsupported cookie", () => {
    expect(resolveLocale({ cookie: "fr", acceptLanguage: "en-US", country: null })).toBe("en");
  });

  it("takes the first supported browser language in q order", () => {
    expect(resolveLocale({ cookie: null, acceptLanguage: "fr,en;q=0.8", country: null })).toBe("en");
    expect(
      resolveLocale({ cookie: null, acceptLanguage: "de;q=0.9,ja;q=0.7", country: null })
    ).toBe("ja");
  });

  it("treats a malformed q as the RFC default of 1, not NaN", () => {
    // "en" has a malformed q (should default to 1); "ja" has an explicit,
    // valid, lower q. "en" must still win rather than sort order becoming
    // undefined behaviour from a NaN comparison.
    expect(
      resolveLocale({ cookie: null, acceptLanguage: "en;q=abc,ja;q=0.9", country: null })
    ).toBe("en");
  });

  it("maps Chinese variants", () => {
    const zh = (tag: string) =>
      resolveLocale({ cookie: null, acceptLanguage: tag, country: null });

    expect(zh("zh")).toBe("zh-CN");
    expect(zh("zh-CN")).toBe("zh-CN");
    expect(zh("zh-SG")).toBe("zh-CN");
    expect(zh("zh-Hans-CN")).toBe("zh-CN");
    expect(zh("zh-TW")).toBe("zh-TW");
    expect(zh("zh-HK")).toBe("zh-TW");
    expect(zh("zh-MO")).toBe("zh-TW");
    expect(zh("zh-Hant-TW")).toBe("zh-TW");
  });

  it("matches on the primary subtag", () => {
    expect(resolveLocale({ cookie: null, acceptLanguage: "en-GB", country: null })).toBe("en");
    expect(resolveLocale({ cookie: null, acceptLanguage: "ja-JP", country: null })).toBe("ja");
    expect(resolveLocale({ cookie: null, acceptLanguage: "ko-KR", country: null })).toBe("ko");
  });

  it("falls back to the visitor's country when no language matches", () => {
    const byCountry = (country: string) =>
      resolveLocale({ cookie: null, acceptLanguage: "fr", country });

    expect(byCountry("KR")).toBe("ko");
    expect(byCountry("JP")).toBe("ja");
    expect(byCountry("CN")).toBe("zh-CN");
    expect(byCountry("SG")).toBe("zh-CN");
    expect(byCountry("TW")).toBe("zh-TW");
    expect(byCountry("HK")).toBe("zh-TW");
    expect(byCountry("MO")).toBe("zh-TW");
    expect(byCountry("DE")).toBe("en");
  });

  it("falls back to Korean when nothing is known (search crawlers)", () => {
    expect(resolveLocale({ cookie: null, acceptLanguage: null, country: null })).toBe("ko");
    expect(resolveLocale({ cookie: null, acceptLanguage: "", country: null })).toBe("ko");
  });

  it("supports exactly the five planned locales", () => {
    expect(LOCALES).toEqual(["ko", "en", "zh-CN", "zh-TW", "ja"]);
  });
});
