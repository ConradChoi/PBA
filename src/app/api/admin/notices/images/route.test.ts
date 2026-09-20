import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentOperator = vi.fn();
vi.mock("@/lib/operators/get-current-operator", () => ({
  getCurrentOperator: () => getCurrentOperator(),
}));

const upload = vi.fn();
const getPublicUrl = vi.fn(() => ({
  data: { publicUrl: "https://storage.test/notice-images/x.png" },
}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({
    storage: { from: () => ({ upload, getPublicUrl }) },
  }),
}));

beforeEach(() => {
  getCurrentOperator.mockReset();
  upload.mockReset().mockResolvedValue({ error: null });
});

const PNG_MAGIC = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

function uploadRequest(bytes: Uint8Array, name = "shot.png") {
  const form = new FormData();
  form.append("file", new File([bytes.buffer as ArrayBuffer], name));
  return new Request("http://localhost", { method: "POST", body: form });
}

describe("POST /api/admin/notices/images", () => {
  it("returns 403 without an operator session", async () => {
    getCurrentOperator.mockResolvedValueOnce(null);
    const { POST } = await import("./route");

    expect((await POST(uploadRequest(PNG_MAGIC))).status).toBe(403);
    expect(upload).not.toHaveBeenCalled();
  });

  it("uploads a real png and returns its public url", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { POST } = await import("./route");

    const response = await POST(uploadRequest(PNG_MAGIC));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ url: "https://storage.test/notice-images/x.png" });
    expect(upload).toHaveBeenCalled();
  });

  it("rejects a file whose bytes are not an image even when the name lies", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { POST } = await import("./route");

    const response = await POST(
      uploadRequest(new Uint8Array([0x3c, 0x73, 0x63, 0x72]), "evil.png")
    );

    expect(response.status).toBe(400);
    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects a file larger than 5 MB", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { POST } = await import("./route");

    const big = new Uint8Array(5 * 1024 * 1024 + 1);
    big.set(PNG_MAGIC.slice(0, 8));

    expect((await POST(uploadRequest(big))).status).toBe(400);
    expect(upload).not.toHaveBeenCalled();
  });
});
