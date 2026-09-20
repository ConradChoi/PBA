import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentOperator = vi.fn();
vi.mock("@/lib/operators/get-current-operator", () => ({
  getCurrentOperator: () => getCurrentOperator(),
}));

const eqUpdate = vi.fn().mockResolvedValue({ error: null });
const update = vi.fn(() => ({ eq: eqUpdate }));
const eqDelete = vi.fn().mockResolvedValue({ error: null });
const del = vi.fn(() => ({ eq: eqDelete }));
vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({
    from: (table: string) => (table === "assessments" ? { update } : { delete: del }),
  }),
}));

beforeEach(() => {
  getCurrentOperator.mockReset();
  update.mockClear();
  eqUpdate.mockClear();
  del.mockClear();
  eqDelete.mockClear();
});

const params = { params: Promise.resolve({ assessmentId: "a1" }) };

describe("POST /api/admin/assessments/[assessmentId]/purge", () => {
  it("returns 403 without an operator session", async () => {
    getCurrentOperator.mockResolvedValueOnce(null);
    const { POST } = await import("./route");

    expect((await POST(new Request("http://localhost"), params)).status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it("nulls every identifying field and clears the retention hold", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost"), params);

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      name: null,
      email: null,
      company_name: null,
      role: null,
      marketing_consent: false,
      industry: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      retain_until: null,
      retention_reason: null,
      retention_updated_by: "staff@ylia.io",
      retention_updated_at: expect.any(String),
    });
    expect(eqUpdate).toHaveBeenCalledWith("id", "a1");
  });

  it("deletes the assessment's consulting requests", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { POST } = await import("./route");

    await POST(new Request("http://localhost"), params);

    expect(del).toHaveBeenCalled();
    expect(eqDelete).toHaveBeenCalledWith("assessment_id", "a1");
  });
});
