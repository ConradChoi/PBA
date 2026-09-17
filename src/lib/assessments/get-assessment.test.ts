import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

beforeEach(() => {
  maybeSingle.mockReset();
  eq.mockClear();
  select.mockClear();
  from.mockClear();
});

describe("getAssessmentById", () => {
  it("returns the row when found", async () => {
    maybeSingle.mockResolvedValueOnce({ data: { id: "abc", total_raw: 84 }, error: null });
    const { getAssessmentById } = await import("./get-assessment");

    const result = await getAssessmentById("abc");

    expect(result).toEqual({ id: "abc", total_raw: 84 });
    expect(from).toHaveBeenCalledWith("assessments");
    expect(eq).toHaveBeenCalledWith("id", "abc");
  });

  it("returns null when not found", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { getAssessmentById } = await import("./get-assessment");

    const result = await getAssessmentById("missing");

    expect(result).toBeNull();
  });

  it("throws when the query errors", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    const { getAssessmentById } = await import("./get-assessment");

    await expect(getAssessmentById("abc")).rejects.toThrow("boom");
  });
});
