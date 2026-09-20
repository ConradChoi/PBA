import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentOperator = vi.fn();
vi.mock("@/lib/operators/get-current-operator", () => ({
  getCurrentOperator: () => getCurrentOperator(),
}));

const updateNotice = vi.fn();
const deleteNotice = vi.fn();
vi.mock("@/lib/notices/get-notices", () => ({
  updateNotice: (id: string, input: unknown) => updateNotice(id, input),
  deleteNotice: (id: string) => deleteNotice(id),
}));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  getCurrentOperator.mockReset();
  updateNotice.mockReset().mockResolvedValue(undefined);
  deleteNotice.mockReset().mockResolvedValue(undefined);
});

const params = { params: Promise.resolve({ noticeId: "n1" }) };

function put(body: unknown) {
  return new Request("http://localhost", { method: "PUT", body: JSON.stringify(body) });
}

function validPayload() {
  return {
    title: "수정된 공지",
    bodyHtml: "<p>내용</p>",
    isPublished: false,
    isImportant: false,
    importantUntil: null,
  };
}

describe("PUT /api/admin/notices/[noticeId]", () => {
  it("returns 403 without an operator session", async () => {
    getCurrentOperator.mockResolvedValueOnce(null);
    const { PUT } = await import("./route");

    expect((await PUT(put(validPayload()), params)).status).toBe(403);
    expect(updateNotice).not.toHaveBeenCalled();
  });

  it("updates with sanitized html and the operator's email", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { PUT } = await import("./route");

    const response = await PUT(
      put({
        ...validPayload(),
        bodyHtml: '<p>안녕</p><img src="https://evil.example.com/p.gif" />',
      }),
      params
    );

    expect(response.status).toBe(200);
    expect(updateNotice).toHaveBeenCalledWith(
      "n1",
      expect.objectContaining({ bodyHtml: "<p>안녕</p>", operatorEmail: "staff@ylia.io" })
    );
  });
});

describe("DELETE /api/admin/notices/[noticeId]", () => {
  it("returns 403 without an operator session", async () => {
    getCurrentOperator.mockResolvedValueOnce(null);
    const { DELETE } = await import("./route");

    expect((await DELETE(new Request("http://localhost"), params)).status).toBe(403);
    expect(deleteNotice).not.toHaveBeenCalled();
  });

  it("deletes for an operator", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { DELETE } = await import("./route");

    const response = await DELETE(new Request("http://localhost"), params);

    expect(response.status).toBe(200);
    expect(deleteNotice).toHaveBeenCalledWith("n1");
  });
});
