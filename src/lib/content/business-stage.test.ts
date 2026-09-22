import { describe, expect, it } from "vitest";
import { BUSINESS_STAGE_VALUES, formatBusinessStage } from "./business-stage";
import ko from "@/i18n/messages/ko";

describe("BUSINESS_STAGE_VALUES", () => {
  it("has a label in the ko messages for every code", () => {
    for (const stage of BUSINESS_STAGE_VALUES) {
      expect(ko.basicInfo.stages[stage].length).toBeGreaterThan(0);
    }
  });
});

describe("formatBusinessStage", () => {
  it("returns the given label", () => {
    expect(formatBusinessStage(ko.basicInfo.stages.mvp_prep, null, "mvp_prep")).toBe("MVP 준비");
  });

  it("appends the free-text value for 'other'", () => {
    expect(formatBusinessStage(ko.basicInfo.stages.other, "프랜차이즈 전환", "other")).toBe(
      "기타 (프랜차이즈 전환)"
    );
  });

  it("falls back to the bare label when 'other' has no text", () => {
    expect(formatBusinessStage(ko.basicInfo.stages.other, null, "other")).toBe("기타");
  });
});
