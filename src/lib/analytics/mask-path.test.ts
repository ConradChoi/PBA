import { describe, expect, it } from "vitest";
import { maskAnalyticsPath, MASK_RULES_JS } from "./mask-path";

describe("maskAnalyticsPath", () => {
  it("masks the assessment id on a result page", () => {
    expect(
      maskAnalyticsPath("/diagnose/result/8f9fef0b-7a8d-4336-9d06-b7de6c881e3d")
    ).toBe("/diagnose/result/:id");
  });

  it("masks the assessment id on a consult page", () => {
    expect(
      maskAnalyticsPath("/diagnose/result/8f9fef0b-7a8d-4336-9d06-b7de6c881e3d/consult")
    ).toBe("/diagnose/result/:id/consult");
  });

  it("masks the draft id while answering questions", () => {
    expect(maskAnalyticsPath("/diagnose/9d7bd91d-0675-401c-b65a-e930c1399573")).toBe(
      "/diagnose/:draftId"
    );
  });

  it("masks the assessment id on the admin assessment detail page", () => {
    expect(
      maskAnalyticsPath("/admin/assessments/8f9fef0b-7a8d-4336-9d06-b7de6c881e3d")
    ).toBe("/admin/assessments/:id");
  });

  it("masks the id on the admin consulting request detail page", () => {
    expect(
      maskAnalyticsPath(
        "/admin/consulting-requests/8f9fef0b-7a8d-4336-9d06-b7de6c881e3d"
      )
    ).toBe("/admin/consulting-requests/:id");
  });

  it("leaves paths without an id untouched", () => {
    expect(maskAnalyticsPath("/diagnose")).toBe("/diagnose");
    expect(maskAnalyticsPath("/privacy")).toBe("/privacy");
    expect(maskAnalyticsPath("/admin/assessments")).toBe("/admin/assessments");
  });
});

describe("MASK_RULES_JS", () => {
  it("serializes every rule for the inline gtag snippet", () => {
    const rules = JSON.parse(MASK_RULES_JS) as [string, string][];

    expect(rules).toHaveLength(4);
    expect(rules.map(([, replacement]) => replacement)).toEqual([
      "/diagnose/result/:id",
      "/diagnose/:draftId",
      "/admin/assessments/:id",
      "/admin/consulting-requests/:id",
    ]);
  });

  it("masks paths identically to maskAnalyticsPath when reconstructed the way the inline gtag snippet does", () => {
    const rules = JSON.parse(MASK_RULES_JS) as [string, string][];

    const applyRules = (path: string) =>
      rules.reduce(
        (masked, [source, replacement]) =>
          masked.replace(new RegExp(source), replacement),
        path
      );

    const paths = [
      "/diagnose/result/8f9fef0b-7a8d-4336-9d06-b7de6c881e3d",
      "/diagnose/result/8f9fef0b-7a8d-4336-9d06-b7de6c881e3d/consult",
      "/diagnose/9d7bd91d-0675-401c-b65a-e930c1399573",
      "/admin/assessments/8f9fef0b-7a8d-4336-9d06-b7de6c881e3d",
      "/admin/consulting-requests/8f9fef0b-7a8d-4336-9d06-b7de6c881e3d",
    ];

    for (const path of paths) {
      expect(applyRules(path)).toBe(maskAnalyticsPath(path));
    }
  });
});
