import { describe, expect, it } from "vitest";
import { formatBusinessStage } from "./business-stage";

describe("formatBusinessStage", () => {
  it("returns the Korean label", () => {
    expect(formatBusinessStage("mvp_prep", null)).toBe("MVP 준비");
  });

  it("appends the free-text value for 'other'", () => {
    expect(formatBusinessStage("other", "프랜차이즈 전환")).toBe("기타 (프랜차이즈 전환)");
  });

  it("falls back to the bare label when 'other' has no text", () => {
    expect(formatBusinessStage("other", null)).toBe("기타");
  });
});
