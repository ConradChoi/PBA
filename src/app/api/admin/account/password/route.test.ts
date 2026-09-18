import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentOperator = vi.fn();
vi.mock("@/lib/operators/get-current-operator", () => ({
  getCurrentOperator: () => getCurrentOperator(),
}));

// Verifies the current password without touching the operator's own session.
const signInWithPassword = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: { signInWithPassword } }),
}));

const updateUserById = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ auth: { admin: { updateUserById } } }),
}));

// Re-issues this browser's session cookies after Supabase revokes them all.
const cookieSignIn = vi.fn();
vi.mock("@/lib/supabase/auth-server", () => ({
  createAuthServerClient: async () => ({ auth: { signInWithPassword: cookieSignIn } }),
}));

const operator = { id: "u1", email: "staff@ylia.io", role: "staff" };

function post(body: unknown) {
  return new Request("http://localhost", { method: "POST", body: JSON.stringify(body) });
}

beforeEach(() => {
  getCurrentOperator.mockReset();
  signInWithPassword.mockReset();
  updateUserById.mockReset();
  cookieSignIn.mockReset().mockResolvedValue({ error: null });
});

describe("POST /api/admin/account/password", () => {
  it("returns 401 when there is no session", async () => {
    getCurrentOperator.mockResolvedValueOnce(null);
    const { POST } = await import("./route");

    const response = await POST(post({ currentPassword: "old-pass-1", newPassword: "new-pass-1" }));

    expect(response.status).toBe(401);
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it("returns 400 when the new password is too short", async () => {
    getCurrentOperator.mockResolvedValueOnce(operator);
    const { POST } = await import("./route");

    const response = await POST(post({ currentPassword: "old-pass-1", newPassword: "short" }));

    expect(response.status).toBe(400);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("returns 400 when the new password equals the current one", async () => {
    getCurrentOperator.mockResolvedValueOnce(operator);
    const { POST } = await import("./route");

    const response = await POST(post({ currentPassword: "same-pass-1", newPassword: "same-pass-1" }));

    expect(response.status).toBe(400);
  });

  it("returns 400 when the current password is wrong", async () => {
    getCurrentOperator.mockResolvedValueOnce(operator);
    signInWithPassword.mockResolvedValueOnce({
      data: { session: null },
      error: { message: "Invalid login credentials" },
    });
    const { POST } = await import("./route");

    const response = await POST(post({ currentPassword: "wrong-pass", newPassword: "new-pass-1" }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("현재 비밀번호가 올바르지 않습니다.");
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it("updates the password and signs this browser back in with it", async () => {
    getCurrentOperator.mockResolvedValueOnce(operator);
    signInWithPassword.mockResolvedValueOnce({
      data: { session: { access_token: "verify-token" } },
      error: null,
    });
    updateUserById.mockResolvedValueOnce({ error: null });
    const { POST } = await import("./route");

    const response = await POST(post({ currentPassword: "old-pass-1", newPassword: "new-pass-1" }));

    expect(response.status).toBe(200);
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "staff@ylia.io",
      password: "old-pass-1",
    });
    expect(updateUserById).toHaveBeenCalledWith("u1", { password: "new-pass-1" });
    expect(cookieSignIn).toHaveBeenCalledWith({
      email: "staff@ylia.io",
      password: "new-pass-1",
    });
  });
});
