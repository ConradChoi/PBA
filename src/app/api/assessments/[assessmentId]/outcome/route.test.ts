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
  maybeSingle.mockReset().mockResolvedValue({ data: { id: "a1", outcome_at: null }, error: null });
  update.mockClear();
  eqUpdate.mockClear();
});

const params = { params: Promise.resolve({ assessmentId: "a1" }) };

function patch(body: unknown) {
  return new Request("http://localhost", { method: "PATCH", body: JSON.stringify(body) });
}

describe("PATCH /api/assessments/[assessmentId]/outcome", () => {
  it("stores the bands with a timestamp", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(patch({ revenueBand: "1b_5b", growthBand: "10_50" }), params);

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      revenue_band: "1b_5b",
      growth_band: "10_50",
      outcome_at: expect.any(String),
    });
  });

  it("accepts one band and leaves the other null", async () => {
    const { PATCH } = await import("./route");

    await PATCH(patch({ revenueBand: "pre_revenue", growthBand: null }), params);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ revenue_band: "pre_revenue", growth_band: null })
    );
  });

  it("rejects an empty submission", async () => {
    const { PATCH } = await import("./route");

    expect((await PATCH(patch({ revenueBand: null, growthBand: null }), params)).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects an unknown band code", async () => {
    const { PATCH } = await import("./route");

    expect((await PATCH(patch({ revenueBand: "huge", growthBand: null }), params)).status).toBe(400);
  });

  it("refuses a second submission", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: { id: "a1", outcome_at: "2026-09-20T01:00:00Z" },
      error: null,
    });
    const { PATCH } = await import("./route");

    expect((await PATCH(patch({ revenueBand: "lt_100m", growthBand: null }), params)).status).toBe(
      409
    );
    expect(update).not.toHaveBeenCalled();
  });
});
