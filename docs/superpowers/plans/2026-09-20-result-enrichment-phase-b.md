# Result Enrichment Phase B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Start collecting non-identifying outcome data on the result page, let operators hold a contracted customer's data past the default retention, and land the privacy policy revision those changes require.

**Architecture:** The revised policy ships first and is announced through the notice board, which starts the 7-day clock the policy itself promises. Everything that collects or retains data sits behind one server-side date gate (`PHASE_B_START`), so the code can deploy immediately and switch on by itself on the effective date. New columns go on `assessments`; the daily purge learns about retention holds and clears the free-text fields that make an anonymized row re-identifiable.

**Tech Stack:** Next.js 15 App Router, Supabase (Postgres + pg_cron), Zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-19-result-enrichment-design.md` (Phase B sections B1–B9). Copy comes from `docs/content/2026-09-19-result-content-draft.md` section 5.

## Global Constraints

- **Effective date: 2026-09-27** (announcement 2026-09-20 + 7 days, per the policy's own section 12). It appears once, as `PHASE_B_START` in `src/lib/content/phase-b.ts`, and every gate reads it from there.
- Everything Phase B collects or exposes is gated server-side: before the effective date the result page and admin show exactly what they show today.
- Result fit and outcome bands are **non-identifying diagnosis information**: collected regardless of consent, kept when the 1-year purge anonymizes a row.
- The 1-year purge must also null `industry` and `utm_source`/`utm_medium`/`utm_campaign` (free text and campaign ids make an "anonymized" row re-identifiable), and must skip rows held by a retention date.
- Retention control is available to **any operator** (owner or staff), requires a reason, and records who changed it and when.
- "개인정보 지금 삭제" removes personal data only — the non-identifying diagnosis stays for statistics.
- Outcome bands are **write-once** per assessment; result fit can be changed.
- Admin API routes re-verify the caller with `getCurrentOperator()`.
- The existing suite (174 tests) must stay green; run `npm test` before each commit.
- Korean copy only; no i18n scaffolding.

---

### Task 1: Revised privacy policy, archived old version, and the date gate

**Files:**
- Create: `src/lib/content/phase-b.ts`
- Create: `src/lib/content/phase-b.test.ts`
- Create: `src/components/privacy/PrivacyPolicyV1.tsx`
- Create: `src/components/privacy/PrivacyPolicyV2.tsx`
- Create: `src/app/privacy/2026-09-19/page.tsx`
- Create: `src/app/privacy/2026-09-27/page.tsx`
- Modify: `src/app/privacy/page.tsx`

**Interfaces:**
- Produces: `PHASE_B_START` (`"2026-09-27"`), `isPhaseBActive(now?: Date): boolean` — consumed by every later task; `PrivacyPolicyV1`/`PrivacyPolicyV2` components.

- [ ] **Step 1: Write the failing gate test**

Create `src/lib/content/phase-b.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isPhaseBActive, PHASE_B_START } from "./phase-b";

describe("isPhaseBActive", () => {
  it("is off before the effective date in KST", () => {
    // 2026-09-26 23:59 KST
    expect(isPhaseBActive(new Date("2026-09-26T14:59:00Z"))).toBe(false);
  });

  it("is on from midnight KST on the effective date", () => {
    // 2026-09-27 00:00 KST
    expect(isPhaseBActive(new Date("2026-09-26T15:00:00Z"))).toBe(true);
    expect(isPhaseBActive(new Date("2027-01-01T00:00:00Z"))).toBe(true);
  });

  it("announces the date the policy revision takes effect", () => {
    expect(PHASE_B_START).toBe("2026-09-27");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/content/phase-b.test.ts`
Expected: FAIL — `Cannot find module './phase-b'`

- [ ] **Step 3: Implement `src/lib/content/phase-b.ts`**

```ts
// The revised privacy policy was announced on 2026-09-20 and the policy
// promises 7 days' notice, so everything it covers switches on here.
export const PHASE_B_START = "2026-09-27";

export function isPhaseBActive(now: Date = new Date()): boolean {
  // Compare in KST: the effective date is a Korean calendar date.
  const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return kstDate >= PHASE_B_START;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/content/phase-b.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Move the current policy into `PrivacyPolicyV1`**

Create `src/components/privacy/PrivacyPolicyV1.tsx` containing the current policy exactly as `src/app/privacy/page.tsx` renders it today: copy the file's `Section`, `Table` helpers and the whole returned `<main>` into an exported `export function PrivacyPolicyV1()`, keeping `const EFFECTIVE_DATE = "2026년 9월 19일";` and every Korean string byte-for-byte. Remove the `metadata` export and the `export default` (they stay on the page files).

- [ ] **Step 6: Create `src/components/privacy/PrivacyPolicyV2.tsx`**

Start from a copy of `PrivacyPolicyV1`, then apply exactly these changes (spec §B5):

1. `const EFFECTIVE_DATE = "2026년 9월 27일";`
2. Section 1 list: add a final item — `<li>진단 방법론 연구·개선(개인을 식별할 수 없는 형태로 가공한 정보에 한함)</li>`
3. Section 2 table, the "진단 정보" row: replace its 항목 cell with `"사업 단계, 업종, 팀 규모, 문항 응답과 진단 결과, 결과 적합도 평가, 연 매출·최근 12개월 성장 구간(선택 입력)"`, and its 수집 시점 cell with `"진단 시 (익명 진단 포함). 익명 진단 시에는 이 정보만으로 개인을 식별할 수 없습니다. 개인정보 수집에 동의하거나 상담을 신청한 경우에는 이름·이메일과 함께 개인정보로 처리됩니다."`
4. Section 3 list: add two items —
   `<li>상담·컨설팅 계약을 맺은 경우, 계약 이행과 재진단을 위해 계약에서 정한 기간 동안 보관할 수 있습니다.</li>`
   `<li>개인정보를 파기할 때 업종 등 자유 입력 정보와 유입 경로(UTM) 정보도 함께 삭제하여, 남는 진단 정보로는 개인을 알아볼 수 없도록 합니다.</li>`
5. Section 12: replace the paragraph with

```tsx
        <p>
          이 개인정보처리방침은 {EFFECTIVE_DATE}부터 적용됩니다. 내용이 변경되는 경우 시행 7일
          전부터 서비스를 통해 공지합니다.
        </p>
        <p>
          이전 방침:{" "}
          <Link href="/privacy/2026-09-19" className="font-medium text-indigo-600 underline">
            2026년 9월 19일 시행
          </Link>
        </p>
```

with `import Link from "next/link";` at the top of the file.

- [ ] **Step 7: Point `/privacy` at the right version**

Replace `src/app/privacy/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { PrivacyPolicyV1 } from "@/components/privacy/PrivacyPolicyV1";
import { PrivacyPolicyV2 } from "@/components/privacy/PrivacyPolicyV2";
import { isPhaseBActive } from "@/lib/content/phase-b";

export const metadata: Metadata = {
  title: "개인정보처리방침 | PBA 7-Layer Business Radar",
};

export default function PrivacyPolicyPage() {
  // The revised policy takes over on its announced effective date; until
  // then visitors must still see the policy they agreed to.
  return isPhaseBActive() ? <PrivacyPolicyV2 /> : <PrivacyPolicyV1 />;
}
```

- [ ] **Step 8: Add the permanent version URLs**

`src/app/privacy/2026-09-19/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PrivacyPolicyV1 } from "@/components/privacy/PrivacyPolicyV1";

export const metadata: Metadata = {
  title: "개인정보처리방침 (2026-09-19 시행) | PBA 7-Layer Business Radar",
};

export default function PrivacyPolicy20260919Page() {
  return <PrivacyPolicyV1 />;
}
```

`src/app/privacy/2026-09-27/page.tsx`:

```tsx
import type { Metadata } from "next";
import { PrivacyPolicyV2 } from "@/components/privacy/PrivacyPolicyV2";

export const metadata: Metadata = {
  title: "개인정보처리방침 (2026-09-27 시행) | PBA 7-Layer Business Radar",
};

export default function PrivacyPolicy20260927Page() {
  return <PrivacyPolicyV2 />;
}
```

- [ ] **Step 9: Verify both versions render**

Run `npm run typecheck && npm test && npm run build` (no dev server running), then with `npm run dev`:

```bash
curl -s http://localhost:3000/privacy | grep -o "시행일: [^<]*"
curl -s http://localhost:3000/privacy/2026-09-19 | grep -o "시행일: [^<]*"
curl -s http://localhost:3000/privacy/2026-09-27 | grep -o "시행일: [^<]*"
```

Expected: `/privacy` shows 2026년 9월 19일 (today is before the effective date), `/privacy/2026-09-19` the same, `/privacy/2026-09-27` the revised one. Also confirm the revised page links back to the old version.

- [ ] **Step 10: Commit**

```bash
git add src/lib/content/phase-b.ts src/lib/content/phase-b.test.ts src/components/privacy src/app/privacy
git commit -m "feat: add the revised privacy policy behind its effective date"
```

- [ ] **Step 11: Hand the announcement text to the user**

Report this to the user as the notice to publish from `/admin/notices` (중요 공지, 표시 종료일 2026-09-27):

> **제목:** 개인정보처리방침 개정 안내 (2026년 9월 27일 시행)
>
> **본문:**
> 2026년 9월 27일부터 개인정보처리방침이 개정됩니다.
> 주요 변경 사항은 다음과 같습니다.
> - 진단 정보에 결과 적합도 평가와 연 매출·최근 12개월 성장 구간(선택 입력)이 추가됩니다.
> - 이용 목적에 진단 방법론 연구·개선(개인을 식별할 수 없는 형태로 가공한 정보에 한함)이 추가됩니다.
> - 상담·컨설팅 계약을 맺은 경우 계약에서 정한 기간 동안 개인정보를 보관할 수 있습니다.
> - 개인정보 파기 시 업종 등 자유 입력 정보와 유입 경로 정보도 함께 삭제합니다.
> 개정 방침 전문은 [개정 방침 보기](/privacy/2026-09-27)에서 확인하실 수 있습니다.

The date the notice is actually published must be on or before 2026-09-20 for the effective date to hold; if it slips, `PHASE_B_START` and both page routes move with it.

---

### Task 2: Migration 0011 — new columns, research view, retention-aware purge

**Files:**
- Create: `supabase/migrations/0011_result_enrichment.sql`

**Interfaces:**
- Produces: `assessments.result_fit`, `result_fit_at`, `revenue_band`, `growth_band`, `outcome_at`, `retain_until`, `retention_reason`, `retention_updated_by`, `retention_updated_at`; the `assessments_research` view; a replaced `purge_expired_personal_data()`.

- [ ] **Step 1: Write the migration**

```sql
-- Phase B of the result enrichment design: non-identifying outcome data
-- collected on the result page, plus operator-controlled retention for
-- contracted customers.
alter table assessments
  add column result_fit smallint check (result_fit between 1 and 5),
  add column result_fit_at timestamptz,
  add column revenue_band text check (
    revenue_band in ('pre_revenue', 'lt_100m', '100m_1b', '1b_5b', '5b_10b', 'gte_10b')
  ),
  add column growth_band text check (
    growth_band in ('decline', 'flat', '10_50', '50_100', 'gte_100', 'lt_1y')
  ),
  add column outcome_at timestamptz,
  -- Retention hold: while retain_until is in the future the daily purge
  -- leaves this row (and its consulting requests) alone.
  add column retain_until timestamptz,
  add column retention_reason text,
  add column retention_updated_by text,
  add column retention_updated_at timestamptz;

-- Statistics and methodology research run against this view, never the base
-- table, so identifying columns can't leak into an analysis by accident.
create view assessments_research as
select
  id, business_stage, business_stage_other, industry, team_size,
  score_value_raw, score_value_100, score_customer_raw, score_customer_100,
  score_offer_raw, score_offer_100, score_experience_raw, score_experience_100,
  score_process_raw, score_process_100, score_data_raw, score_data_100,
  score_scale_raw, score_scale_100, total_raw, architecture_level,
  bottleneck_1, bottleneck_2, bottleneck_3, strength_1, strength_2,
  consulting_requested, result_fit, revenue_band, growth_band, created_at
from assessments;

revoke all on assessments_research from anon, authenticated;

create or replace function purge_expired_personal_data()
returns void
language sql
security definer
set search_path = public
as $$
  -- Strip everything that identifies the person, including the free-text and
  -- campaign fields that could re-identify a small business. Coarse bands
  -- (revenue, growth, team size) stay: they are not identifying on their own.
  update assessments
  set name = null,
      email = null,
      company_name = null,
      role = null,
      marketing_consent = false,
      industry = null,
      utm_source = null,
      utm_medium = null,
      utm_campaign = null
  where coalesce(privacy_consent_at, created_at) < now() - interval '1 year'
    and (retain_until is null or retain_until < now())
    and (name is not null or email is not null or company_name is not null
         or role is not null or marketing_consent or industry is not null
         or utm_source is not null or utm_medium is not null
         or utm_campaign is not null);

  delete from consulting_requests
  where created_at < now() - interval '1 year'
    and assessment_id not in (
      select id from assessments where retain_until is not null and retain_until >= now()
    );

  delete from assessment_drafts
  where updated_at < now() - interval '30 days';
$$;

revoke execute on function purge_expired_personal_data() from public, anon, authenticated;
grant execute on function purge_expired_personal_data() to service_role;
```

- [ ] **Step 2: Tell the user to apply it**

Report: "`0011_result_enrichment.sql`을 Supabase SQL Editor에서 실행해주세요. Task 3부터 필요합니다." The pg_cron schedule from `0009` keeps pointing at the same function name, so nothing else needs rescheduling.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0011_result_enrichment.sql
git commit -m "feat: add Phase B columns, research view and retention-aware purge"
```

---

### Task 3: Result-fit and outcome API routes

**Files:**
- Create: `src/lib/assessments/outcome.schema.ts`
- Create: `src/app/api/assessments/[assessmentId]/feedback/route.ts`
- Create: `src/app/api/assessments/[assessmentId]/feedback/route.test.ts`
- Create: `src/app/api/assessments/[assessmentId]/outcome/route.ts`
- Create: `src/app/api/assessments/[assessmentId]/outcome/route.test.ts`

**Interfaces:**
- Consumes: `createServiceRoleSupabaseClient` (existing), `isPhaseBActive` (Task 1).
- Produces: `resultFitSchema`, `outcomeSchema`, `REVENUE_BANDS`, `GROWTH_BANDS`; `PATCH /api/assessments/[assessmentId]/feedback` → `200 { ok: true }`; `PATCH /api/assessments/[assessmentId]/outcome` → `200 { ok: true }` / `409` — consumed by Task 4.

- [ ] **Step 1: Create `src/lib/assessments/outcome.schema.ts`**

```ts
import { z } from "zod";

// Coarse bands only: they describe the business, not the person.
export const REVENUE_BANDS = [
  { value: "pre_revenue", label: "매출 전" },
  { value: "lt_100m", label: "1억 미만" },
  { value: "100m_1b", label: "1~10억" },
  { value: "1b_5b", label: "10~50억" },
  { value: "5b_10b", label: "50~100억" },
  { value: "gte_10b", label: "100억 이상" },
] as const;

export const GROWTH_BANDS = [
  { value: "decline", label: "감소" },
  { value: "flat", label: "정체(±10%)" },
  { value: "10_50", label: "10~50% 성장" },
  { value: "50_100", label: "50~100% 성장" },
  { value: "gte_100", label: "2배 이상" },
  { value: "lt_1y", label: "1년 미만 사업" },
] as const;

export type RevenueBand = (typeof REVENUE_BANDS)[number]["value"];
export type GrowthBand = (typeof GROWTH_BANDS)[number]["value"];

export const resultFitSchema = z.object({
  resultFit: z.number().int().min(1).max(5),
});

export const outcomeSchema = z
  .object({
    revenueBand: z.enum(REVENUE_BANDS.map((band) => band.value) as [RevenueBand, ...RevenueBand[]]).nullable(),
    growthBand: z.enum(GROWTH_BANDS.map((band) => band.value) as [GrowthBand, ...GrowthBand[]]).nullable(),
  })
  .refine((data) => data.revenueBand !== null || data.growthBand !== null, {
    message: "한 가지 이상 선택해주세요.",
  });

export function revenueBandLabel(value: string | null): string {
  return REVENUE_BANDS.find((band) => band.value === value)?.label ?? "-";
}

export function growthBandLabel(value: string | null): string {
  return GROWTH_BANDS.find((band) => band.value === value)?.label ?? "-";
}
```

- [ ] **Step 2: Write the failing feedback tests**

Create `src/app/api/assessments/[assessmentId]/feedback/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const isPhaseBActive = vi.fn(() => true);
vi.mock("@/lib/content/phase-b", () => ({
  isPhaseBActive: () => isPhaseBActive(),
  PHASE_B_START: "2026-09-27",
}));

const maybeSingle = vi.fn();
const eqSelect = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq: eqSelect }));
const eqUpdate = vi.fn().mockResolvedValue({ error: null });
const update = vi.fn(() => ({ eq: eqUpdate }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from: () => ({ select, update }) }),
}));

beforeEach(() => {
  isPhaseBActive.mockReturnValue(true);
  maybeSingle.mockReset().mockResolvedValue({ data: { id: "a1" }, error: null });
  update.mockClear();
  eqUpdate.mockClear();
});

const params = { params: Promise.resolve({ assessmentId: "a1" }) };

function patch(body: unknown) {
  return new Request("http://localhost", { method: "PATCH", body: JSON.stringify(body) });
}

describe("PATCH /api/assessments/[assessmentId]/feedback", () => {
  it("stores the rating with a timestamp", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(patch({ resultFit: 4 }), params);

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      result_fit: 4,
      result_fit_at: expect.any(String),
    });
    expect(eqUpdate).toHaveBeenCalledWith("id", "a1");
  });

  it("rejects a rating outside 1-5", async () => {
    const { PATCH } = await import("./route");

    expect((await PATCH(patch({ resultFit: 6 }), params)).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown assessment", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { PATCH } = await import("./route");

    expect((await PATCH(patch({ resultFit: 3 }), params)).status).toBe(404);
  });

  it("is closed before the policy revision takes effect", async () => {
    isPhaseBActive.mockReturnValue(false);
    const { PATCH } = await import("./route");

    expect((await PATCH(patch({ resultFit: 3 }), params)).status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `npx vitest run "src/app/api/assessments/[assessmentId]/feedback/route.test.ts"`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 4: Implement the feedback route**

```ts
import { NextResponse } from "next/server";
import { resultFitSchema } from "@/lib/assessments/outcome.schema";
import { isPhaseBActive } from "@/lib/content/phase-b";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ assessmentId: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  // Nothing new is collected until the revised policy is in force.
  if (!isPhaseBActive()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { assessmentId } = await params;
  const body = await request.json();
  const parsed = resultFitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data: assessment, error: fetchError } = await supabase
    .from("assessments")
    .select("id")
    .eq("id", assessmentId)
    .maybeSingle();

  if (fetchError) {
    console.error("result fit: assessment lookup failed", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("assessments")
    .update({ result_fit: parsed.data.resultFit, result_fit_at: new Date().toISOString() })
    .eq("id", assessmentId);

  if (error) {
    console.error("result fit: update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Run them to verify they pass**

Run: `npx vitest run "src/app/api/assessments/[assessmentId]/feedback/route.test.ts"`
Expected: PASS (4 tests)

- [ ] **Step 6: Write the failing outcome tests**

Create `src/app/api/assessments/[assessmentId]/outcome/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const isPhaseBActive = vi.fn(() => true);
vi.mock("@/lib/content/phase-b", () => ({
  isPhaseBActive: () => isPhaseBActive(),
  PHASE_B_START: "2026-09-27",
}));

const maybeSingle = vi.fn();
const eqSelect = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq: eqSelect }));
const eqUpdate = vi.fn().mockResolvedValue({ error: null });
const update = vi.fn(() => ({ eq: eqUpdate }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from: () => ({ select, update }) }),
}));

beforeEach(() => {
  isPhaseBActive.mockReturnValue(true);
  maybeSingle.mockReset().mockResolvedValue({ data: { id: "a1", outcome_at: null }, error: null });
  update.mockClear();
  eqUpdate.mockClear();
});

const params = { params: Promise.resolve({ assessmentId: "a1" }) };

function patch(body: unknown) {
  return new Request("http://localhost", { method: "PATCH", body: JSON.stringify(body) });
}

describe("PATCH /api/assessments/[assessmentId]/outcome", () => {
  it("stores the bands with a timestamp", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(patch({ revenueBand: "1b_5b", growthBand: "10_50" }), params);

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      revenue_band: "1b_5b",
      growth_band: "10_50",
      outcome_at: expect.any(String),
    });
  });

  it("accepts one band and leaves the other null", async () => {
    const { PATCH } = await import("./route");

    await PATCH(patch({ revenueBand: "pre_revenue", growthBand: null }), params);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ revenue_band: "pre_revenue", growth_band: null })
    );
  });

  it("rejects an empty submission", async () => {
    const { PATCH } = await import("./route");

    expect((await PATCH(patch({ revenueBand: null, growthBand: null }), params)).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects an unknown band code", async () => {
    const { PATCH } = await import("./route");

    expect((await PATCH(patch({ revenueBand: "huge", growthBand: null }), params)).status).toBe(400);
  });

  it("refuses a second submission", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: { id: "a1", outcome_at: "2026-09-27T01:00:00Z" },
      error: null,
    });
    const { PATCH } = await import("./route");

    expect((await PATCH(patch({ revenueBand: "lt_100m", growthBand: null }), params)).status).toBe(409);
    expect(update).not.toHaveBeenCalled();
  });

  it("is closed before the policy revision takes effect", async () => {
    isPhaseBActive.mockReturnValue(false);
    const { PATCH } = await import("./route");

    expect((await PATCH(patch({ revenueBand: "lt_100m", growthBand: null }), params)).status).toBe(404);
  });
});
```

- [ ] **Step 7: Run them to verify they fail**

Run: `npx vitest run "src/app/api/assessments/[assessmentId]/outcome/route.test.ts"`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 8: Implement the outcome route**

```ts
import { NextResponse } from "next/server";
import { outcomeSchema } from "@/lib/assessments/outcome.schema";
import { isPhaseBActive } from "@/lib/content/phase-b";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ assessmentId: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!isPhaseBActive()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { assessmentId } = await params;
  const body = await request.json();
  const parsed = outcomeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data: assessment, error: fetchError } = await supabase
    .from("assessments")
    .select("id, outcome_at")
    .eq("id", assessmentId)
    .maybeSingle();

  if (fetchError) {
    console.error("outcome: assessment lookup failed", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }
  // Write-once: the result URL is the only credential, so anyone holding it
  // could otherwise keep rewriting someone else's answers.
  if (assessment.outcome_at) {
    return NextResponse.json({ error: "이미 제출되었습니다." }, { status: 409 });
  }

  const { error } = await supabase
    .from("assessments")
    .update({
      revenue_band: parsed.data.revenueBand,
      growth_band: parsed.data.growthBand,
      outcome_at: new Date().toISOString(),
    })
    .eq("id", assessmentId);

  if (error) {
    console.error("outcome: update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 9: Run them to verify they pass**

Run: `npx vitest run "src/app/api/assessments/[assessmentId]/outcome/route.test.ts"`
Expected: PASS (6 tests)

- [ ] **Step 10: Typecheck, full suite, commit**

Run: `npm run typecheck && npm test`

```bash
git add src/lib/assessments/outcome.schema.ts "src/app/api/assessments/[assessmentId]/feedback" "src/app/api/assessments/[assessmentId]/outcome"
git commit -m "feat: add result-fit and outcome API routes behind the phase B gate"
```

---

### Task 4: Result page — fit chips and outcome card

**Files:**
- Create: `src/components/diagnose/ResultFeedback.tsx`
- Modify: `src/app/diagnose/result/[assessmentId]/page.tsx`

**Interfaces:**
- Consumes: `isPhaseBActive` (Task 1), `REVENUE_BANDS`, `GROWTH_BANDS` (Task 3), the two API routes (Task 3), `ChipGroup` (existing), `trackEvent` (existing).
- Produces: the fit + outcome UI, rendered above the consult CTA.

- [ ] **Step 1: Add the GA4 event names**

In `src/lib/analytics/events.ts`, add to the union and the comment list:

```ts
  | "radar_result_feedback"
  | "radar_outcome_submit"
```

with the comments `//   radar_result_feedback  -> result page: 결과 적합도 선택` and `//   radar_outcome_submit   -> result page: 성과 구간 제출`.

- [ ] **Step 2: Create `src/components/diagnose/ResultFeedback.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { trackEvent } from "@/lib/analytics/ga4";
import {
  GROWTH_BANDS,
  REVENUE_BANDS,
  type GrowthBand,
  type RevenueBand,
} from "@/lib/assessments/outcome.schema";

const FIT_OPTIONS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

export function ResultFeedback({ assessmentId }: { assessmentId: string }) {
  const [fit, setFit] = useState("");
  const [fitSaved, setFitSaved] = useState(false);
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [revenueBand, setRevenueBand] = useState<RevenueBand | "">("");
  const [growthBand, setGrowthBand] = useState<GrowthBand | "">("");
  const [outcomeSaved, setOutcomeSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveFit(value: string) {
    setFit(value);
    setError(null);

    const response = await fetch(`/api/assessments/${assessmentId}/feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resultFit: Number(value) }),
    });

    if (!response.ok) {
      setError("의견을 저장하지 못했습니다.");
      return;
    }

    trackEvent("radar_result_feedback");
    setFitSaved(true);
  }

  async function saveOutcome() {
    setError(null);

    if (!revenueBand && !growthBand) {
      setError("한 가지 이상 선택해주세요.");
      return;
    }

    const response = await fetch(`/api/assessments/${assessmentId}/outcome`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        revenueBand: revenueBand || null,
        growthBand: growthBand || null,
      }),
    });

    if (!response.ok) {
      setError("저장하지 못했습니다.");
      return;
    }

    trackEvent("radar_outcome_submit");
    setOutcomeSaved(true);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-slate-200 p-5 print:hidden">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-slate-900">
          이 진단 결과가 실제 상황과 맞나요?
        </p>
        <ChipGroup
          name="resultFit"
          label="결과 적합도"
          options={FIT_OPTIONS}
          value={fit}
          onChange={saveFit}
          size="sm"
        />
        <p className="text-xs text-slate-500">1 전혀 다르다 · 5 매우 정확하다</p>
        {fitSaved && (
          <p className="text-xs text-emerald-600">
            의견 감사합니다. 다음 진단을 개선하는 데 쓰입니다.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
        {outcomeSaved ? (
          <p className="text-sm text-emerald-600">알려주셔서 감사합니다.</p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setOutcomeOpen((open) => !open)}
              className="w-fit text-sm font-semibold text-indigo-600"
            >
              더 정확한 분석을 위해 알려주세요 (선택) {outcomeOpen ? "▴" : "▾"}
            </button>

            {outcomeOpen && (
              <div className="flex flex-col gap-4">
                <p className="text-xs leading-relaxed text-slate-500">
                  선택 입력이며 입력하지 않아도 불이익은 없습니다. 진단 정확도 향상과 통계에
                  쓰이며, 개인정보에 동의하신 경우 이름·이메일과 함께 보관되다가 1년 후 식별
                  정보가 삭제됩니다.
                </p>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-slate-600">연 매출</span>
                  <ChipGroup
                    name="revenueBand"
                    label="연 매출"
                    options={[...REVENUE_BANDS]}
                    value={revenueBand}
                    onChange={setRevenueBand}
                    size="sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-slate-600">
                    최근 12개월 매출 변화
                  </span>
                  <ChipGroup
                    name="growthBand"
                    label="최근 12개월 매출 변화"
                    options={[...GROWTH_BANDS]}
                    value={growthBand}
                    onChange={setGrowthBand}
                    size="sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={saveOutcome}
                  className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  안내를 확인했으며 제출합니다
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </section>
  );
}
```

`ChipGroup`'s `options` prop is `{ value: T; label: string }[]`, so the `as const` band arrays are spread into a mutable array; its `onChange` gives back the typed value.

- [ ] **Step 3: Render it on the result page**

In `src/app/diagnose/result/[assessmentId]/page.tsx`, add the imports:

```ts
import { ResultFeedback } from "@/components/diagnose/ResultFeedback";
import { isPhaseBActive } from "@/lib/content/phase-b";
```

and render it immediately before the CTA `<section className="flex flex-col gap-3 print:hidden">`:

```tsx
      {isPhaseBActive() && <ResultFeedback assessmentId={assessmentId} />}
```

- [ ] **Step 4: Verify both sides of the gate**

Run `npm run typecheck && npm test`, then with `npm run dev` and an assessment id:

```bash
curl -s http://localhost:3000/diagnose/result/<id> | grep -c "실제 상황과 맞나요"
```

Expected: `0` today (before the effective date). Then temporarily edit `PHASE_B_START` in `src/lib/content/phase-b.ts` to a past date, repeat, expect `1`, exercise the chips in a browser, and **restore the constant to `2026-09-27`** before committing (confirm with `git diff src/lib/content/phase-b.ts` showing no change).

- [ ] **Step 5: Commit**

```bash
git add src/components/diagnose/ResultFeedback.tsx "src/app/diagnose/result/[assessmentId]/page.tsx" src/lib/analytics/events.ts
git commit -m "feat: collect result fit and outcome bands on the result page"
```

---

### Task 5: Team size as bands

**Files:**
- Create: `src/lib/content/team-size.ts`
- Create: `src/lib/content/team-size.test.ts`
- Modify: `src/app/diagnose/page.tsx`
- Modify: `src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx`

**Interfaces:**
- Produces: `TEAM_SIZE_BANDS`, `formatTeamSize(value: string | null): string` — consumed by the diagnose form and the admin detail page.

- [ ] **Step 1: Write the failing test**

Create `src/lib/content/team-size.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatTeamSize, TEAM_SIZE_BANDS } from "./team-size";

describe("formatTeamSize", () => {
  it("labels a band code", () => {
    expect(formatTeamSize("6_20")).toBe("6~20명");
  });

  it("shows legacy free text as it was entered", () => {
    expect(formatTeamSize("대표 포함 4명")).toBe("대표 포함 4명");
  });

  it("falls back to a dash when nothing was entered", () => {
    expect(formatTeamSize(null)).toBe("-");
  });

  it("offers six bands", () => {
    expect(TEAM_SIZE_BANDS).toHaveLength(6);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/content/team-size.test.ts`
Expected: FAIL — `Cannot find module './team-size'`

- [ ] **Step 3: Implement `src/lib/content/team-size.ts`**

```ts
// Stored in the existing assessments.team_size column. Rows created before
// this change hold free text, so formatting falls back to the raw value.
export const TEAM_SIZE_BANDS = [
  { value: "solo", label: "1명" },
  { value: "2_5", label: "2~5명" },
  { value: "6_20", label: "6~20명" },
  { value: "21_50", label: "21~50명" },
  { value: "51_200", label: "51~200명" },
  { value: "gt_200", label: "200명 이상" },
] as const;

export type TeamSizeBand = (typeof TEAM_SIZE_BANDS)[number]["value"];

export function formatTeamSize(value: string | null): string {
  if (!value) {
    return "-";
  }

  return TEAM_SIZE_BANDS.find((band) => band.value === value)?.label ?? value;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/content/team-size.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Swap the diagnose form input for chips**

In `src/app/diagnose/page.tsx`, add `import { TEAM_SIZE_BANDS } from "@/lib/content/team-size";` and replace the team-size `<label>` block (the one whose span reads `팀 규모 (선택)`, currently an `<input value={teamSize} …>`) with:

```tsx
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-700">팀 규모 (선택)</span>
          <ChipGroup
            name="teamSize"
            label="팀 규모"
            options={[...TEAM_SIZE_BANDS]}
            value={teamSize}
            onChange={setTeamSize}
          />
        </div>
```

The `teamSize` state stays a string, so the submit payload is unchanged.

- [ ] **Step 6: Label the band in the admin**

In `src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx`, add `import { formatTeamSize } from "@/lib/content/team-size";` and change the field row from `["팀 규모", assessment.team_size ?? "-"]` to `["팀 규모", formatTeamSize(assessment.team_size)]`.

- [ ] **Step 7: Verify and commit**

Run `npm run typecheck && npm test`, then with `npm run dev` open `/diagnose` and confirm 팀 규모 is now chips and a diagnosis still submits.

```bash
git add src/lib/content/team-size.ts src/lib/content/team-size.test.ts src/app/diagnose/page.tsx "src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx"
git commit -m "feat: collect team size as a band instead of free text"
```

---

### Task 6: Retention control

**Files:**
- Create: `src/lib/assessments/retention.ts`
- Create: `src/lib/assessments/retention.test.ts`
- Create: `src/app/api/admin/assessments/[assessmentId]/retention/route.ts`
- Create: `src/app/api/admin/assessments/[assessmentId]/retention/route.test.ts`
- Create: `src/app/api/admin/assessments/[assessmentId]/purge/route.ts`
- Create: `src/app/api/admin/assessments/[assessmentId]/purge/route.test.ts`
- Create: `src/components/admin/RetentionCard.tsx`
- Modify: `src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx`

**Interfaces:**
- Consumes: `getCurrentOperator` (existing), `createServiceRoleSupabaseClient` (existing), `Modal`/`ConfirmDialog`/`ChipGroup` (existing).
- Produces: `retentionUntil(amount: number, unit: "days" | "months" | "years", from?: Date): string`, `retentionSchema`; `PUT /api/admin/assessments/[assessmentId]/retention` → `200 { retainUntil }` / `{ reset: true }` → `200 { retainUntil: null }`; `POST /api/admin/assessments/[assessmentId]/purge` → `200 { ok: true }`.

- [ ] **Step 1: Write the failing date-math test**

Create `src/lib/assessments/retention.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { retentionUntil } from "./retention";

const from = new Date("2026-09-20T00:00:00Z");

describe("retentionUntil", () => {
  it("adds days", () => {
    expect(retentionUntil(10, "days", from)).toBe("2026-09-30T00:00:00.000Z");
  });

  it("adds months", () => {
    expect(retentionUntil(6, "months", from)).toBe("2027-03-20T00:00:00.000Z");
  });

  it("adds years", () => {
    expect(retentionUntil(2, "years", from)).toBe("2028-09-20T00:00:00.000Z");
  });

  it("clamps a month-end that the target month doesn't have", () => {
    // 2026-08-31 + 6 months would overflow into March; stay in February.
    expect(retentionUntil(6, "months", new Date("2026-08-31T00:00:00Z"))).toBe(
      "2027-02-28T00:00:00.000Z"
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/assessments/retention.test.ts`
Expected: FAIL — `Cannot find module './retention'`

- [ ] **Step 3: Implement `src/lib/assessments/retention.ts`**

```ts
import { z } from "zod";

export const RETENTION_UNITS = [
  { value: "days", label: "일" },
  { value: "months", label: "개월" },
  { value: "years", label: "년" },
] as const;

export type RetentionUnit = (typeof RETENTION_UNITS)[number]["value"];

export const retentionSchema = z.union([
  z.object({ reset: z.literal(true) }),
  z.object({
    amount: z.number().int().min(1).max(120),
    unit: z.enum(["days", "months", "years"]),
    // Required: keeping personal data past the published retention needs a
    // reason someone can audit later.
    reason: z.string().min(1).max(500),
  }),
]);

export function retentionUntil(
  amount: number,
  unit: RetentionUnit,
  from: Date = new Date()
): string {
  const until = new Date(from.getTime());

  if (unit === "days") {
    until.setUTCDate(until.getUTCDate() + amount);
    return until.toISOString();
  }

  const months = unit === "months" ? amount : amount * 12;
  const day = until.getUTCDate();
  until.setUTCDate(1);
  until.setUTCMonth(until.getUTCMonth() + months);
  // setUTCMonth would roll 31 Aug + 6 months into March; clamp to the last
  // day the target month actually has.
  const lastDay = new Date(
    Date.UTC(until.getUTCFullYear(), until.getUTCMonth() + 1, 0)
  ).getUTCDate();
  until.setUTCDate(Math.min(day, lastDay));

  return until.toISOString();
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/assessments/retention.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Write the failing retention route tests**

Create `src/app/api/admin/assessments/[assessmentId]/retention/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentOperator = vi.fn();
vi.mock("@/lib/operators/get-current-operator", () => ({
  getCurrentOperator: () => getCurrentOperator(),
}));

const eqUpdate = vi.fn().mockResolvedValue({ error: null });
const update = vi.fn(() => ({ eq: eqUpdate }));
vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from: () => ({ update }) }),
}));

beforeEach(() => {
  getCurrentOperator.mockReset();
  update.mockClear();
  eqUpdate.mockClear();
});

const params = { params: Promise.resolve({ assessmentId: "a1" }) };

function put(body: unknown) {
  return new Request("http://localhost", { method: "PUT", body: JSON.stringify(body) });
}

describe("PUT /api/admin/assessments/[assessmentId]/retention", () => {
  it("returns 403 without an operator session", async () => {
    getCurrentOperator.mockResolvedValueOnce(null);
    const { PUT } = await import("./route");

    expect((await PUT(put({ amount: 6, unit: "months", reason: "계약" }), params)).status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it("sets the hold with the operator and reason", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { PUT } = await import("./route");

    const response = await PUT(
      put({ amount: 6, unit: "months", reason: "2026 하반기 컨설팅 계약" }),
      params
    );

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        retain_until: expect.any(String),
        retention_reason: "2026 하반기 컨설팅 계약",
        retention_updated_by: "staff@ylia.io",
        retention_updated_at: expect.any(String),
      })
    );
    expect(eqUpdate).toHaveBeenCalledWith("id", "a1");
  });

  it("rejects a hold without a reason", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { PUT } = await import("./route");

    expect((await PUT(put({ amount: 6, unit: "months", reason: "" }), params)).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("clears the hold on reset", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { PUT } = await import("./route");

    const response = await PUT(put({ reset: true }), params);

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      retain_until: null,
      retention_reason: null,
      retention_updated_by: "staff@ylia.io",
      retention_updated_at: expect.any(String),
    });
  });
});
```

- [ ] **Step 6: Run them to verify they fail**

Run: `npx vitest run "src/app/api/admin/assessments/[assessmentId]/retention/route.test.ts"`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 7: Implement the retention route**

```ts
import { NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { retentionSchema, retentionUntil } from "@/lib/assessments/retention";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ assessmentId: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  const operator = await getCurrentOperator();

  if (!operator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { assessmentId } = await params;
  const body = await request.json();
  const parsed = retentionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const now = new Date().toISOString();
  const patch =
    "reset" in parsed.data
      ? {
          retain_until: null,
          retention_reason: null,
          retention_updated_by: operator.email,
          retention_updated_at: now,
        }
      : {
          retain_until: retentionUntil(parsed.data.amount, parsed.data.unit),
          retention_reason: parsed.data.reason,
          retention_updated_by: operator.email,
          retention_updated_at: now,
        };

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("assessments").update(patch).eq("id", assessmentId);

  if (error) {
    console.error("retention: update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ retainUntil: patch.retain_until });
}
```

- [ ] **Step 8: Run them to verify they pass**

Run: `npx vitest run "src/app/api/admin/assessments/[assessmentId]/retention/route.test.ts"`
Expected: PASS (4 tests)

- [ ] **Step 9: Write the failing purge route tests**

Create `src/app/api/admin/assessments/[assessmentId]/purge/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentOperator = vi.fn();
vi.mock("@/lib/operators/get-current-operator", () => ({
  getCurrentOperator: () => getCurrentOperator(),
}));

const eqUpdate = vi.fn().mockResolvedValue({ error: null });
const update = vi.fn(() => ({ eq: eqUpdate }));
const eqDelete = vi.fn().mockResolvedValue({ error: null });
const del = vi.fn(() => ({ eq: eqDelete }));
vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({
    from: (table: string) =>
      table === "assessments" ? { update } : { delete: del },
  }),
}));

beforeEach(() => {
  getCurrentOperator.mockReset();
  update.mockClear();
  eqUpdate.mockClear();
  del.mockClear();
  eqDelete.mockClear();
});

const params = { params: Promise.resolve({ assessmentId: "a1" }) };

describe("POST /api/admin/assessments/[assessmentId]/purge", () => {
  it("returns 403 without an operator session", async () => {
    getCurrentOperator.mockResolvedValueOnce(null);
    const { POST } = await import("./route");

    expect((await POST(new Request("http://localhost"), params)).status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it("nulls every identifying field and clears the retention hold", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost"), params);

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      name: null,
      email: null,
      company_name: null,
      role: null,
      marketing_consent: false,
      industry: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      retain_until: null,
      retention_reason: null,
      retention_updated_by: "staff@ylia.io",
      retention_updated_at: expect.any(String),
    });
    expect(eqUpdate).toHaveBeenCalledWith("id", "a1");
  });

  it("deletes the assessment's consulting requests", async () => {
    getCurrentOperator.mockResolvedValueOnce({ id: "u1", email: "staff@ylia.io", role: "staff" });
    const { POST } = await import("./route");

    await POST(new Request("http://localhost"), params);

    expect(del).toHaveBeenCalled();
    expect(eqDelete).toHaveBeenCalledWith("assessment_id", "a1");
  });
});
```

- [ ] **Step 10: Run them to verify they fail**

Run: `npx vitest run "src/app/api/admin/assessments/[assessmentId]/purge/route.test.ts"`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 11: Implement the purge route**

```ts
import { NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type RouteParams = { params: Promise<{ assessmentId: string }> };

// Same effect as the nightly purge, on demand: used when a customer asks for
// deletion or a contract ends early.
export async function POST(_request: Request, { params }: RouteParams) {
  const operator = await getCurrentOperator();

  if (!operator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { assessmentId } = await params;
  const supabase = createServiceRoleSupabaseClient();

  const { error: requestsError } = await supabase
    .from("consulting_requests")
    .delete()
    .eq("assessment_id", assessmentId);

  if (requestsError) {
    console.error("manual purge: deleting consulting requests failed", requestsError);
    return NextResponse.json({ error: requestsError.message }, { status: 500 });
  }

  const { error } = await supabase
    .from("assessments")
    .update({
      name: null,
      email: null,
      company_name: null,
      role: null,
      marketing_consent: false,
      industry: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      retain_until: null,
      retention_reason: null,
      retention_updated_by: operator.email,
      retention_updated_at: new Date().toISOString(),
    })
    .eq("id", assessmentId);

  if (error) {
    console.error("manual purge: update failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 12: Run them to verify they pass**

Run: `npx vitest run "src/app/api/admin/assessments/[assessmentId]/purge/route.test.ts"`
Expected: PASS (3 tests)

- [ ] **Step 13: Create `src/components/admin/RetentionCard.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./Modal";
import { ConfirmDialog } from "./ConfirmDialog";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { RETENTION_UNITS, type RetentionUnit } from "@/lib/assessments/retention";

export function RetentionCard({
  assessmentId,
  hasPersonalData,
  defaultPurgeAt,
  retainUntil,
  retentionReason,
  retentionUpdatedBy,
  retentionUpdatedAt,
}: {
  assessmentId: string;
  hasPersonalData: boolean;
  defaultPurgeAt: string;
  retainUntil: string | null;
  retentionReason: string | null;
  retentionUpdatedBy: string | null;
  retentionUpdatedAt: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState("6");
  const [unit, setUnit] = useState<RetentionUnit>("months");
  const [reason, setReason] = useState(retentionReason ?? "");
  const [confirmingPurge, setConfirmingPurge] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(body: unknown, path: "retention" | "purge") {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/admin/assessments/${assessmentId}/${path}`, {
      method: path === "retention" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: path === "retention" ? JSON.stringify(body) : undefined,
    });
    setBusy(false);

    if (!response.ok) {
      setError("처리하지 못했습니다. 다시 시도해주세요.");
      return false;
    }

    setEditing(false);
    setConfirmingPurge(false);
    router.refresh();
    return true;
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-5 text-sm">
      <p className="font-semibold text-slate-900">정보 보관</p>

      {!hasPersonalData ? (
        <p className="text-slate-500">개인정보 없음 (익명 진단이거나 이미 파기됨)</p>
      ) : retainUntil ? (
        <div className="flex flex-col gap-1 text-slate-600">
          <p>
            연장 보관 ·{" "}
            <span className="font-medium text-slate-900">
              {new Date(retainUntil).toLocaleDateString("ko-KR")}까지 유지
            </span>
          </p>
          <p className="text-xs">사유: {retentionReason}</p>
          <p className="text-xs text-slate-400">
            설정 {retentionUpdatedBy} ·{" "}
            {retentionUpdatedAt ? new Date(retentionUpdatedAt).toLocaleString("ko-KR") : ""}
          </p>
        </div>
      ) : (
        <p className="text-slate-600">
          기본 정책 ·{" "}
          <span className="font-medium text-slate-900">
            {new Date(defaultPurgeAt).toLocaleDateString("ko-KR")}
          </span>{" "}
          개인정보 파기 예정
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {hasPersonalData && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700"
          >
            {retainUntil ? "보관 기간 수정" : "보관 기간 설정"}
          </button>
          {retainUntil && (
            <button
              type="button"
              onClick={() => send({ reset: true }, "retention")}
              disabled={busy}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
            >
              기본 정책으로 되돌리기
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmingPurge(true)}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-red-600"
          >
            개인정보 지금 삭제
          </button>
        </div>
      )}

      <Modal open={editing} onClose={() => setEditing(false)} title="보관 기간 설정" size="sm">
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-end gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">기간</span>
              <input
                type="number"
                min={1}
                max={120}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-24 rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">단위</span>
              <ChipGroup
                name="retentionUnit"
                label="보관 기간 단위"
                options={[...RETENTION_UNITS]}
                value={unit}
                onChange={setUnit}
                size="sm"
              />
            </div>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-600">사유 *</span>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 2026 하반기 컨설팅 계약 (재진단 예정)"
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <p className="text-xs text-slate-500">
            오늘부터 계산합니다. 계약 등으로 고객이 보관 사실을 알고 있어야 합니다.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              취소
            </button>
            <button
              type="button"
              disabled={busy || !reason.trim() || !amount}
              onClick={() =>
                send({ amount: Number(amount), unit, reason: reason.trim() }, "retention")
              }
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              저장
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmingPurge}
        title="개인정보 삭제"
        message="이름·이메일·회사명·역할·업종·유입 경로와 이 진단의 상담 신청을 즉시 삭제합니다. 진단 점수는 통계용으로 남습니다. 되돌릴 수 없습니다."
        confirmLabel="삭제"
        busy={busy}
        onConfirm={() => send(null, "purge")}
        onCancel={() => setConfirmingPurge(false)}
      />
    </div>
  );
}
```

- [ ] **Step 14: Render the card on the admin detail page**

In `src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx`, add:

```ts
import { RetentionCard } from "@/components/admin/RetentionCard";
import { isPhaseBActive } from "@/lib/content/phase-b";
```

and render it after the field grid, before the "고객 결과 화면 보기" button:

```tsx
      {isPhaseBActive() && (
        <RetentionCard
          assessmentId={assessment.id}
          hasPersonalData={assessment.email !== null || assessment.name !== null}
          defaultPurgeAt={new Date(
            new Date(assessment.privacy_consent_at ?? assessment.created_at).getTime() +
              365 * 24 * 60 * 60 * 1000
          ).toISOString()}
          retainUntil={assessment.retain_until}
          retentionReason={assessment.retention_reason}
          retentionUpdatedBy={assessment.retention_updated_by}
          retentionUpdatedAt={assessment.retention_updated_at}
        />
      )}
```

- [ ] **Step 15: Extend `AssessmentInsertRow`'s row type**

In `src/lib/assessments/get-assessment.ts`, widen `AssessmentRow` so the new columns are typed:

```ts
export type AssessmentRow = AssessmentInsertRow & {
  id: string;
  created_at: string;
  result_fit: number | null;
  result_fit_at: string | null;
  revenue_band: string | null;
  growth_band: string | null;
  outcome_at: string | null;
  retain_until: string | null;
  retention_reason: string | null;
  retention_updated_by: string | null;
  retention_updated_at: string | null;
};
```

- [ ] **Step 16: Typecheck, test, build, commit**

Run: `npm run typecheck && npm test && npm run build`

```bash
git add src/lib/assessments/retention.ts src/lib/assessments/retention.test.ts "src/app/api/admin/assessments" src/components/admin/RetentionCard.tsx "src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx" src/lib/assessments/get-assessment.ts
git commit -m "feat: let operators hold or purge an assessment's personal data"
```

---

### Task 7: Consent notice, admin fields, README, and verification

**Files:**
- Modify: `src/lib/content/privacy-notice.ts`
- Modify: `src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx`
- Modify: `README.md`

- [ ] **Step 1: Update the consent notice**

In `src/lib/content/privacy-notice.ts`:

- `PRIVACY_NOTICE_VERSION` → `"2026-09-27"`
- `summary` → `"목적: 결과 PDF 발송·상담 안내·진단 정확도 향상 / 필수: 이름·이메일 / 선택: 회사명·역할 / 보유: 수집일로부터 1년"`
- `itemsCollected` → `"필수항목: 이름, 이메일 주소\n선택항목: 회사/브랜드명, 역할\n선택항목(결과 화면에서 입력 시): 연 매출·최근 12개월 성장 구간"`
- `purpose` → append ` 또한 입력하신 진단 정보와 성과 구간은 진단 정확도 향상 및 통계 분석에 이용합니다.`

Leave `retentionPeriod` and `refusalNotice` unchanged.

- [ ] **Step 2: Show the new fields in the admin**

In `src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx`, add `import { growthBandLabel, revenueBandLabel } from "@/lib/assessments/outcome.schema";` and add three rows to the `fields` array, after the `["마케팅 동의", …]` row:

```ts
    ["결과 적합도", assessment.result_fit ? `${assessment.result_fit} / 5` : "-"],
    ["연 매출", revenueBandLabel(assessment.revenue_band)],
    ["최근 12개월 성장", growthBandLabel(assessment.growth_band)],
```

- [ ] **Step 3: Update `README.md`**

Migration range → `(0001-0011)`. In the Admin panel section, add to the `/admin/assessments` bullet: "Each assessment's detail page also carries a 정보 보관 card: hold the personal data past the default year with a required reason, revert to the default, or delete it now." In the Setup notes about the purge, add that rows with a retention hold are skipped and that `industry`/UTM are cleared alongside name and email. Add a line: "`assessments_research` is the view to use for statistics — it excludes name, email, company and role."

- [ ] **Step 4: Verify against the real database**

With `npm run dev` running and migration 0011 applied, using `.env.local` credentials:

1. Create an assessment via `POST /api/assessments` with consent, name and email.
2. `PATCH /api/assessments/<id>/feedback` with `{"resultFit":4}` → expect `404` today (gate closed). Temporarily set `PHASE_B_START` to a past date, restart dev, repeat → `200`; confirm `result_fit` in Supabase.
3. `PATCH /api/assessments/<id>/outcome` with `{"revenueBand":"1b_5b","growthBand":"10_50"}` → `200`; repeat → `409`.
4. Log in as an operator, `PUT /api/admin/assessments/<id>/retention` with `{"amount":6,"unit":"months","reason":"테스트"}` → `200`; confirm `retain_until` ~6 months out.
5. Run `select purge_expired_personal_data();` via the REST RPC after back-dating that row's `privacy_consent_at` to two years ago: confirm the row is **not** anonymized while the hold stands; clear the hold with `{"reset":true}`, run again, confirm name/email/industry/UTM are now null and the score columns survive.
6. `POST /api/admin/assessments/<id>/purge` on a second consented row → confirm the same fields are nulled immediately and its consulting requests are gone.
7. Confirm `/privacy` still shows the 2026-09-19 policy and `/privacy/2026-09-27` shows the revised one.
8. Restore `PHASE_B_START` to `2026-09-27` and confirm `git diff src/lib/content/phase-b.ts` is empty.
9. Delete every assessment created during verification.

Report each check's outcome.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/privacy-notice.ts "src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx" README.md
git commit -m "docs: update the consent notice and admin fields for phase B"
```

---

## Self-Review Notes

- **Spec coverage:** B1 → Tasks 3, 4; B2 → Task 5; B3 → Tasks 2, 6; B4 → Task 2; B5 → Tasks 1, 7; B6 → Task 2; B7 (date gate) → Task 1, applied in Tasks 3, 4, 6; B8 → Tasks 6, 7; B9 (GA4 events) → Task 4.
- **Placeholder scan:** no TBD/TODO; every Korean string and SQL statement is written out.
- **Type consistency:** `PHASE_B_START`/`isPhaseBActive` are defined once (Task 1) and imported everywhere. Band codes exist once in `outcome.schema.ts` (Task 3) and `team-size.ts` (Task 5), and the SQL `check` constraints in Task 2 list the same strings. `retentionUntil`/`retentionSchema` live in `retention.ts` (Task 6) and are used by that task's route only. `AssessmentRow` gains the new columns in Task 6 Step 15, which is what Tasks 6-7's admin code reads.
- **Ordering:** Task 1 ships the policy and starts the 7-day clock; Task 2 asks the user to apply the migration; Tasks 3-7 need it applied. Nothing before the effective date changes what a visitor sees, so the whole set can deploy as it lands.
- **Known deviation:** the purge's consulting-request delete uses a `not in (select …)` subquery rather than a join, matching the plain-SQL style of `0009`.
