import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
vi.mock("../supabase/auth-server", () => ({
  createAuthServerClient: async () => ({ auth: { getUser } }),
}));

beforeEach(() => {
  getUser.mockReset();
});

describe("getCurrentOperator", () => {
  it("returns null when there is no session", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });
    const { getCurrentOperator } = await import("./get-current-operator");

    expect(await getCurrentOperator()).toBeNull();
  });

  it("returns null for a signed-in user without an operator role", async () => {
    getUser.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "a@ylia.io", app_metadata: {} } },
    });
    const { getCurrentOperator } = await import("./get-current-operator");

    expect(await getCurrentOperator()).toBeNull();
  });

  it("returns null for an unrecognized role value", async () => {
    getUser.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "a@ylia.io", app_metadata: { role: "admin" } } },
    });
    const { getCurrentOperator } = await import("./get-current-operator");

    expect(await getCurrentOperator()).toBeNull();
  });

  it("reads the staff role from app_metadata", async () => {
    getUser.mockResolvedValueOnce({
      data: { user: { id: "u3", email: "staff@ylia.io", app_metadata: { role: "staff" } } },
    });
    const { getCurrentOperator } = await import("./get-current-operator");

    expect(await getCurrentOperator()).toEqual({
      id: "u3",
      email: "staff@ylia.io",
      role: "staff",
    });
  });

  it("reads the owner role from app_metadata", async () => {
    getUser.mockResolvedValueOnce({
      data: {
        user: { id: "u2", email: "owner@ylia.io", app_metadata: { role: "owner" } },
      },
    });
    const { getCurrentOperator } = await import("./get-current-operator");

    expect(await getCurrentOperator()).toEqual({
      id: "u2",
      email: "owner@ylia.io",
      role: "owner",
    });
  });
});
