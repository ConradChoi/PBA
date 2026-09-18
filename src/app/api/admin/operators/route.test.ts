import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentOperator = vi.fn();
vi.mock("@/lib/operators/get-current-operator", () => ({
  getCurrentOperator: () => getCurrentOperator(),
}));

const createUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ auth: { admin: { createUser } } }),
}));

function validPayload() {
  return { email: "new-staff@ylia.io", password: "temp-password-1", role: "staff" as const };
}

beforeEach(() => {
  getCurrentOperator.mockReset();
  createUser.mockReset();
});

describe("POST /api/admin/operators", () => {
  it("returns 403 when the caller is not an owner", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify(validPayload()) })
    );

    expect(response.status).toBe(403);
    expect(createUser).not.toHaveBeenCalled();
  });

  it("returns 403 when there is no session", async () => {
    getCurrentOperator.mockResolvedValueOnce(null);
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify(validPayload()) })
    );

    expect(response.status).toBe(403);
  });

  it("creates the operator and returns 201 for an owner", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "owner1", email: "owner@ylia.io", role: "owner" });
    createUser.mockResolvedValueOnce({ data: { user: { id: "new-id" } }, error: null });
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify(validPayload()) })
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.id).toBe("new-id");
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new-staff@ylia.io", app_metadata: { role: "staff" } })
    );
  });

  it("returns 400 for an invalid payload", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "owner1", email: "owner@ylia.io", role: "owner" });
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ email: "not-an-email" }),
      })
    );

    expect(response.status).toBe(400);
  });
});
