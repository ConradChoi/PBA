import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn<(table: string) => unknown>(() => ({ select }));

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

describe("listAssessments", () => {
  it("returns rows ordered newest first", async () => {
    const order = vi.fn().mockResolvedValue({ data: [{ id: "a1" }], error: null });
    from.mockReturnValueOnce({ select: () => ({ order }) });
    const { listAssessments } = await import("./get-assessment");

    const result = await listAssessments();

    expect(result).toEqual([{ id: "a1" }]);
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});

describe("getAssessmentsByIds", () => {
  it("returns [] without querying when given no ids", async () => {
    const { getAssessmentsByIds } = await import("./get-assessment");

    expect(await getAssessmentsByIds([])).toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });

  it("queries with an 'in' filter for the given ids", async () => {
    const inFilter = vi
      .fn()
      .mockResolvedValue({ data: [{ id: "a1" }, { id: "a2" }], error: null });
    from.mockReturnValueOnce({ select: () => ({ in: inFilter }) });
    const { getAssessmentsByIds } = await import("./get-assessment");

    const result = await getAssessmentsByIds(["a1", "a2"]);

    expect(result).toHaveLength(2);
    expect(inFilter).toHaveBeenCalledWith("id", ["a1", "a2"]);
  });
});
