import { beforeEach, describe, expect, it, vi } from "vitest";

const assessmentMaybeSingle = vi.fn();
const assessmentEq = vi.fn(() => ({ maybeSingle: assessmentMaybeSingle }));
const assessmentSelect = vi.fn(() => ({ eq: assessmentEq }));

const updateEq = vi.fn().mockResolvedValue({ error: null });
const update = vi.fn(() => ({ eq: updateEq }));

const insertSingle = vi.fn();
const insertSelect = vi.fn(() => ({ single: insertSingle }));
const insert = vi.fn(() => ({ select: insertSelect }));

const from = vi.fn((table: string) =>
  table === "assessments" ? { select: assessmentSelect, update } : { insert }
);

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

beforeEach(() => {
  assessmentMaybeSingle.mockReset();
  insertSingle.mockReset();
  updateEq.mockClear();
  update.mockClear();
  assessmentEq.mockClear();
  assessmentSelect.mockClear();
  insertSelect.mockClear();
  insert.mockClear();
  from.mockClear();
});

function validPayload() {
  return { message: "다음 주 통화 가능한가요?" };
}

describe("POST /api/assessments/[assessmentId]/consulting-requests", () => {
  it("inserts the request, flags the assessment, and returns 201", async () => {
    assessmentMaybeSingle.mockResolvedValueOnce({
      data: { id: "assessment-1", email: "owner@example.com" },
      error: null,
    });
    insertSingle.mockResolvedValueOnce({ data: { id: "request-1" }, error: null });
    const { POST } = await import("./route");

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify(validPayload()),
    });
    const response = await POST(request, { params: Promise.resolve({ assessmentId: "assessment-1" }) });
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.requestId).toBe("request-1");
    expect(insert).toHaveBeenCalledWith(
      { assessment_id: "assessment-1", message: "다음 주 통화 가능한가요?" }
    );
    expect(update).toHaveBeenCalledWith({ consulting_requested: true });
    expect(updateEq).toHaveBeenCalledWith("id", "assessment-1");
  });

  it("returns 404 when the assessment doesn't exist", async () => {
    assessmentMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { POST } = await import("./route");

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify(validPayload()),
    });
    const response = await POST(request, { params: Promise.resolve({ assessmentId: "missing" }) });

    expect(response.status).toBe(404);
    expect(insert).not.toHaveBeenCalled();
  });

  it("accepts a request with no message", async () => {
    assessmentMaybeSingle.mockResolvedValueOnce({
      data: { id: "assessment-1", email: "owner@example.com" },
      error: null,
    });
    insertSingle.mockResolvedValueOnce({ data: { id: "request-2" }, error: null });
    const { POST } = await import("./route");

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(request, { params: Promise.resolve({ assessmentId: "assessment-1" }) });

    expect(response.status).toBe(201);
    expect(insert).toHaveBeenCalledWith({ assessment_id: "assessment-1", message: null });
  });

  it("returns 400 when message isn't a string", async () => {
    const { POST } = await import("./route");

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ message: 123 }),
    });
    const response = await POST(request, { params: Promise.resolve({ assessmentId: "assessment-1" }) });

    expect(response.status).toBe(400);
    expect(assessmentSelect).not.toHaveBeenCalled();
  });

  it("returns 400 for an anonymous diagnosis without contact details", async () => {
    assessmentMaybeSingle.mockResolvedValueOnce({ data: { id: "anon-1", email: null }, error: null });
    const { POST } = await import("./route");

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ message: "연락 주세요" }),
    });
    const response = await POST(request, { params: Promise.resolve({ assessmentId: "anon-1" }) });

    expect(response.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it("saves contact details and consent onto an anonymous diagnosis", async () => {
    assessmentMaybeSingle.mockResolvedValueOnce({ data: { id: "anon-1", email: null }, error: null });
    insertSingle.mockResolvedValueOnce({ data: { id: "request-3" }, error: null });
    const { POST } = await import("./route");

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        contact: { name: "홍길동", email: "hong@example.com", privacyConsent: true },
      }),
    });
    const response = await POST(request, { params: Promise.resolve({ assessmentId: "anon-1" }) });

    expect(response.status).toBe(201);
    expect(update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        name: "홍길동",
        email: "hong@example.com",
        privacy_consent: true,
        privacy_consent_at: expect.any(String),
      })
    );
    expect(update).toHaveBeenNthCalledWith(2, { consulting_requested: true });
    expect(updateEq).toHaveBeenCalledWith("id", "anon-1");
    // Contact is saved before the request row is created.
    expect(update.mock.invocationCallOrder[0]).toBeLessThan(insert.mock.invocationCallOrder[0]);
  });

  it("returns 400 when contact is sent without privacy consent", async () => {
    const { POST } = await import("./route");

    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        contact: { name: "홍길동", email: "hong@example.com", privacyConsent: false },
      }),
    });
    const response = await POST(request, { params: Promise.resolve({ assessmentId: "anon-1" }) });

    expect(response.status).toBe(400);
  });
});
