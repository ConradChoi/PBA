import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ResultReport } from "./ResultReport";
import { CAUSE_HYPOTHESES } from "@/lib/content/cause-hypotheses";
import ko from "@/i18n/messages/ko";
import type { AssessmentRow } from "@/lib/assessments/get-assessment";

// RadarChart is a client component built on chart.js; it has no reason to
// render in this server-side markup test, so replace it with a stub.
vi.mock("@/components/diagnose/RadarChart", () => ({
  RadarChart: () => null,
}));

// ResultReport is an async Server Component that calls the real
// `getTranslations` under Next's RSC runtime. Outside that runtime (plain
// Vitest + react-dom/server), next-intl's server APIs can't resolve
// request-scoped config, so this stub resolves messages directly from the
// real `ko` messages object instead -- the same source of truth the
// component reads from in production, just without the request plumbing.
// It supports plain `{var}` placeholders and `.raw()`, which is all
// ResultReport uses; it does not implement full ICU (plural/select).
vi.mock("next-intl/server", () => ({
  getTranslations: async ({ namespace }: { locale: string; namespace: string }) => {
    const messages = ko as unknown as Record<string, unknown>;
    const resolve = (key: string): unknown =>
      `${namespace}.${key}`
        .split(".")
        .reduce<unknown>(
          (acc, part) =>
            acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined,
          messages
        );

    function t(key: string, vars?: Record<string, string | number>): string {
      const value = resolve(key);
      if (typeof value !== "string") {
        throw new Error(`Test stub: missing string message "${namespace}.${key}"`);
      }
      return vars
        ? value.replace(/\{(\w+)\}/g, (_match, name: string) =>
            Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
          )
        : value;
    }
    t.raw = (key: string) => resolve(key);
    return t;
  },
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
  result_fit: null,
  result_fit_at: null,
  revenue_band: null,
  growth_band: null,
  outcome_at: null,
  retain_until: null,
  retention_reason: null,
  retention_updated_by: null,
  retention_updated_at: null,
};

const internalHypotheses = ["process", "data", "scale"] as const;

// ResultReport is an async Server Component: `renderToStaticMarkup` can't
// render an async function component directly (it only awaits synchronous
// trees), so call it as a plain async function and render the element it
// resolves to instead of mounting `<ResultReport .../>` in the tree.
async function renderResultReport(props: Parameters<typeof ResultReport>[0]) {
  return renderToStaticMarkup(await ResultReport(props));
}

describe("ResultReport privacy invariant", () => {
  it("never leaks internal consulting hypotheses on the public view (no audience prop)", async () => {
    const html = await renderResultReport({ assessment, locale: "ko" });

    expect(html).not.toContain("상담용");
    for (const layerId of Object.keys(CAUSE_HYPOTHESES) as (keyof typeof CAUSE_HYPOTHESES)[]) {
      expect(html).not.toContain(CAUSE_HYPOTHESES[layerId].internal);
    }
  });

  it("never leaks internal consulting hypotheses when audience is explicitly public", async () => {
    const html = await renderResultReport({ assessment, audience: "public", locale: "ko" });

    expect(html).not.toContain("상담용");
    for (const layerId of Object.keys(CAUSE_HYPOTHESES) as (keyof typeof CAUSE_HYPOTHESES)[]) {
      expect(html).not.toContain(CAUSE_HYPOTHESES[layerId].internal);
    }
  });

  it("shows the internal hypotheses for the bottleneck layers when audience is admin", async () => {
    const html = await renderResultReport({ assessment, audience: "admin", locale: "ko" });

    expect(html).toContain("상담용");
    for (const layerId of internalHypotheses) {
      expect(html).toContain(CAUSE_HYPOTHESES[layerId].internal);
    }
  });
});
