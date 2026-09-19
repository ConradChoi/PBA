import { describe, expect, it } from "vitest";
import type { SubmitAssessmentInput } from "./submit-assessment";
import { computeAssessmentResult } from "./submit-assessment";
import { draftBasicInfoSchema, submitAssessmentSchema } from "./submit-assessment.schema";
import { PRIVACY_NOTICE_VERSION } from "../content/privacy-notice";

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
    privacyConsent: true,
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
    expect(result.row.business_stage_other).toBeNull();
    expect(result.row.industry).toBeNull();
    expect(result.row.team_size).toBeNull();
    expect(result.row.utm_source).toBeNull();
  });

  it("carries business_stage_other through when business stage is 'other'", () => {
    const input = allOnesInput();
    input.basicInfo.businessStage = "other";
    input.basicInfo.businessStageOther = "프랜차이즈 가맹 준비";

    const result = computeAssessmentResult(input);

    expect(result.row.business_stage).toBe("other");
    expect(result.row.business_stage_other).toBe("프랜차이즈 가맹 준비");
  });

  it("stamps privacy consent fields on every result", () => {
    const result = computeAssessmentResult(allOnesInput());

    expect(result.row.privacy_consent).toBe(true);
    expect(result.row.privacy_notice_version).toBe(PRIVACY_NOTICE_VERSION);
    expect(new Date(result.row.privacy_consent_at!).toString()).not.toBe(
      "Invalid Date"
    );
  });

  it("stores an anonymous diagnosis without personal fields or a consent time", () => {
    const input = allOnesInput();
    input.privacyConsent = false;
    input.basicInfo = { businessStage: "idea" };

    const result = computeAssessmentResult(input);

    expect(result.row.name).toBeNull();
    expect(result.row.email).toBeNull();
    expect(result.row.privacy_consent).toBe(false);
    expect(result.row.privacy_consent_at).toBeNull();
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

  it("rejects business stage 'other' without businessStageOther", () => {
    const invalid = allOnesInput();
    invalid.basicInfo.businessStage = "other";

    const parsed = submitAssessmentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("accepts business stage 'other' with businessStageOther provided", () => {
    const valid = allOnesInput();
    valid.basicInfo.businessStage = "other";
    valid.basicInfo.businessStageOther = "프랜차이즈 가맹 준비";

    const parsed = submitAssessmentSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});

describe("anonymous diagnosis consent rules", () => {
  it("requires name and email when privacy consent is given", () => {
    const invalid = allOnesInput();
    invalid.basicInfo = { businessStage: "idea" };

    const parsed = submitAssessmentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("accepts a diagnosis without consent, name, or email", () => {
    const anonymous = allOnesInput();
    anonymous.privacyConsent = false;
    anonymous.basicInfo = { businessStage: "idea", industry: "교육" };

    const parsed = submitAssessmentSchema.safeParse(anonymous);
    expect(parsed.success).toBe(true);
  });

  it("drops personal fields and marketing consent sent without privacy consent", () => {
    const parsed = draftBasicInfoSchema.parse({
      basicInfo: {
        name: "보내면 안 되는 이름",
        email: "leak@example.com",
        companyName: "회사",
        role: "대표",
        businessStage: "idea",
        industry: "교육",
      },
      privacyConsent: false,
      marketingConsent: true,
    });

    expect(parsed.basicInfo).toEqual({ businessStage: "idea", industry: "교육" });
    expect(parsed.marketingConsent).toBe(false);
  });
});
