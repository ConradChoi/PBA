import { describe, expect, it } from "vitest";
import { formatDate } from "./format-date";

const AT = "2026-09-23T01:00:00.000Z";

describe("formatDate", () => {
  it("keeps the Korean format for ko", () => {
    // What the public pages used to hardcode, and what /admin still renders.
    expect(formatDate(AT, "ko")).toBe(new Date(AT).toLocaleDateString("ko-KR"));
  });

  it("does not render a Korean-formatted date for a non-Korean locale", () => {
    // The regression this guards: an English visitor saw "2026. 9. 23.".
    for (const locale of ["en", "ja", "zh-CN", "zh-TW"] as const) {
      expect(formatDate(AT, locale)).not.toBe(formatDate(AT, "ko"));
    }
  });

  it("formats en the way Intl does for that locale", () => {
    expect(formatDate(AT, "en")).toBe(new Date(AT).toLocaleDateString("en"));
  });

  it("accepts a Date as well as an ISO string", () => {
    expect(formatDate(new Date(AT), "en")).toBe(formatDate(AT, "en"));
  });
});
