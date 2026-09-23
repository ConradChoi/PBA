import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SubmitAssessmentInput } from "./submit-assessment";

const single = vi.fn();
const select = vi.fn(() => ({ single }));
const insert = vi.fn(() => ({ select }));
const from = vi.fn(() => ({ insert }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

function validInput(): SubmitAssessmentInput {
  return {
    basicInfo: { name: "테스트", email: "test@example.com", businessStage: "idea" },
    answers: {
      value: [1, 1, 1, 1],
      customer: [1, 1, 1, 1],
      offer: [1, 1, 1, 1],
      experience: [1, 1, 1, 1],
      process: [1, 1, 1, 1],
      data: [1, 1, 1, 1],
      scale: [1, 1, 1, 1],
    },
    privacyConsent: true,
    marketingConsent: false,
    locale: "ko",
  };
}

beforeEach(() => {
  single.mockReset();
  select.mockClear();
  insert.mockClear();
  from.mockClear();
});

describe("persistAssessment", () => {
  it("computes scores, inserts the row, and returns ok:true with the new id", async () => {
    single.mockResolvedValueOnce({ data: { id: "test-id" }, error: null });
    const { persistAssessment } = await import("./persist-assessment");

    const result = await persistAssessment(validInput());

    expect(result).toEqual({
      ok: true,
      assessmentId: "test-id",
      architectureLevel: "IDEA_STAGE",
      totalRaw: 28,
      bottlenecks: ["process", "customer", "value"],
      strengths: ["scale", "data"],
    });
    expect(from).toHaveBeenCalledWith("assessments");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ total_raw: 28, privacy_consent: true })
    );
  });

  it("returns ok:false with the error message when the insert fails", async () => {
    single.mockResolvedValueOnce({ data: null, error: { message: "insert failed" } });
    const { persistAssessment } = await import("./persist-assessment");

    const result = await persistAssessment(validInput());

    expect(result).toEqual({ ok: false, error: "insert failed" });
  });
});
