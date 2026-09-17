import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const eqForSelect = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq: eqForSelect }));

const updateSingle = vi.fn();
const updateSelect = vi.fn(() => ({ single: updateSingle }));
const eqForUpdate = vi.fn(() => ({ select: updateSelect }));
const update = vi.fn(() => ({ eq: eqForUpdate }));

const from = vi.fn(() => ({ select, update }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

beforeEach(() => {
  maybeSingle.mockReset();
  updateSingle.mockReset();
  eqForSelect.mockClear();
  select.mockClear();
  eqForUpdate.mockClear();
  updateSelect.mockClear();
  update.mockClear();
  from.mockClear();
});

describe("GET /api/assessment-drafts/[draftId]", () => {
  it("returns the draft's basicInfo/answers/currentStep", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: {
        basic_info: { name: "테스트", email: "test@example.com", businessStage: "idea" },
        answers: { value: [1, 1, 1, 1] },
        current_step: 1,
      },
      error: null,
    });
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ draftId: "draft-id" }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.currentStep).toBe(1);
    expect(json.answers).toEqual({ value: [1, 1, 1, 1] });
    expect(eqForSelect).toHaveBeenCalledWith("id", "draft-id");
  });

  it("returns 404 when the draft doesn't exist", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ draftId: "missing" }),
    });

    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/assessment-drafts/[draftId]", () => {
  it("merges the layer's answers and returns the new currentStep", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: { answers: { value: [1, 1, 1, 1] } },
      error: null,
    });
    updateSingle.mockResolvedValueOnce({
      data: { current_step: 2 },
      error: null,
    });
    const { PATCH } = await import("./route");

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ layerId: "customer", answers: [2, 2, 2, 2] }),
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ draftId: "draft-id" }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.currentStep).toBe(2);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        answers: { value: [1, 1, 1, 1], customer: [2, 2, 2, 2] },
        current_step: 2,
      })
    );
  });

  it("returns 400 for an invalid layerId", async () => {
    const { PATCH } = await import("./route");

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ layerId: "not-a-layer", answers: [1, 1, 1, 1] }),
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ draftId: "draft-id" }),
    });

    expect(response.status).toBe(400);
  });

  it("returns 404 when the draft doesn't exist", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { PATCH } = await import("./route");

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ layerId: "value", answers: [1, 1, 1, 1] }),
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ draftId: "missing" }),
    });

    expect(response.status).toBe(404);
  });
});
