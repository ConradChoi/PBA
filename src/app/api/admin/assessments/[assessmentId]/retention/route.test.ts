import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentOperator = vi.fn();
vi.mock("@/lib/operators/get-current-operator", () => ({
  getCurrentOperator: () => getCurrentOperator(),
}));

const eqUpdate = vi.fn().mockResolvedValue({ error: null });
const update = vi.fn(() => ({ eq: eqUpdate }));
vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from: () => ({ update }) }),
}));

beforeEach(() => {
  getCurrentOperator.mockReset();
  update.mockClear();
  eqUpdate.mockClear();
});

const params = { params: Promise.resolve({ assessmentId: "a1" }) };

function put(body: unknown) {
  return new Request("http://localhost", { method: "PUT", body: JSON.stringify(body) });
}

describe("PUT /api/admin/assessments/[assessmentId]/retention", () => {
  it("returns 403 without an operator session", async () => {
    getCurrentOperator.mockResolvedValueOnce(null);
    const { PUT } = await import("./route");

    expect((await PUT(put({ amount: 6, unit: "months", reason: "계약" }), params)).status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it("sets the hold with the operator and reason", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { PUT } = await import("./route");

    const response = await PUT(
      put({ amount: 6, unit: "months", reason: "2026 하반기 컨설팅 계약" }),
      params
    );

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        retain_until: expect.any(String),
        retention_reason: "2026 하반기 컨설팅 계약",
        retention_updated_by: "staff@ylia.io",
        retention_updated_at: expect.any(String),
      })
    );
    expect(eqUpdate).toHaveBeenCalledWith("id", "a1");
  });

  it("rejects a hold without a reason", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { PUT } = await import("./route");

    expect((await PUT(put({ amount: 6, unit: "months", reason: "" }), params)).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("clears the hold on reset", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { PUT } = await import("./route");

    const response = await PUT(put({ reset: true }), params);

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      retain_until: null,
      retention_reason: null,
      retention_updated_by: "staff@ylia.io",
      retention_updated_at: expect.any(String),
    });
  });
});
