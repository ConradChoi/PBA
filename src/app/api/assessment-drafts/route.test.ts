import { beforeEach, describe, expect, it, vi } from "vitest";

const single = vi.fn();
const select = vi.fn(() => ({ single }));
const insert = vi.fn(() => ({ select }));
const from = vi.fn(() => ({ insert }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

// getLocale() relies on next-intl's request-scoped config, which isn't
// available outside the Next.js RSC/route runtime -- see the note in
// ResultReport.test.tsx for the same constraint.
const getLocale = vi.fn(async () => "ko");
vi.mock("next-intl/server", () => ({
  getLocale: () => getLocale(),
}));

function validPayload() {
  return {
    basicInfo: { name: "테스트", email: "test@example.com", businessStage: "idea" },
    privacyConsent: true,
    marketingConsent: false,
  };
}

beforeEach(() => {
  single.mockReset();
  select.mockClear();
  insert.mockClear();
  from.mockClear();
  getLocale.mockClear();
  getLocale.mockImplementation(async () => "ko");
});

describe("POST /api/assessment-drafts", () => {
  it("creates a draft and returns 201 with a draftId", async () => {
    single.mockResolvedValueOnce({ data: { id: "draft-id" }, error: null });
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/assessment-drafts", {
      method: "POST",
      body: JSON.stringify(validPayload()),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.draftId).toBe("draft-id");
    expect(from).toHaveBeenCalledWith("assessment_drafts");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ current_step: 0, answers: {}, privacy_consent: true })
    );
  });

  it("stamps the draft with the request's resolved locale", async () => {
    getLocale.mockImplementationOnce(async () => "ja");
    single.mockResolvedValueOnce({ data: { id: "draft-id" }, error: null });
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/assessment-drafts", {
      method: "POST",
      body: JSON.stringify(validPayload()),
    });
    await POST(request);

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ locale: "ja" }));
  });

  it("returns 400 for a payload missing privacyConsent", async () => {
    const { POST } = await import("./route");
    const payload = validPayload();
    delete (payload as Record<string, unknown>).privacyConsent;

    const request = new Request("http://localhost/api/assessment-drafts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 500 when the insert fails", async () => {
    single.mockResolvedValueOnce({ data: null, error: { message: "insert failed" } });
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/assessment-drafts", {
      method: "POST",
      body: JSON.stringify(validPayload()),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe("insert failed");
  });
});
