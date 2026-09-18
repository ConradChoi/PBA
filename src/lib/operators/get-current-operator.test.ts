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

  it("defaults to staff role when app_metadata.role is missing", async () => {
    getUser.mockResolvedValueOnce({
      data: { user: { id: "u1", email: "a@ylia.io", app_metadata: {} } },
    });
    const { getCurrentOperator } = await import("./get-current-operator");

    expect(await getCurrentOperator()).toEqual({
      id: "u1",
      email: "a@ylia.io",
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
