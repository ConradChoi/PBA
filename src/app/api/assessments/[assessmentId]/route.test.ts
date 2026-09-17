import { beforeEach, describe, expect, it, vi } from "vitest";

const getAssessmentById = vi.fn();
vi.mock("@/lib/assessments/get-assessment", () => ({
  getAssessmentById: (...args: unknown[]) => getAssessmentById(...args),
}));

beforeEach(() => {
  getAssessmentById.mockReset();
});

describe("GET /api/assessments/[assessmentId]", () => {
  it("returns the row when found", async () => {
    getAssessmentById.mockResolvedValueOnce({ id: "abc", total_raw: 84 });
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ assessmentId: "abc" }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.total_raw).toBe(84);
    expect(getAssessmentById).toHaveBeenCalledWith("abc");
  });

  it("returns 404 when not found", async () => {
    getAssessmentById.mockResolvedValueOnce(null);
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ assessmentId: "missing" }),
    });

    expect(response.status).toBe(404);
  });
});
