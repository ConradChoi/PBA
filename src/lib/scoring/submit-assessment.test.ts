import { describe, expect, it } from "vitest";
import type { SubmitAssessmentInput } from "./submit-assessment";
import { computeAssessmentResult } from "./submit-assessment";
import { submitAssessmentSchema } from "./submit-assessment.schema";

function allOnesInput(): SubmitAssessmentInput {
  return {
    basicInfo: {
      name: "테스트 사용자",
      email: "test@example.com",
      businessStage: "idea",
    },
    answers: {
      value: [1, 1, 1, 1],
      customer: [1, 1, 1, 1],
      offer: [1, 1, 1, 1],
      experience: [1, 1, 1, 1],
      process: [1, 1, 1, 1],
      data: [1, 1, 1, 1],
      scale: [1, 1, 1, 1],
    },
    marketingConsent: false,
  };
}

describe("computeAssessmentResult", () => {
  it("spec section 26 Case 1: all 1s -> total 28, IDEA_STAGE", () => {
    const result = computeAssessmentResult(allOnesInput());

    expect(result.totalRaw).toBe(28);
    expect(result.architectureLevel).toBe("IDEA_STAGE");
    expect(result.row.total_raw).toBe(28);
    expect(result.row.architecture_level).toBe("IDEA_STAGE");
    expect(result.row.score_value_raw).toBe(4);
    expect(result.row.score_value_100).toBe(0);
    expect(result.row.name).toBe("테스트 사용자");
    expect(result.row.business_stage).toBe("idea");
    expect(result.row.consulting_cta_clicked).toBe(false);
    expect(result.row.consulting_requested).toBe(false);
  });

  it("carries optional basic info fields through as null when omitted", () => {
    const result = computeAssessmentResult(allOnesInput());

    expect(result.row.company_name).toBeNull();
    expect(result.row.role).toBeNull();
    expect(result.row.industry).toBeNull();
    expect(result.row.team_size).toBeNull();
    expect(result.row.utm_source).toBeNull();
  });
});

describe("submitAssessmentSchema", () => {
  it("accepts a valid payload", () => {
    const parsed = submitAssessmentSchema.safeParse(allOnesInput());
    expect(parsed.success).toBe(true);
  });

  it("rejects an answer outside the 1-5 range", () => {
    const invalid = allOnesInput();
    invalid.answers.value = [6, 1, 1, 1];

    const parsed = submitAssessmentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const invalid = allOnesInput();
    invalid.basicInfo.email = "not-an-email";

    const parsed = submitAssessmentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});
