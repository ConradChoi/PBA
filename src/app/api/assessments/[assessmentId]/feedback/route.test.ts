import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const eqSelect = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq: eqSelect }));
const eqUpdate = vi.fn().mockResolvedValue({ error: null });
const update = vi.fn(() => ({ eq: eqUpdate }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from: () => ({ select, update }) }),
}));

beforeEach(() => {
  maybeSingle.mockReset().mockResolvedValue({ data: { id: "a1" }, error: null });
  update.mockClear();
  eqUpdate.mockClear();
});

const params = { params: Promise.resolve({ assessmentId: "a1" }) };

function patch(body: unknown) {
  return new Request("http://localhost", { method: "PATCH", body: JSON.stringify(body) });
}

describe("PATCH /api/assessments/[assessmentId]/feedback", () => {
  it("stores the rating with a timestamp", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(patch({ resultFit: 4 }), params);

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      result_fit: 4,
      result_fit_at: expect.any(String),
    });
    expect(eqUpdate).toHaveBeenCalledWith("id", "a1");
  });

  it("rejects a rating outside 1-5", async () => {
    const { PATCH } = await import("./route");

    expect((await PATCH(patch({ resultFit: 6 }), params)).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown assessment", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { PATCH } = await import("./route");

    expect((await PATCH(patch({ resultFit: 3 }), params)).status).toBe(404);
  });
});
