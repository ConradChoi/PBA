import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentOperator = vi.fn();
vi.mock("@/lib/operators/get-current-operator", () => ({
  getCurrentOperator: () => getCurrentOperator(),
}));

const createNotice = vi.fn();
vi.mock("@/lib/notices/get-notices", () => ({
  createNotice: (input: unknown) => createNotice(input),
}));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  getCurrentOperator.mockReset();
  createNotice.mockReset().mockResolvedValue("n1");
});

function post(body: unknown) {
  return new Request("http://localhost", { method: "POST", body: JSON.stringify(body) });
}

function validPayload() {
  return {
    title: "개인정보처리방침 개정 안내",
    bodyHtml: "<p>내용</p>",
    isPublished: true,
    isImportant: true,
    importantUntil: "2026-09-27",
  };
}

describe("POST /api/admin/notices", () => {
  it("returns 403 without an operator session", async () => {
    getCurrentOperator.mockResolvedValueOnce(null);
    const { POST } = await import("./route");

    expect((await POST(post(validPayload()))).status).toBe(403);
    expect(createNotice).not.toHaveBeenCalled();
  });

  it("creates the notice for any operator and returns 201", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { POST } = await import("./route");

    const response = await POST(post(validPayload()));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: "n1" });
    expect(createNotice).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "개인정보처리방침 개정 안내",
        operatorEmail: "staff@ylia.io",
      })
    );
  });

  it("stores sanitized html, not what was sent", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { POST } = await import("./route");

    await POST(
      post({ ...validPayload(), bodyHtml: '<p onclick="alert(1)">안녕</p><script>x()</script>' })
    );

    expect(createNotice).toHaveBeenCalledWith(
      expect.objectContaining({ bodyHtml: "<p>안녕</p>" })
    );
  });

  it("rejects an important notice without an end date", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { POST } = await import("./route");

    const response = await POST(post({ ...validPayload(), importantUntil: null }));

    expect(response.status).toBe(400);
    expect(createNotice).not.toHaveBeenCalled();
  });
});
