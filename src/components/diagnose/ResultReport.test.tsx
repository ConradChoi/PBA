import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ResultReport } from "./ResultReport";
import { CAUSE_HYPOTHESES } from "@/lib/content/cause-hypotheses";
import type { AssessmentRow } from "@/lib/assessments/get-assessment";

// RadarChart is a client component built on chart.js; it has no reason to
// render in this server-side markup test, so replace it with a stub.
vi.mock("@/components/diagnose/RadarChart", () => ({
  RadarChart: () => null,
}));

// Raw scores chosen to put layers at distinct maturity levels (4-20 range).
// bottleneck_1/2/3 = process, data, scale; strength_1/2 = value, customer.
const assessment: AssessmentRow = {
  id: "8f9fef0b-7a8d-4336-9d06-b7de6c881e3d",
  created_at: "2026-09-01T00:00:00.000Z",
  name: "테스트 고객",
  email: "test@example.com",
  company_name: "Test Co",
  role: "founder",
  business_stage: "operating",
  business_stage_other: null,
  industry: "saas",
  team_size: "1-5",
  score_value_raw: 18,
  score_value_100: 90,
  score_customer_raw: 16,
  score_customer_100: 80,
  score_offer_raw: 12,
  score_offer_100: 60,
  score_experience_raw: 10,
  score_experience_100: 50,
  score_process_raw: 5,
  score_process_100: 25,
  score_data_raw: 6,
  score_data_100: 30,
  score_scale_raw: 8,
  score_scale_100: 40,
  total_raw: 75,
  architecture_level: "STRUCTURE_NEEDED",
  bottleneck_1: "process",
  bottleneck_2: "data",
  bottleneck_3: "scale",
  strength_1: "value",
  strength_2: "customer",
  consulting_cta_clicked: false,
  consulting_requested: false,
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  privacy_consent: true,
  privacy_consent_at: "2026-09-01T00:00:00.000Z",
  privacy_notice_version: "v1",
  marketing_consent: false,
};

const internalHypotheses = ["process", "data", "scale"] as const;

describe("ResultReport privacy invariant", () => {
  it("never leaks internal consulting hypotheses on the public view (no audience prop)", () => {
    const html = renderToStaticMarkup(<ResultReport assessment={assessment} />);

    expect(html).not.toContain("상담용");
    for (const layerId of Object.keys(CAUSE_HYPOTHESES) as (keyof typeof CAUSE_HYPOTHESES)[]) {
      expect(html).not.toContain(CAUSE_HYPOTHESES[layerId].internal);
    }
  });

  it("never leaks internal consulting hypotheses when audience is explicitly public", () => {
    const html = renderToStaticMarkup(
      <ResultReport assessment={assessment} audience="public" />
    );

    expect(html).not.toContain("상담용");
    for (const layerId of Object.keys(CAUSE_HYPOTHESES) as (keyof typeof CAUSE_HYPOTHESES)[]) {
      expect(html).not.toContain(CAUSE_HYPOTHESES[layerId].internal);
    }
  });

  it("shows the internal hypotheses for the bottleneck layers when audience is admin", () => {
    const html = renderToStaticMarkup(
      <ResultReport assessment={assessment} audience="admin" />
    );

    expect(html).toContain("상담용");
    for (const layerId of internalHypotheses) {
      expect(html).toContain(CAUSE_HYPOTHESES[layerId].internal);
    }
  });
});
