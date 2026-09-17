import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));

const deleteEq = vi.fn().mockResolvedValue({ error: null });
const del = vi.fn(() => ({ eq: deleteEq }));

const from = vi.fn(() => ({ select, delete: del }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

const persistAssessment = vi.fn();
vi.mock("@/lib/scoring/persist-assessment", () => ({
  persistAssessment: (...args: unknown[]) => persistAssessment(...args),
}));

function fullAnswers() {
  return {
    value: [1, 1, 1, 1],
    customer: [1, 1, 1, 1],
    offer: [1, 1, 1, 1],
    experience: [1, 1, 1, 1],
    process: [1, 1, 1, 1],
    data: [1, 1, 1, 1],
    scale: [1, 1, 1, 1],
  };
}

beforeEach(() => {
  maybeSingle.mockReset();
  persistAssessment.mockReset();
  deleteEq.mockClear();
  del.mockClear();
  eq.mockClear();
  select.mockClear();
  from.mockClear();
});

describe("POST /api/assessment-drafts/[draftId]/complete", () => {
  it("persists the assessment, deletes the draft, and returns 201 when all 7 layers are present", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: {
        basic_info: { name: "테스트", email: "test@example.com", businessStage: "idea" },
        answers: fullAnswers(),
        privacy_consent: true,
        marketing_consent: false,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
      },
      error: null,
    });
    persistAssessment.mockResolvedValueOnce({
      ok: true,
      assessmentId: "assessment-id",
      architectureLevel: "IDEA_STAGE",
      totalRaw: 28,
      bottlenecks: ["process", "customer", "value"],
      strengths: ["scale", "data"],
    });
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ draftId: "draft-id" }),
    });
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.assessmentId).toBe("assessment-id");
    expect(persistAssessment).toHaveBeenCalledWith(
      expect.objectContaining({ privacyConsent: true, marketingConsent: false })
    );
    expect(del).toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledWith("id", "draft-id");
  });

  it("returns 400 when fewer than 7 layers are present", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: {
        basic_info: { name: "테스트", email: "test@example.com", businessStage: "idea" },
        answers: { value: [1, 1, 1, 1] },
        privacy_consent: true,
        marketing_consent: false,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
      },
      error: null,
    });
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ draftId: "draft-id" }),
    });

    expect(response.status).toBe(400);
    expect(persistAssessment).not.toHaveBeenCalled();
  });

  it("returns 404 when the draft doesn't exist", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ draftId: "missing" }),
    });

    expect(response.status).toBe(404);
  });
});
