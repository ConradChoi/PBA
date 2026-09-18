import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentOperator = vi.fn();
vi.mock("@/lib/operators/get-current-operator", () => ({
  getCurrentOperator: () => getCurrentOperator(),
}));

const listOperators = vi.fn();
vi.mock("@/lib/operators/list-operators", () => ({
  listOperators: () => listOperators(),
}));

const deleteUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ auth: { admin: { deleteUser } } }),
}));

beforeEach(() => {
  getCurrentOperator.mockReset();
  listOperators.mockReset();
  deleteUser.mockReset();
});

describe("DELETE /api/admin/operators/[userId]", () => {
  it("returns 403 when the caller is not an owner", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ userId: "target" }),
    });

    expect(response.status).toBe(403);
  });

  it("returns 400 when an owner tries to delete their own account", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "owner1", email: "owner@ylia.io", role: "owner" });
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ userId: "owner1" }),
    });

    expect(response.status).toBe(400);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("returns 400 when deleting the last remaining owner", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "owner1", email: "owner@ylia.io", role: "owner" });
    listOperators.mockResolvedValueOnce([
      { id: "target", email: "target@ylia.io", role: "owner", created_at: "2026-01-02" },
    ]);
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ userId: "target" }),
    });

    expect(response.status).toBe(400);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("deletes a staff operator when called by an owner", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "owner1", email: "owner@ylia.io", role: "owner" });
    listOperators.mockResolvedValueOnce([
      { id: "owner1", email: "owner@ylia.io", role: "owner", created_at: "2026-01-01" },
      { id: "target", email: "target@ylia.io", role: "staff", created_at: "2026-01-02" },
    ]);
    deleteUser.mockResolvedValueOnce({ error: null });
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ userId: "target" }),
    });

    expect(response.status).toBe(200);
    expect(deleteUser).toHaveBeenCalledWith("target");
  });
});
