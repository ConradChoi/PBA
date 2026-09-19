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
    assessmentMaybeSingle.mockResolvedValueOnce({ data: { id: "assessment-1" }, error: null });
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
    assessmentMaybeSingle.mockResolvedValueOnce({ data: { id: "assessment-1" }, error: null });
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
});
