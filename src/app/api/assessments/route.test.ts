import { beforeEach, describe, expect, it, vi } from "vitest";

const single = vi.fn();
const select = vi.fn(() => ({ single }));
const insert = vi.fn(() => ({ select }));
const from = vi.fn(() => ({ insert }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

function validPayload() {
  return {
    basicInfo: {
      name: "테스트 사용자",
      email: "test@example.com",
      businessStage: "idea",
    },
    answers: {
      value: [1, 1, 1, 1],
      customer: [1, 1, 1, 1],
      offer: [1, 1, 1, 1],
      experience: [1, 1, 1, 1],
      process: [1, 1, 1, 1],
      data: [1, 1, 1, 1],
      scale: [1, 1, 1, 1],
    },
    marketingConsent: false,
    privacyConsent: true,
  };
}

beforeEach(() => {
  single.mockReset();
  select.mockClear();
  insert.mockClear();
  from.mockClear();
});

describe("POST /api/assessments", () => {
  it("computes scores and inserts a row, returning 201", async () => {
    single.mockResolvedValueOnce({ data: { id: "test-id" }, error: null });
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/assessments", {
      method: "POST",
      body: JSON.stringify(validPayload()),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.assessmentId).toBe("test-id");
    expect(json.architectureLevel).toBe("IDEA_STAGE");
    expect(json.totalRaw).toBe(28);
    expect(from).toHaveBeenCalledWith("assessments");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ total_raw: 28, architecture_level: "IDEA_STAGE" })
    );
  });

  it("returns 400 for an invalid payload without touching Supabase", async () => {
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/assessments", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 500 when the insert fails", async () => {
    single.mockResolvedValueOnce({
      data: null,
      error: { message: "insert failed" },
    });
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/assessments", {
      method: "POST",
      body: JSON.stringify(validPayload()),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe("insert failed");
  });
});
