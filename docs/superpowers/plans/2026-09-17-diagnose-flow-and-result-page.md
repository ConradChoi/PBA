# /diagnose Flow + Result Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the basic-info step, the 28-question wizard (7 layers × 4 questions, server-persisted so it survives a reload), and the 1-page result screen (Radar chart + interpretation) that the landing page's CTA currently 404s on.

**Architecture:** A new `assessment_drafts` table (service_role-only, no anon access) holds in-progress work, keyed by `draftId` in the URL. `POST /api/assessment-drafts` creates one from the basic-info step; `PATCH /api/assessment-drafts/[draftId]` saves one layer's answers at a time; `POST /api/assessment-drafts/[draftId]/complete` runs the existing scoring engine, inserts the finished row into `assessments`, and deletes the draft. The result page is keyed by the real `assessments.id` and fetched read-only via a shared `getAssessmentById` used by both `GET /api/assessments/[assessmentId]` and the result page's Server Component. All interpretation copy (level descriptions, bottleneck/strength messages, 90-day actions, question text, the privacy notice) lives in `src/lib/content/*`, transcribed verbatim from the requirements spec where it exists, or a visibly marked `[카피 필요: ...]` placeholder where it doesn't.

**Tech Stack:** Next.js 15 App Router, Zod, `@supabase/supabase-js`, Vitest (existing) + `chart.js` + `react-chartjs-2` (new).

**Spec:** `docs/superpowers/specs/2026-09-17-diagnose-flow-and-result-design.md` (design spec — read this first; it explains and justifies every decision below) and `data/PBA_7Layer_business_radar_requirements.md` (product spec, sections 4-15, 21, 22, 26).

## Global Constraints

- No anonymous diagnosis: `name`, `email`, and `privacyConsent` (must be `true`) are required on every submission — see design spec Decision 5. This reverses the original product spec's "익명 진단 옵션"; do not re-add an optional-consent branch.
- Every Supabase write goes through a server route using `service_role`. `anon` never reads or writes `assessments` or `assessment_drafts` directly (design spec section A).
- `QuestionWizard` only moves forward — no "이전" button to edit a completed layer in this plan.
- Both result-page CTAs ("PDF 받기"/"상담하기") are always enabled — there's no consent-based disabled state to build.
- Placeholder copy (`[카피 필요: ...]`) is intentional, not a bug — see design spec section D. Don't invent copy to fill it in.
- Score formula, Architecture Level bands, and bottleneck tie-break order are already implemented and tested (`src/lib/scoring/*`) — reuse, don't reimplement.

---

### Task 1: Supabase migrations (consent tracking + assessment_drafts)

**Files:**
- Create: `supabase/migrations/0002_add_consent_tracking.sql`
- Create: `supabase/migrations/0003_assessment_drafts.sql`

**Interfaces:**
- Produces: `assessments.privacy_consent_at`, `assessments.privacy_notice_version` columns; the `assessment_drafts` table — consumed by every task below that touches either table.

- [ ] **Step 1: Create `supabase/migrations/0002_add_consent_tracking.sql`**

```sql
-- Adds consent record-keeping to assessments and removes the now-unused
-- anon insert policy (all writes go through server routes with service_role).
alter table assessments add column privacy_consent_at timestamptz;
alter table assessments add column privacy_notice_version text not null default '2026-09-17';

drop policy if exists "anon can insert assessments" on assessments;
drop policy if exists "service role full access assessments" on assessments;
create policy "service role full access assessments"
  on assessments for all
  to service_role
  using (true) with check (true);
```

- [ ] **Step 2: Create `supabase/migrations/0003_assessment_drafts.sql`**

```sql
-- In-progress diagnosis state, keyed by draftId in the URL. No RLS policy
-- is granted to anon/authenticated: with RLS enabled and zero policies,
-- those roles get zero access. Only service_role (which bypasses RLS in
-- Supabase) can read/write this table — all client access goes through
-- /api/assessment-drafts routes.
create table assessment_drafts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  basic_info jsonb not null,
  answers jsonb not null default '{}'::jsonb,
  current_step smallint not null default 0,
  privacy_consent boolean not null default false,
  marketing_consent boolean not null default false,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

alter table assessment_drafts enable row level security;
```

- [ ] **Step 3: Tell the user to apply both migrations**

These need a live Supabase project (the user's `service_role` key, already in `.env.local`, isn't enough — migrations run via the Supabase SQL editor or CLI, not the app). Report to the user: "`0002_add_consent_tracking.sql`와 `0003_assessment_drafts.sql`을 Supabase SQL Editor에서 순서대로 실행해주세요." Do not proceed to Task 9 (the first task that reads/writes `assessment_drafts`) until they confirm it's applied — earlier tasks (2-8) don't touch the database and can proceed without waiting.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0002_add_consent_tracking.sql supabase/migrations/0003_assessment_drafts.sql
git commit -m "feat: add consent tracking columns and assessment_drafts table"
```

---

### Task 2: Domain types for drafts

**Files:**
- Modify: `src/lib/types/assessment.ts`

**Interfaces:**
- Produces: `DraftAnswers`, `AssessmentDraftRow` — consumed by Tasks 6, 8, 9, 10, 11.

- [ ] **Step 1: Add draft types to `src/lib/types/assessment.ts`**

Append to the end of the file:

```ts

export type DraftAnswers = Partial<LayerAnswers>;

export type AssessmentDraftRow = {
  id: string;
  created_at: string;
  updated_at: string;
  basic_info: BasicInfo;
  answers: DraftAnswers;
  current_step: number;
  privacy_consent: boolean;
  marketing_consent: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors (these are additive types, nothing consumes them yet).

- [ ] **Step 3: Commit**

```bash
git add src/lib/types/assessment.ts
git commit -m "feat: add draft domain types"
```

---

### Task 3: Content config — verbatim spec copy (Architecture Level, Bottleneck, Action Library, Questions)

**Files:**
- Create: `src/lib/content/architecture-level-copy.ts`
- Create: `src/lib/content/bottleneck-copy.ts`
- Create: `src/lib/content/action-library.ts`
- Create: `src/lib/content/questions.ts`
- Create: `src/lib/content/content.test.ts`

**Interfaces:**
- Produces: `ARCHITECTURE_LEVEL_COPY`, `BOTTLENECK_COPY`, `ACTION_LIBRARY`, `QUESTIONS` — consumed by Task 4 (`summary.ts`) and Tasks 12-13 (question wizard, result page).

- [ ] **Step 1: Create `src/lib/content/architecture-level-copy.ts`**

```ts
import type { ArchitectureLevel } from "../types/assessment";

export const ARCHITECTURE_LEVEL_COPY: Record<ArchitectureLevel, string> = {
  SYSTEMIZED:
    "사업 구조가 상당히 체계화되어 있습니다. 다음 과제는 데이터, AI, 자동화, 확장 효율을 높이는 것입니다.",
  GROWTH_READY:
    "기본 구조는 갖춰져 있으나 특정 Layer가 성장의 병목이 될 가능성이 있습니다.",
  STRUCTURE_NEEDED:
    "서비스는 존재하지만 고객·상품·프로세스·데이터가 충분히 연결되지 않은 상태입니다.",
  FOUNDER_DEPENDENT:
    "사업이 대표자 또는 특정 인력의 경험과 판단에 크게 의존하고 있습니다.",
  IDEA_STAGE:
    "개발과 마케팅보다 Value · Customer · Offer 정의가 먼저 필요한 단계입니다.",
};
```

- [ ] **Step 2: Create `src/lib/content/bottleneck-copy.ts`**

```ts
import type { LayerId } from "../types/assessment";

export const BOTTLENECK_COPY: Record<LayerId, string> = {
  value:
    "고객 문제와 구매 이유가 충분히 선명하지 않습니다. 기능 추가보다 가치 제안을 다시 정의하는 것이 우선입니다.",
  customer:
    "누구를 위한 서비스인지 범위가 넓거나 구매자와 사용자가 분리되어 있지 않을 가능성이 있습니다.",
  offer: "상품 구조와 가격, 반복매출 구조가 충분히 연결되어 있지 않습니다.",
  experience:
    "고객 유입부터 재사용까지의 여정 중 이탈 지점을 관리할 필요가 있습니다.",
  process:
    "업무가 사람의 기억과 수작업에 의존하고 있습니다. 프로세스 정의와 역할 분리가 우선입니다.",
  data: "서비스에서 발생하는 데이터가 의사결정과 AI/자동화에 충분히 활용되지 않고 있습니다.",
  scale:
    "매출이 늘수록 대표나 팀의 업무시간도 비례해 증가할 가능성이 있습니다.",
};
```

- [ ] **Step 3: Create `src/lib/content/action-library.ts`**

```ts
import type { LayerId } from "../types/assessment";

export const ACTION_LIBRARY: Record<LayerId, [string, string, string]> = {
  value: ["핵심 고객 문제 1문장 정의", "기존 대안 비교", "구매 이유 인터뷰"],
  customer: [
    "Primary/Secondary/Buyer/User 구분",
    "JTBD 정의",
    "구매 Trigger 정리",
  ],
  offer: ["Product Ladder 작성", "핵심 상품/옵션 정리", "반복매출 가능성 검토"],
  experience: ["Customer Journey Map", "전환/이탈 지점 정의", "핵심 CTA 정리"],
  process: [
    "AS-IS Process Map",
    "반복업무 식별",
    "HUMAN / AI-ASSIST / AUTO 구분",
  ],
  data: ["핵심 데이터 정의", "이벤트/행동 로그 정의", "AI Opportunity Map"],
  scale: [
    "표준 업무 정의",
    "대표 의존 업무 제거",
    "구독/라이선스/파트너 구조 검토",
  ],
};
```

- [ ] **Step 4: Create `src/lib/content/questions.ts`**

```ts
import type { LayerId } from "../types/assessment";

export const QUESTIONS: Record<LayerId, [string, string, string, string]> = {
  value: [
    "고객이 해결하고 싶은 핵심 문제가 한 문장으로 정의되어 있는가?",
    "기존 대안보다 우리 서비스를 선택해야 하는 이유가 명확한가?",
    "우리가 제공하는 가치와 고객이 실제로 원하는 가치가 일치하는가?",
    "고객이 비용을 지불해야 할 이유를 설명할 수 있는가?",
  ],
  customer: [
    "핵심 고객을 구체적으로 정의했는가?",
    "서비스 사용자와 실제 구매자가 다를 경우 각각 정의되어 있는가?",
    "고객이 구매를 결정하게 만드는 Trigger를 알고 있는가?",
    "고객별로 다른 요구와 니즈를 구분하고 있는가?",
  ],
  offer: [
    "핵심 상품 또는 서비스가 명확하게 정의되어 있는가?",
    "무료 → 입문 → 핵심 → 고가 상품으로 연결되는 구조가 있는가?",
    "가격의 기준과 고객이 체감하는 가치가 연결되어 있는가?",
    "일회성 매출 외 반복 매출 구조가 존재하는가?",
  ],
  experience: [
    "고객이 우리를 처음 발견하는 경로를 알고 있는가?",
    "관심 → 구매 → 사용 → 재구매 과정이 설계되어 있는가?",
    "고객이 이탈하는 주요 지점을 파악하고 있는가?",
    "고객 경험이 담당자의 역량에 지나치게 의존하지 않는가?",
  ],
  process: [
    "고객 요청부터 업무 완료까지 전체 프로세스를 설명할 수 있는가?",
    "반복적인 수작업이 무엇인지 알고 있는가?",
    "사람이 해야 할 일과 시스템이 해야 할 일이 분리되어 있는가?",
    "대표 또는 특정 직원이 빠져도 업무가 돌아가는가?",
  ],
  data: [
    "고객 행동과 서비스 이용 데이터가 기록되고 있는가?",
    "어떤 데이터를 왜 수집하는지 정의되어 있는가?",
    "데이터를 이용해 고객 경험이나 업무를 개선하고 있는가?",
    "AI 또는 자동화를 적용할 지점이 구체적으로 정의되어 있는가?",
  ],
  scale: [
    "매출이 증가해도 대표의 업무시간이 같은 비율로 증가하지 않는가?",
    "업무 표준과 운영 매뉴얼이 존재하는가?",
    "반복 매출 또는 구독·라이선스 구조가 존재하는가?",
    "다른 사람이 동일한 품질로 서비스를 제공할 수 있는가?",
  ],
};
```

- [ ] **Step 5: Write sanity tests**

Create `src/lib/content/content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { LAYER_IDS } from "../types/assessment";
import { ARCHITECTURE_LEVEL_COPY } from "./architecture-level-copy";
import { BOTTLENECK_COPY } from "./bottleneck-copy";
import { ACTION_LIBRARY } from "./action-library";
import { QUESTIONS } from "./questions";

const ARCHITECTURE_LEVELS = [
  "IDEA_STAGE",
  "FOUNDER_DEPENDENT",
  "STRUCTURE_NEEDED",
  "GROWTH_READY",
  "SYSTEMIZED",
] as const;

describe("ARCHITECTURE_LEVEL_COPY", () => {
  it("has non-empty copy for all 5 levels", () => {
    for (const level of ARCHITECTURE_LEVELS) {
      expect(ARCHITECTURE_LEVEL_COPY[level].length).toBeGreaterThan(0);
    }
  });
});

describe("BOTTLENECK_COPY", () => {
  it("has non-empty copy for all 7 layers", () => {
    for (const id of LAYER_IDS) {
      expect(BOTTLENECK_COPY[id].length).toBeGreaterThan(0);
    }
  });
});

describe("ACTION_LIBRARY", () => {
  it("has exactly 3 actions for all 7 layers", () => {
    for (const id of LAYER_IDS) {
      expect(ACTION_LIBRARY[id]).toHaveLength(3);
      ACTION_LIBRARY[id].forEach((action) => expect(action.length).toBeGreaterThan(0));
    }
  });
});

describe("QUESTIONS", () => {
  it("has exactly 4 questions for all 7 layers", () => {
    for (const id of LAYER_IDS) {
      expect(QUESTIONS[id]).toHaveLength(4);
      QUESTIONS[id].forEach((q) => expect(q.length).toBeGreaterThan(0));
    }
  });
});
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/lib/content/content.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 7: Commit**

```bash
git add src/lib/content/architecture-level-copy.ts src/lib/content/bottleneck-copy.ts src/lib/content/action-library.ts src/lib/content/questions.ts src/lib/content/content.test.ts
git commit -m "feat: add verbatim content config (level/bottleneck/action-library/questions)"
```

---

### Task 4: Content config — placeholders, privacy notice, and summary composition

**Files:**
- Create: `src/lib/content/strength-copy.ts`
- Create: `src/lib/content/layer-descriptions.ts`
- Create: `src/lib/content/privacy-notice.ts`
- Create: `src/lib/content/summary.ts`
- Create: `src/lib/content/summary.test.ts`

**Interfaces:**
- Consumes: `ARCHITECTURE_LEVEL_COPY`, `BOTTLENECK_COPY` (Task 3).
- Produces: `STRENGTH_COPY`, `LAYER_DESCRIPTIONS`, `PRIVACY_NOTICE`, `PRIVACY_NOTICE_VERSION`, `buildSummaryParagraph()` — consumed by Task 6 (`privacy_notice_version` on the row) and Tasks 12-13 (UI).

- [ ] **Step 1: Create `src/lib/content/strength-copy.ts`**

```ts
import type { LayerId } from "../types/assessment";

// VALUE/CUSTOMER/PROCESS are verbatim from the requirements spec section 11.
// The other 4 layers have no example copy in the spec — placeholders, per
// design spec section D (do not invent copy here).
export const STRENGTH_COPY: Record<LayerId, string> = {
  value: "사업이 제공하려는 가치가 비교적 명확합니다.",
  customer: "핵심 고객과 구매 상황에 대한 이해가 좋은 편입니다.",
  offer: "[카피 필요: OFFER 강점 메시지]",
  experience: "[카피 필요: EXPERIENCE 강점 메시지]",
  process: "업무 흐름과 역할이 비교적 잘 정의되어 있습니다.",
  data: "[카피 필요: DATA & INTELLIGENCE 강점 메시지]",
  scale: "[카피 필요: SCALE 강점 메시지]",
};
```

- [ ] **Step 2: Create `src/lib/content/layer-descriptions.ts`**

```ts
import type { LayerId } from "../types/assessment";

// Nothing in the requirements spec to transcribe here — all 7 are
// placeholders, per design spec section D.
export const LAYER_DESCRIPTIONS: Record<LayerId, string> = {
  value: "[카피 필요: VALUE 설명 1줄]",
  customer: "[카피 필요: CUSTOMER 설명 1줄]",
  offer: "[카피 필요: OFFER 설명 1줄]",
  experience: "[카피 필요: EXPERIENCE 설명 1줄]",
  process: "[카피 필요: PROCESS 설명 1줄]",
  data: "[카피 필요: DATA & INTELLIGENCE 설명 1줄]",
  scale: "[카피 필요: SCALE 설명 1줄]",
};
```

- [ ] **Step 3: Create `src/lib/content/privacy-notice.ts`**

Text as finalized by the user directly in Figma (design spec section F) — see that section's "Known inconsistency" note before changing this copy.

```ts
export const PRIVACY_NOTICE_VERSION = "2026-09-17";

export const PRIVACY_NOTICE = {
  summary:
    "목적: 결과 PDF 발송·상담 안내 / 필수: 이름·이메일 / 선택: 회사명·역할·업종·팀규모 / 보유: 수집일로부터 1년",
  purpose:
    "진단 결과 리포트(PDF)를 이메일로 보내드리고, 진단 결과에 기반한 상담(컨설팅) 안내 및 연락을 위해 개인정보를 수집·이용합니다.",
  itemsCollected:
    "필수항목: 이름, 이메일 주소\n선택항목: 회사/브랜드명, 역할, 업종, 팀 규모",
  retentionPeriod: "수집일로부터 1년간 보관한 후 파기합니다.",
  refusalNotice:
    "귀하는 개인정보 수집·이용에 동의하지 않을 권리가 있으며, 동의하지 않으셔도 28문항 진단과 결과(레이더 차트·점수·병목 분석) 확인에는 제한이 없습니다. 다만 연락 수단이 수집되지 않아 결과 PDF 이메일 발송과 상담 연결 서비스는 이용하실 수 없습니다.",
};
```

- [ ] **Step 4: Write the failing test for `buildSummaryParagraph`**

Create `src/lib/content/summary.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildSummaryParagraph } from "./summary";
import { ARCHITECTURE_LEVEL_COPY } from "./architecture-level-copy";
import { BOTTLENECK_COPY } from "./bottleneck-copy";

describe("buildSummaryParagraph", () => {
  it("concatenates the level description and the lowest layer's bottleneck message", () => {
    const result = buildSummaryParagraph("STRUCTURE_NEEDED", "process");
    expect(result).toBe(
      `${ARCHITECTURE_LEVEL_COPY.STRUCTURE_NEEDED} ${BOTTLENECK_COPY.process}`
    );
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npx vitest run src/lib/content/summary.test.ts`
Expected: FAIL — `Cannot find module './summary'`

- [ ] **Step 6: Implement `src/lib/content/summary.ts`**

```ts
import type { ArchitectureLevel, LayerId } from "../types/assessment";
import { ARCHITECTURE_LEVEL_COPY } from "./architecture-level-copy";
import { BOTTLENECK_COPY } from "./bottleneck-copy";

export function buildSummaryParagraph(
  level: ArchitectureLevel,
  lowestLayerId: LayerId
): string {
  return `${ARCHITECTURE_LEVEL_COPY[level]} ${BOTTLENECK_COPY[lowestLayerId]}`;
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/lib/content/summary.test.ts`
Expected: PASS (1 test)

- [ ] **Step 8: Commit**

```bash
git add src/lib/content/strength-copy.ts src/lib/content/layer-descriptions.ts src/lib/content/privacy-notice.ts src/lib/content/summary.ts src/lib/content/summary.test.ts
git commit -m "feat: add placeholder copy, privacy notice, and summary composition"
```

---

### Task 5: Draft answer-merge logic

**Files:**
- Create: `src/lib/assessment-drafts/merge-answers.ts`
- Create: `src/lib/assessment-drafts/merge-answers.test.ts`

**Interfaces:**
- Consumes: `DraftAnswers`, `LayerAnswerSet`, `LayerId`, `LAYER_IDS`, `LayerAnswers` (Task 2 / existing types).
- Produces: `mergeLayerAnswers(existing, layerId, answers): DraftAnswers`, `countCompletedLayers(answers): number`, `isDraftComplete(answers): answers is LayerAnswers` — consumed by Tasks 10 (PATCH route) and 11 (complete route).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/assessment-drafts/merge-answers.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { DraftAnswers } from "../types/assessment";
import {
  countCompletedLayers,
  isDraftComplete,
  mergeLayerAnswers,
} from "./merge-answers";

describe("mergeLayerAnswers", () => {
  it("adds a new layer's answers without touching existing ones", () => {
    const existing: DraftAnswers = { value: [1, 2, 3, 4] };
    const result = mergeLayerAnswers(existing, "customer", [5, 5, 5, 5]);

    expect(result).toEqual({ value: [1, 2, 3, 4], customer: [5, 5, 5, 5] });
    expect(existing).toEqual({ value: [1, 2, 3, 4] }); // original untouched
  });

  it("overwrites a layer's answers if it's revisited", () => {
    const existing: DraftAnswers = { value: [1, 1, 1, 1] };
    const result = mergeLayerAnswers(existing, "value", [5, 5, 5, 5]);

    expect(result).toEqual({ value: [5, 5, 5, 5] });
  });
});

describe("countCompletedLayers", () => {
  it("counts 0 for an empty draft", () => {
    expect(countCompletedLayers({})).toBe(0);
  });

  it("counts each present layer once", () => {
    expect(
      countCompletedLayers({ value: [1, 1, 1, 1], customer: [2, 2, 2, 2] })
    ).toBe(2);
  });
});

describe("isDraftComplete", () => {
  it("is false when fewer than 7 layers are present", () => {
    expect(isDraftComplete({ value: [1, 1, 1, 1] })).toBe(false);
  });

  it("is true when all 7 layers are present", () => {
    const full: DraftAnswers = {
      value: [1, 1, 1, 1],
      customer: [1, 1, 1, 1],
      offer: [1, 1, 1, 1],
      experience: [1, 1, 1, 1],
      process: [1, 1, 1, 1],
      data: [1, 1, 1, 1],
      scale: [1, 1, 1, 1],
    };
    expect(isDraftComplete(full)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/assessment-drafts/merge-answers.test.ts`
Expected: FAIL — `Cannot find module './merge-answers'`

- [ ] **Step 3: Implement `src/lib/assessment-drafts/merge-answers.ts`**

```ts
import type {
  DraftAnswers,
  LayerAnswers,
  LayerAnswerSet,
  LayerId,
} from "../types/assessment";
import { LAYER_IDS } from "../types/assessment";

export function mergeLayerAnswers(
  existing: DraftAnswers,
  layerId: LayerId,
  answers: LayerAnswerSet
): DraftAnswers {
  return { ...existing, [layerId]: answers };
}

export function countCompletedLayers(answers: DraftAnswers): number {
  return LAYER_IDS.filter((id) => answers[id] !== undefined).length;
}

export function isDraftComplete(answers: DraftAnswers): answers is LayerAnswers {
  return countCompletedLayers(answers) === LAYER_IDS.length;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/assessment-drafts/merge-answers.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/assessment-drafts/merge-answers.ts src/lib/assessment-drafts/merge-answers.test.ts
git commit -m "feat: add draft answer-merge logic"
```

---

### Task 6: Schema consolidation (privacy consent required, draft schema)

**Files:**
- Modify: `src/lib/scoring/submit-assessment.schema.ts`
- Modify: `src/lib/scoring/submit-assessment.ts`
- Modify: `src/lib/scoring/submit-assessment.test.ts`
- Modify: `src/app/api/assessments/route.test.ts`

**Interfaces:**
- Produces: `basicInfoSchema`, `layerIdSchema`, `layerAnswerSetSchema`, `draftBasicInfoSchema`, `submitAssessmentSchema` (extended), `patchDraftAnswersSchema` — consumed by Tasks 9, 10, 11. `AssessmentInsertRow` gains `privacy_consent_at`, `privacy_notice_version` — consumed by Task 7 (shared insert helper).

This task changes `submitAssessmentSchema` to require `privacyConsent: true` — the existing `POST /api/assessments` route now rejects any payload missing it, so its own tests need one field added to their fixtures.

- [ ] **Step 1: Rewrite `src/lib/scoring/submit-assessment.schema.ts`**

```ts
import { z } from "zod";

export const answerScoreSchema = z.number().int().min(1).max(5);
export const layerAnswerSetSchema = z.tuple([
  answerScoreSchema,
  answerScoreSchema,
  answerScoreSchema,
  answerScoreSchema,
]);

export const businessStageSchema = z.enum([
  "idea",
  "mvp_prep",
  "building",
  "operating",
  "growth",
  "realign",
]);

export const layerIdSchema = z.enum([
  "value",
  "customer",
  "offer",
  "experience",
  "process",
  "data",
  "scale",
]);

export const basicInfoSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  companyName: z.string().optional(),
  role: z.string().optional(),
  businessStage: businessStageSchema,
  industry: z.string().optional(),
  teamSize: z.string().optional(),
});

const utmSchema = z
  .object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
  })
  .optional();

export const draftBasicInfoSchema = z.object({
  basicInfo: basicInfoSchema,
  privacyConsent: z.literal(true),
  marketingConsent: z.boolean(),
  utm: utmSchema,
});

export const submitAssessmentSchema = draftBasicInfoSchema.extend({
  answers: z.object({
    value: layerAnswerSetSchema,
    customer: layerAnswerSetSchema,
    offer: layerAnswerSetSchema,
    experience: layerAnswerSetSchema,
    process: layerAnswerSetSchema,
    data: layerAnswerSetSchema,
    scale: layerAnswerSetSchema,
  }),
});

export const patchDraftAnswersSchema = z.object({
  layerId: layerIdSchema,
  answers: layerAnswerSetSchema,
});

export type SubmitAssessmentPayload = z.infer<typeof submitAssessmentSchema>;
export type DraftBasicInfoPayload = z.infer<typeof draftBasicInfoSchema>;
export type PatchDraftAnswersPayload = z.infer<typeof patchDraftAnswersSchema>;
```

- [ ] **Step 2: Update `src/lib/scoring/submit-assessment.ts`**

Add `privacyConsent: boolean` to `SubmitAssessmentInput`, and `privacy_consent: boolean`, `privacy_consent_at: string`, `privacy_notice_version: string` to `AssessmentInsertRow`. Set them in `computeAssessmentResult`.

```ts
import type {
  ArchitectureLevel,
  BasicInfo,
  LayerAnswers,
  LayerId,
} from "../types/assessment";
import { findBottlenecks, findStrengths } from "./bottleneck";
import { classifyArchitectureLevel } from "./architecture-level";
import { scoreAllLayers, totalRawScore } from "./scoring";
import { PRIVACY_NOTICE_VERSION } from "../content/privacy-notice";

export type SubmitAssessmentInput = {
  basicInfo: BasicInfo;
  answers: LayerAnswers;
  privacyConsent: boolean;
  marketingConsent: boolean;
  utm?: { source?: string; medium?: string; campaign?: string };
};

export type AssessmentInsertRow = {
  name: string;
  email: string;
  company_name: string | null;
  role: string | null;
  business_stage: BasicInfo["businessStage"];
  industry: string | null;
  team_size: string | null;
  score_value_raw: number;
  score_value_100: number;
  score_customer_raw: number;
  score_customer_100: number;
  score_offer_raw: number;
  score_offer_100: number;
  score_experience_raw: number;
  score_experience_100: number;
  score_process_raw: number;
  score_process_100: number;
  score_data_raw: number;
  score_data_100: number;
  score_scale_raw: number;
  score_scale_100: number;
  total_raw: number;
  architecture_level: ArchitectureLevel;
  bottleneck_1: LayerId;
  bottleneck_2: LayerId;
  bottleneck_3: LayerId;
  strength_1: LayerId;
  strength_2: LayerId;
  consulting_cta_clicked: boolean;
  consulting_requested: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  privacy_consent: boolean;
  privacy_consent_at: string;
  privacy_notice_version: string;
  marketing_consent: boolean;
};

export type AssessmentComputation = {
  row: AssessmentInsertRow;
  architectureLevel: ArchitectureLevel;
  totalRaw: number;
  bottlenecks: LayerId[];
  strengths: LayerId[];
};

export function computeAssessmentResult(
  input: SubmitAssessmentInput
): AssessmentComputation {
  const layerScores = scoreAllLayers(input.answers);
  const totalRaw = totalRawScore(layerScores);
  const architectureLevel = classifyArchitectureLevel(totalRaw);
  const bottlenecks = findBottlenecks(layerScores);
  const strengths = findStrengths(layerScores);

  const scoreByLayer = new Map(layerScores.map((l) => [l.layerId, l]));
  const get = (layerId: LayerId) => scoreByLayer.get(layerId)!;

  const row: AssessmentInsertRow = {
    name: input.basicInfo.name,
    email: input.basicInfo.email,
    company_name: input.basicInfo.companyName ?? null,
    role: input.basicInfo.role ?? null,
    business_stage: input.basicInfo.businessStage,
    industry: input.basicInfo.industry ?? null,
    team_size: input.basicInfo.teamSize ?? null,
    score_value_raw: get("value").raw,
    score_value_100: get("value").score100,
    score_customer_raw: get("customer").raw,
    score_customer_100: get("customer").score100,
    score_offer_raw: get("offer").raw,
    score_offer_100: get("offer").score100,
    score_experience_raw: get("experience").raw,
    score_experience_100: get("experience").score100,
    score_process_raw: get("process").raw,
    score_process_100: get("process").score100,
    score_data_raw: get("data").raw,
    score_data_100: get("data").score100,
    score_scale_raw: get("scale").raw,
    score_scale_100: get("scale").score100,
    total_raw: totalRaw,
    architecture_level: architectureLevel,
    bottleneck_1: bottlenecks[0],
    bottleneck_2: bottlenecks[1],
    bottleneck_3: bottlenecks[2],
    strength_1: strengths[0],
    strength_2: strengths[1],
    consulting_cta_clicked: false,
    consulting_requested: false,
    utm_source: input.utm?.source ?? null,
    utm_medium: input.utm?.medium ?? null,
    utm_campaign: input.utm?.campaign ?? null,
    privacy_consent: input.privacyConsent,
    privacy_consent_at: new Date().toISOString(),
    privacy_notice_version: PRIVACY_NOTICE_VERSION,
    marketing_consent: input.marketingConsent,
  };

  return { row, architectureLevel, totalRaw, bottlenecks, strengths };
}
```

- [ ] **Step 3: Update the existing fixture in `src/lib/scoring/submit-assessment.test.ts`**

Open `src/lib/scoring/submit-assessment.test.ts`. In `allOnesInput()`, add `privacyConsent: true,` right after `marketingConsent: false,`:

```ts
    marketingConsent: false,
    privacyConsent: true,
  };
```

(This is the only change to that file — every existing assertion still holds.)

- [ ] **Step 4: Add new assertions for the consent fields**

In the `describe("computeAssessmentResult", ...)` block, add one more `it` after the existing two:

```ts
  it("stamps privacy consent fields on every result", () => {
    const result = computeAssessmentResult(allOnesInput());

    expect(result.row.privacy_consent).toBe(true);
    expect(result.row.privacy_notice_version).toBe("2026-09-17");
    expect(new Date(result.row.privacy_consent_at).toString()).not.toBe(
      "Invalid Date"
    );
  });
```

- [ ] **Step 5: Update the existing fixture in `src/app/api/assessments/route.test.ts`**

Open `src/app/api/assessments/route.test.ts`. In `validPayload()`, add `privacyConsent: true,` right after `marketingConsent: false,`:

```ts
    marketingConsent: false,
    privacyConsent: true,
  };
```

- [ ] **Step 6: Run the full scoring + route suite**

Run: `npx vitest run src/lib/scoring src/app/api/assessments`
Expected: PASS — `submit-assessment.test.ts` now has 6 tests (was 5), `route.test.ts` still has 3, `scoring.test.ts`/`architecture-level.test.ts`/`bottleneck.test.ts`/`layers.config.test.ts` unaffected.

- [ ] **Step 7: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/lib/scoring/submit-assessment.schema.ts src/lib/scoring/submit-assessment.ts src/lib/scoring/submit-assessment.test.ts src/app/api/assessments/route.test.ts
git commit -m "feat: require privacy consent, add draft schema, stamp consent metadata"
```

---

### Task 7: Shared assessment-persist helper

**Files:**
- Create: `src/lib/scoring/persist-assessment.ts`
- Create: `src/lib/scoring/persist-assessment.test.ts`
- Modify: `src/app/api/assessments/route.ts`

**Interfaces:**
- Consumes: `computeAssessmentResult`, `SubmitAssessmentInput` (Task 6), `createServiceRoleSupabaseClient` (existing `src/lib/supabase/server.ts`).
- Produces: `persistAssessment(input): Promise<PersistAssessmentResult>` — consumed by the existing `POST /api/assessments` route (refactored here) and Task 11's `complete` route.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/scoring/persist-assessment.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SubmitAssessmentInput } from "./submit-assessment";

const single = vi.fn();
const select = vi.fn(() => ({ single }));
const insert = vi.fn(() => ({ select }));
const from = vi.fn(() => ({ insert }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

function validInput(): SubmitAssessmentInput {
  return {
    basicInfo: { name: "테스트", email: "test@example.com", businessStage: "idea" },
    answers: {
      value: [1, 1, 1, 1],
      customer: [1, 1, 1, 1],
      offer: [1, 1, 1, 1],
      experience: [1, 1, 1, 1],
      process: [1, 1, 1, 1],
      data: [1, 1, 1, 1],
      scale: [1, 1, 1, 1],
    },
    privacyConsent: true,
    marketingConsent: false,
  };
}

beforeEach(() => {
  single.mockReset();
  select.mockClear();
  insert.mockClear();
  from.mockClear();
});

describe("persistAssessment", () => {
  it("computes scores, inserts the row, and returns ok:true with the new id", async () => {
    single.mockResolvedValueOnce({ data: { id: "test-id" }, error: null });
    const { persistAssessment } = await import("./persist-assessment");

    const result = await persistAssessment(validInput());

    expect(result).toEqual({
      ok: true,
      assessmentId: "test-id",
      architectureLevel: "IDEA_STAGE",
      totalRaw: 28,
      bottlenecks: ["process", "customer", "value"],
      strengths: ["scale", "data"],
    });
    expect(from).toHaveBeenCalledWith("assessments");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ total_raw: 28, privacy_consent: true })
    );
  });

  it("returns ok:false with the error message when the insert fails", async () => {
    single.mockResolvedValueOnce({ data: null, error: { message: "insert failed" } });
    const { persistAssessment } = await import("./persist-assessment");

    const result = await persistAssessment(validInput());

    expect(result).toEqual({ ok: false, error: "insert failed" });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/scoring/persist-assessment.test.ts`
Expected: FAIL — `Cannot find module './persist-assessment'`

- [ ] **Step 3: Implement `src/lib/scoring/persist-assessment.ts`**

```ts
import { computeAssessmentResult } from "./submit-assessment";
import type {
  ArchitectureLevel,
  SubmitAssessmentInput,
} from "./submit-assessment";
import type { LayerId } from "../types/assessment";
import { createServiceRoleSupabaseClient } from "../supabase/server";

export type PersistAssessmentResult =
  | {
      ok: true;
      assessmentId: string;
      architectureLevel: ArchitectureLevel;
      totalRaw: number;
      bottlenecks: LayerId[];
      strengths: LayerId[];
    }
  | { ok: false; error: string };

export async function persistAssessment(
  input: SubmitAssessmentInput
): Promise<PersistAssessmentResult> {
  const { row, architectureLevel, totalRaw, bottlenecks, strengths } =
    computeAssessmentResult(input);

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("assessments")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, assessmentId: data.id, architectureLevel, totalRaw, bottlenecks, strengths };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/scoring/persist-assessment.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Refactor `src/app/api/assessments/route.ts` to use it**

```ts
import { NextResponse } from "next/server";
import { persistAssessment } from "@/lib/scoring/persist-assessment";
import { submitAssessmentSchema } from "@/lib/scoring/submit-assessment.schema";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = submitAssessmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await persistAssessment(parsed.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const { assessmentId, architectureLevel, totalRaw, bottlenecks, strengths } = result;
  return NextResponse.json(
    { assessmentId, architectureLevel, totalRaw, bottlenecks, strengths },
    { status: 201 }
  );
}
```

- [ ] **Step 6: Run the existing route test suite to confirm it still passes unmodified**

Run: `npx vitest run src/app/api/assessments/route.test.ts`
Expected: PASS (3 tests) — the mock target (`@/lib/supabase/server`) is unchanged, so this route's existing tests need no edits.

- [ ] **Step 7: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/lib/scoring/persist-assessment.ts src/lib/scoring/persist-assessment.test.ts src/app/api/assessments/route.ts
git commit -m "refactor: extract shared persistAssessment helper"
```

---

### Task 8: `getAssessmentById` shared read function

**Files:**
- Create: `src/lib/assessments/get-assessment.ts`
- Create: `src/lib/assessments/get-assessment.test.ts`

**Interfaces:**
- Consumes: `createServiceRoleSupabaseClient` (existing).
- Produces: `getAssessmentById(id): Promise<AssessmentRow | null>` — consumed by Task 12 (`GET /api/assessments/[assessmentId]`) and Task 14 (result page Server Component).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/assessments/get-assessment.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

beforeEach(() => {
  maybeSingle.mockReset();
  eq.mockClear();
  select.mockClear();
  from.mockClear();
});

describe("getAssessmentById", () => {
  it("returns the row when found", async () => {
    maybeSingle.mockResolvedValueOnce({ data: { id: "abc", total_raw: 84 }, error: null });
    const { getAssessmentById } = await import("./get-assessment");

    const result = await getAssessmentById("abc");

    expect(result).toEqual({ id: "abc", total_raw: 84 });
    expect(from).toHaveBeenCalledWith("assessments");
    expect(eq).toHaveBeenCalledWith("id", "abc");
  });

  it("returns null when not found", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { getAssessmentById } = await import("./get-assessment");

    const result = await getAssessmentById("missing");

    expect(result).toBeNull();
  });

  it("throws when the query errors", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    const { getAssessmentById } = await import("./get-assessment");

    await expect(getAssessmentById("abc")).rejects.toThrow("boom");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/assessments/get-assessment.test.ts`
Expected: FAIL — `Cannot find module './get-assessment'`

- [ ] **Step 3: Implement `src/lib/assessments/get-assessment.ts`**

```ts
import { createServiceRoleSupabaseClient } from "../supabase/server";
import type { AssessmentInsertRow } from "../scoring/submit-assessment";

export type AssessmentRow = AssessmentInsertRow & {
  id: string;
  created_at: string;
};

export async function getAssessmentById(
  id: string
): Promise<AssessmentRow | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as AssessmentRow | null;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/lib/assessments/get-assessment.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/assessments/get-assessment.ts src/lib/assessments/get-assessment.test.ts
git commit -m "feat: add getAssessmentById shared read function"
```

---

### Task 9: `POST /api/assessment-drafts`

**Files:**
- Create: `src/app/api/assessment-drafts/route.ts`
- Create: `src/app/api/assessment-drafts/route.test.ts`

**Interfaces:**
- Consumes: `draftBasicInfoSchema` (Task 6), `createServiceRoleSupabaseClient` (existing).
- Produces: `POST` handler returning `201 { draftId }` — consumed by Task 13 (basic info page).

**Blocked on:** Task 1's migrations being applied to the live Supabase project (this task's manual verification step needs the real table; the automated test below is fully mocked and doesn't need it).

- [ ] **Step 1: Write the failing tests**

Create `src/app/api/assessment-drafts/route.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/app/api/assessment-drafts/route.test.ts`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 3: Implement `src/app/api/assessment-drafts/route.ts`**

```ts
import { NextResponse } from "next/server";
import { draftBasicInfoSchema } from "@/lib/scoring/submit-assessment.schema";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = draftBasicInfoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { basicInfo, privacyConsent, marketingConsent, utm } = parsed.data;

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("assessment_drafts")
    .insert({
      basic_info: basicInfo,
      answers: {},
      current_step: 0,
      privacy_consent: privacyConsent,
      marketing_consent: marketingConsent,
      utm_source: utm?.source ?? null,
      utm_medium: utm?.medium ?? null,
      utm_campaign: utm?.campaign ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ draftId: data.id }, { status: 201 });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/app/api/assessment-drafts/route.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/app/api/assessment-drafts/route.ts src/app/api/assessment-drafts/route.test.ts
git commit -m "feat: add POST /api/assessment-drafts"
```

---

### Task 10: `GET` + `PATCH /api/assessment-drafts/[draftId]`

**Files:**
- Create: `src/app/api/assessment-drafts/[draftId]/route.ts`
- Create: `src/app/api/assessment-drafts/[draftId]/route.test.ts`

**Interfaces:**
- Consumes: `patchDraftAnswersSchema` (Task 6), `mergeLayerAnswers`/`countCompletedLayers` (Task 5), `AssessmentDraftRow` (Task 2).
- Produces: `GET` returning `200 { basicInfo, answers, currentStep }` / `404`; `PATCH` returning `200 { currentStep }` / `404` — consumed by Task 15 (question wizard).

- [ ] **Step 1: Write the failing tests**

Create `src/app/api/assessment-drafts/[draftId]/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const eqForSelect = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq: eqForSelect }));

const updateSingle = vi.fn();
const updateSelect = vi.fn(() => ({ single: updateSingle }));
const eqForUpdate = vi.fn(() => ({ select: updateSelect }));
const update = vi.fn(() => ({ eq: eqForUpdate }));

const from = vi.fn(() => ({ select, update }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

beforeEach(() => {
  maybeSingle.mockReset();
  updateSingle.mockReset();
  eqForSelect.mockClear();
  select.mockClear();
  eqForUpdate.mockClear();
  updateSelect.mockClear();
  update.mockClear();
  from.mockClear();
});

describe("GET /api/assessment-drafts/[draftId]", () => {
  it("returns the draft's basicInfo/answers/currentStep", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: {
        basic_info: { name: "테스트", email: "test@example.com", businessStage: "idea" },
        answers: { value: [1, 1, 1, 1] },
        current_step: 1,
      },
      error: null,
    });
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ draftId: "draft-id" }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.currentStep).toBe(1);
    expect(json.answers).toEqual({ value: [1, 1, 1, 1] });
    expect(eqForSelect).toHaveBeenCalledWith("id", "draft-id");
  });

  it("returns 404 when the draft doesn't exist", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ draftId: "missing" }),
    });

    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/assessment-drafts/[draftId]", () => {
  it("merges the layer's answers and returns the new currentStep", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: { answers: { value: [1, 1, 1, 1] } },
      error: null,
    });
    updateSingle.mockResolvedValueOnce({
      data: { current_step: 2 },
      error: null,
    });
    const { PATCH } = await import("./route");

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ layerId: "customer", answers: [2, 2, 2, 2] }),
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ draftId: "draft-id" }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.currentStep).toBe(2);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        answers: { value: [1, 1, 1, 1], customer: [2, 2, 2, 2] },
        current_step: 2,
      })
    );
  });

  it("returns 400 for an invalid layerId", async () => {
    const { PATCH } = await import("./route");

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ layerId: "not-a-layer", answers: [1, 1, 1, 1] }),
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ draftId: "draft-id" }),
    });

    expect(response.status).toBe(400);
  });

  it("returns 404 when the draft doesn't exist", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { PATCH } = await import("./route");

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ layerId: "value", answers: [1, 1, 1, 1] }),
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ draftId: "missing" }),
    });

    expect(response.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run "src/app/api/assessment-drafts/[draftId]/route.test.ts"`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 3: Implement `src/app/api/assessment-drafts/[draftId]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { patchDraftAnswersSchema } from "@/lib/scoring/submit-assessment.schema";
import {
  countCompletedLayers,
  mergeLayerAnswers,
} from "@/lib/assessment-drafts/merge-answers";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { AssessmentDraftRow, DraftAnswers } from "@/lib/types/assessment";

type RouteParams = { params: Promise<{ draftId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { draftId } = await params;
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("assessment_drafts")
    .select("basic_info, answers, current_step")
    .eq("id", draftId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json({
    basicInfo: data.basic_info,
    answers: data.answers,
    currentStep: data.current_step,
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { draftId } = await params;
  const body = await request.json();
  const parsed = patchDraftAnswersSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data: draft, error: fetchError } = await supabase
    .from("assessment_drafts")
    .select("answers")
    .eq("id", draftId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const existingAnswers = (draft as Pick<AssessmentDraftRow, "answers">).answers as DraftAnswers;
  const { layerId, answers } = parsed.data;
  const mergedAnswers = mergeLayerAnswers(existingAnswers, layerId, answers);
  const currentStep = countCompletedLayers(mergedAnswers);

  const { data: updated, error: updateError } = await supabase
    .from("assessment_drafts")
    .update({
      answers: mergedAnswers,
      current_step: currentStep,
      updated_at: new Date().toISOString(),
    })
    .eq("id", draftId)
    .select("current_step")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ currentStep: updated.current_step });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run "src/app/api/assessment-drafts/[draftId]/route.test.ts"`
Expected: PASS (5 tests)

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add "src/app/api/assessment-drafts/[draftId]/route.ts" "src/app/api/assessment-drafts/[draftId]/route.test.ts"
git commit -m "feat: add GET/PATCH /api/assessment-drafts/[draftId]"
```

---

### Task 11: `POST /api/assessment-drafts/[draftId]/complete`

**Files:**
- Create: `src/app/api/assessment-drafts/[draftId]/complete/route.ts`
- Create: `src/app/api/assessment-drafts/[draftId]/complete/route.test.ts`

**Interfaces:**
- Consumes: `isDraftComplete` (Task 5), `persistAssessment` (Task 7), `AssessmentDraftRow` (Task 2).
- Produces: `POST` handler returning `201 { assessmentId, architectureLevel, totalRaw, bottlenecks, strengths }` / `400` (incomplete) / `404` (missing draft) — consumed by Task 15 (question wizard's final step).

- [ ] **Step 1: Write the failing tests**

Create `src/app/api/assessment-drafts/[draftId]/complete/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleSupabaseClient: () => ({ from }),
}));

const persistAssessment = vi.fn();
vi.mock("@/lib/scoring/persist-assessment", () => ({
  persistAssessment: (...args: unknown[]) => persistAssessment(...args),
}));

function fullAnswers() {
  return {
    value: [1, 1, 1, 1],
    customer: [1, 1, 1, 1],
    offer: [1, 1, 1, 1],
    experience: [1, 1, 1, 1],
    process: [1, 1, 1, 1],
    data: [1, 1, 1, 1],
    scale: [1, 1, 1, 1],
  };
}

beforeEach(() => {
  maybeSingle.mockReset();
  persistAssessment.mockReset();
  eq.mockClear();
  select.mockClear();
  from.mockClear();
});

describe("POST /api/assessment-drafts/[draftId]/complete", () => {
  it("persists the assessment and returns 201 when all 7 layers are present", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: {
        basic_info: { name: "테스트", email: "test@example.com", businessStage: "idea" },
        answers: fullAnswers(),
        privacy_consent: true,
        marketing_consent: false,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
      },
      error: null,
    });
    persistAssessment.mockResolvedValueOnce({
      ok: true,
      assessmentId: "assessment-id",
      architectureLevel: "IDEA_STAGE",
      totalRaw: 28,
      bottlenecks: ["process", "customer", "value"],
      strengths: ["scale", "data"],
    });
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ draftId: "draft-id" }),
    });
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.assessmentId).toBe("assessment-id");
    expect(persistAssessment).toHaveBeenCalledWith(
      expect.objectContaining({ privacyConsent: true, marketingConsent: false })
    );
  });

  it("returns 400 when fewer than 7 layers are present", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: {
        basic_info: { name: "테스트", email: "test@example.com", businessStage: "idea" },
        answers: { value: [1, 1, 1, 1] },
        privacy_consent: true,
        marketing_consent: false,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
      },
      error: null,
    });
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ draftId: "draft-id" }),
    });

    expect(response.status).toBe(400);
    expect(persistAssessment).not.toHaveBeenCalled();
  });

  it("returns 404 when the draft doesn't exist", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { POST } = await import("./route");

    const response = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ draftId: "missing" }),
    });

    expect(response.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run "src/app/api/assessment-drafts/[draftId]/complete/route.test.ts"`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 3: Implement `src/app/api/assessment-drafts/[draftId]/complete/route.ts`**

```ts
import { NextResponse } from "next/server";
import { isDraftComplete } from "@/lib/assessment-drafts/merge-answers";
import { persistAssessment } from "@/lib/scoring/persist-assessment";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { AssessmentDraftRow } from "@/lib/types/assessment";

type RouteParams = { params: Promise<{ draftId: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const { draftId } = await params;
  const supabase = createServiceRoleSupabaseClient();

  const { data: draft, error: fetchError } = await supabase
    .from("assessment_drafts")
    .select("basic_info, answers, privacy_consent, marketing_consent, utm_source, utm_medium, utm_campaign")
    .eq("id", draftId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const row = draft as Pick<
    AssessmentDraftRow,
    "basic_info" | "answers" | "privacy_consent" | "marketing_consent" | "utm_source" | "utm_medium" | "utm_campaign"
  >;

  if (!isDraftComplete(row.answers)) {
    return NextResponse.json(
      { error: "All 7 layers must be answered before completing" },
      { status: 400 }
    );
  }

  const result = await persistAssessment({
    basicInfo: row.basic_info,
    answers: row.answers,
    privacyConsent: row.privacy_consent,
    marketingConsent: row.marketing_consent,
    utm: {
      source: row.utm_source ?? undefined,
      medium: row.utm_medium ?? undefined,
      campaign: row.utm_campaign ?? undefined,
    },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  await supabase.from("assessment_drafts").delete().eq("id", draftId);

  const { assessmentId, architectureLevel, totalRaw, bottlenecks, strengths } = result;
  return NextResponse.json(
    { assessmentId, architectureLevel, totalRaw, bottlenecks, strengths },
    { status: 201 }
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run "src/app/api/assessment-drafts/[draftId]/complete/route.test.ts"`
Expected: PASS (3 tests)

Note: the mocked `from` in this test only stubs `.select().eq().maybeSingle()` — the final `supabase.from("assessment_drafts").delete().eq(...)` call in Step 3 will throw inside the mock (`.delete` is undefined) unless a delete chain is stubbed. Fix by extending the shared mock: add `const deleteEq = vi.fn().mockResolvedValue({ error: null }); const del = vi.fn(() => ({ eq: deleteEq })); const from = vi.fn(() => ({ select, delete: del }));` and clear `deleteEq`/`del` in `beforeEach`. Apply this before running Step 4.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add "src/app/api/assessment-drafts/[draftId]/complete/route.ts" "src/app/api/assessment-drafts/[draftId]/complete/route.test.ts"
git commit -m "feat: add POST /api/assessment-drafts/[draftId]/complete"
```

---

### Task 12: `GET /api/assessments/[assessmentId]`

**Files:**
- Create: `src/app/api/assessments/[assessmentId]/route.ts`
- Create: `src/app/api/assessments/[assessmentId]/route.test.ts`

**Interfaces:**
- Consumes: `getAssessmentById` (Task 8).
- Produces: `GET` handler returning `200 <full row>` / `404` — consumed by Task 14 (result page, as a fallback/for potential client-side re-fetch; the page itself calls `getAssessmentById` directly).

- [ ] **Step 1: Write the failing tests**

Create `src/app/api/assessments/[assessmentId]/route.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run "src/app/api/assessments/[assessmentId]/route.test.ts"`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 3: Implement `src/app/api/assessments/[assessmentId]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getAssessmentById } from "@/lib/assessments/get-assessment";

type RouteParams = { params: Promise<{ assessmentId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { assessmentId } = await params;
  const assessment = await getAssessmentById(assessmentId);

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  return NextResponse.json(assessment);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run "src/app/api/assessments/[assessmentId]/route.test.ts"`
Expected: PASS (2 tests)

- [ ] **Step 5: Run the full test suite and typecheck before moving to the UI layer**

Run: `npm test && npm run typecheck`
Expected: all tests pass, no type errors. This is the last backend task — everything from here is client-side.

- [ ] **Step 6: Commit**

```bash
git add "src/app/api/assessments/[assessmentId]/route.ts" "src/app/api/assessments/[assessmentId]/route.test.ts"
git commit -m "feat: add GET /api/assessments/[assessmentId]"
```

---

### Task 13: Radar chart component + dependency

**Files:**
- Modify: `package.json`
- Create: `src/components/diagnose/RadarChart.tsx`

**Interfaces:**
- Produces: `<RadarChart layerScores={LayerScore[]} />` — consumed by Task 14 (result page).

- [ ] **Step 1: Install `chart.js` and `react-chartjs-2`**

Run: `npm install chart.js react-chartjs-2`
Expected: both added to `package.json` dependencies.

- [ ] **Step 2: Create `src/components/diagnose/RadarChart.tsx`**

```tsx
"use client";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import type { LayerScore } from "@/lib/types/assessment";
import { LAYERS } from "@/lib/scoring/layers.config";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

export function RadarChart({ layerScores }: { layerScores: LayerScore[] }) {
  const scoreByLayer = new Map(layerScores.map((s) => [s.layerId, s.score100]));

  const data = {
    labels: LAYERS.map((l) => l.shortName),
    datasets: [
      {
        label: "Score",
        data: LAYERS.map((l) => scoreByLayer.get(l.id) ?? 0),
        backgroundColor: "rgba(99, 102, 241, 0.25)",
        borderColor: "rgb(99, 102, 241)",
        pointBackgroundColor: "rgb(99, 102, 241)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false },
        grid: { color: "#E2E8F0" },
        angleLines: { color: "#E2E8F0" },
        pointLabels: { font: { size: 11, weight: 600 as const }, color: "#334155" },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return <Radar data={data} options={options} />;
}
```

- [ ] **Step 3: Verify the project still builds**

Run: `npm run build`
Expected: `Compiled successfully` (the component isn't imported anywhere yet, so this just confirms the new dependency resolves cleanly).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/components/diagnose/RadarChart.tsx
git commit -m "feat: add RadarChart component (chart.js + react-chartjs-2)"
```

---

### Task 14: Result page

**Files:**
- Create: `src/app/diagnose/result/[assessmentId]/page.tsx`
- Create: `src/app/diagnose/result/[assessmentId]/not-found.tsx`

**Interfaces:**
- Consumes: `getAssessmentById` (Task 8), `RadarChart` (Task 13), `ARCHITECTURE_LEVEL_COPY`/`BOTTLENECK_COPY`/`STRENGTH_COPY`/`ACTION_LIBRARY`/`buildSummaryParagraph` (Tasks 3-4).
- Produces: the result screen — the last piece of the diagnose flow.

- [ ] **Step 1: Create `src/app/diagnose/result/[assessmentId]/not-found.tsx`**

```tsx
import Link from "next/link";

export default function ResultNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-bold">결과를 찾을 수 없습니다</h1>
      <p className="text-sm text-slate-600">
        링크가 잘못되었거나 만료되었을 수 있습니다.
      </p>
      <Link href="/diagnose" className="text-sm font-semibold text-indigo-600 underline">
        새로 진단 시작하기
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: Create `src/app/diagnose/result/[assessmentId]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { getAssessmentById } from "@/lib/assessments/get-assessment";
import { RadarChart } from "@/components/diagnose/RadarChart";
import { ARCHITECTURE_LEVEL_COPY } from "@/lib/content/architecture-level-copy";
import { BOTTLENECK_COPY } from "@/lib/content/bottleneck-copy";
import { STRENGTH_COPY } from "@/lib/content/strength-copy";
import { ACTION_LIBRARY } from "@/lib/content/action-library";
import { buildSummaryParagraph } from "@/lib/content/summary";
import type { LayerId, LayerScore } from "@/lib/types/assessment";
import { LAYER_IDS } from "@/lib/types/assessment";

function rowToLayerScores(row: Record<string, unknown>): LayerScore[] {
  return LAYER_IDS.map((layerId) => ({
    layerId,
    raw: row[`score_${layerId}_raw`] as number,
    score100: row[`score_${layerId}_100`] as number,
  }));
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  const assessment = await getAssessmentById(assessmentId);

  if (!assessment) {
    notFound();
  }

  const layerScores = rowToLayerScores(assessment as unknown as Record<string, unknown>);
  const bottlenecks = [
    assessment.bottleneck_1,
    assessment.bottleneck_2,
    assessment.bottleneck_3,
  ] as LayerId[];
  const strengths = [assessment.strength_1, assessment.strength_2] as LayerId[];
  const level = assessment.architecture_level;
  const summary = buildSummaryParagraph(level, bottlenecks[0]);

  const phases: [string, LayerId][] = [
    ["1~30일", bottlenecks[0]],
    ["31~60일", bottlenecks[1]],
    ["61~90일", bottlenecks[2]],
  ];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          PBA 7-Layer Business Radar
        </p>
        <p className="text-sm text-slate-500">
          {assessment.name} · {new Date(assessment.created_at).toLocaleDateString("ko-KR")}
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">
          Architecture Score {assessment.total_raw} / 140
        </h1>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
          {level.replace("_", " ")}
        </span>
      </section>

      <section className="mx-auto w-full max-w-sm">
        <RadarChart layerScores={layerScores} />
      </section>

      <p className="text-sm leading-relaxed text-slate-600">{summary}</p>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Business Bottleneck Top 3</h2>
        {bottlenecks.map((layerId, i) => (
          <div key={layerId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold">
              {i + 1}. {layerId.toUpperCase()}
            </p>
            <p className="mt-1 text-xs text-slate-600">{BOTTLENECK_COPY[layerId]}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Strength Top 2</h2>
        {strengths.map((layerId, i) => (
          <div key={layerId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold">
              {i + 1}. {layerId.toUpperCase()}
            </p>
            <p className="mt-1 text-xs text-slate-600">{STRENGTH_COPY[layerId]}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">90-Day Architecture Priority</h2>
        {phases.map(([period, layerId]) => (
          <div key={period} className="flex items-start gap-3">
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
              {period}
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">{layerId.toUpperCase()}</p>
              <p className="text-sm font-medium text-slate-700">
                {ACTION_LIBRARY[layerId][0]}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <button className="rounded-full bg-slate-900 py-4 text-sm font-semibold text-white">
          내 사업 구조 상담하기
        </button>
        <button className="rounded-full border border-slate-200 py-4 text-sm font-semibold text-slate-700">
          결과 PDF 받기
        </button>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Verify the project builds**

Run: `npm run build`
Expected: `Compiled successfully`, and the route `/diagnose/result/[assessmentId]` appears in the build output as dynamic (server-rendered).

- [ ] **Step 4: Commit**

```bash
git add "src/app/diagnose/result/[assessmentId]"
git commit -m "feat: add diagnose result page"
```

---

### Task 15: Basic info page

**Files:**
- Create: `src/app/diagnose/page.tsx`

**Interfaces:**
- Consumes: `POST /api/assessment-drafts` (Task 9), `trackEvent` (existing `src/lib/analytics/ga4.ts`), `PRIVACY_NOTICE` (Task 4).
- Produces: the `/diagnose` entry point that the landing page already links to.

- [ ] **Step 1: Create `src/app/diagnose/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics/ga4";
import { PRIVACY_NOTICE } from "@/lib/content/privacy-notice";
import type { BusinessStage } from "@/lib/types/assessment";

const BUSINESS_STAGES: { value: BusinessStage; label: string }[] = [
  { value: "idea", label: "아이디어" },
  { value: "mvp_prep", label: "MVP 준비" },
  { value: "building", label: "구축 중" },
  { value: "operating", label: "운영 중" },
  { value: "growth", label: "성장" },
  { value: "realign", label: "재정비" },
];

export default function DiagnosePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [businessStage, setBusinessStage] = useState<BusinessStage | "">("");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name && email && businessStage && privacyConsent && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/assessment-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        basicInfo: {
          name,
          email,
          companyName: companyName || undefined,
          role: role || undefined,
          businessStage,
          industry: industry || undefined,
          teamSize: teamSize || undefined,
        },
        privacyConsent,
        marketingConsent,
      }),
    });

    if (!response.ok) {
      setError("진단을 시작하지 못했습니다. 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    const { draftId } = await response.json();
    trackEvent("radar_start");
    router.push(`/diagnose/${draftId}`);
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          PBA 7-Layer Business Radar
        </p>
        <h1 className="text-2xl font-bold">기본 정보를 알려주세요</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">이름 *</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">이메일 *</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">회사/브랜드명 (선택)</span>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">역할 (선택)</span>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">사업 단계 *</span>
          <select
            value={businessStage}
            onChange={(e) => setBusinessStage(e.target.value as BusinessStage)}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          >
            <option value="">선택해주세요</option>
            {BUSINESS_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">업종 (선택)</span>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">팀 규모 (선택)</span>
          <input
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5"
          />
        </label>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
            />
            개인정보 수집·이용에 동의합니다 *
          </label>
          <p className="text-xs text-slate-500">{PRIVACY_NOTICE.summary}</p>
          <button
            type="button"
            onClick={() => setNoticeOpen((v) => !v)}
            className="w-fit text-xs font-semibold text-indigo-600"
          >
            자세히 보기 {noticeOpen ? "▴" : "▾"}
          </button>
          {noticeOpen && (
            <div className="flex flex-col gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <div>
                <p className="font-semibold text-slate-700">1. 개인정보 수집 목적</p>
                <p>{PRIVACY_NOTICE.purpose}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">2. 수집항목</p>
                <p className="whitespace-pre-line">{PRIVACY_NOTICE.itemsCollected}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">3. 보유기간</p>
                <p>{PRIVACY_NOTICE.retentionPeriod}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">4. 동의 거부 시 안내</p>
                <p>{PRIVACY_NOTICE.refusalNotice}</p>
              </div>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
          />
          마케팅 정보 수신에 동의합니다
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-slate-900 py-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          {submitting ? "시작하는 중..." : "다음: 문항 시작하기"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Verify the project builds**

Run: `npm run build`
Expected: `Compiled successfully`, `/diagnose` appears as a static/dynamic route.

- [ ] **Step 3: Commit**

```bash
git add src/app/diagnose/page.tsx
git commit -m "feat: add diagnose basic info page"
```

---

### Task 16: Question wizard

**Files:**
- Create: `src/components/diagnose/QuestionWizard.tsx`
- Create: `src/app/diagnose/[draftId]/page.tsx`
- Create: `src/app/diagnose/[draftId]/not-found.tsx`

**Interfaces:**
- Consumes: `GET`/`PATCH /api/assessment-drafts/[draftId]` (Task 10), `POST .../complete` (Task 11), `QUESTIONS`/`LAYER_DESCRIPTIONS` (Tasks 3-4), `trackEvent` (existing), `LAYERS` (existing `layers.config.ts`).
- Produces: the 7-layer question flow, ending in a redirect to the result page.

- [ ] **Step 1: Create `src/app/diagnose/[draftId]/not-found.tsx`**

```tsx
import Link from "next/link";

export default function DraftNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-bold">진단을 찾을 수 없습니다</h1>
      <p className="text-sm text-slate-600">
        링크가 잘못되었거나 이미 완료된 진단일 수 있습니다.
      </p>
      <Link href="/diagnose" className="text-sm font-semibold text-indigo-600 underline">
        새로 시작하기
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: Create `src/components/diagnose/QuestionWizard.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics/ga4";
import { LAYERS } from "@/lib/scoring/layers.config";
import { QUESTIONS } from "@/lib/content/questions";
import { LAYER_DESCRIPTIONS } from "@/lib/content/layer-descriptions";
import type { LayerAnswerSet } from "@/lib/types/assessment";

export function QuestionWizard({
  draftId,
  initialStep,
}: {
  draftId: string;
  initialStep: number;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null]);
  const [submitting, setSubmitting] = useState(false);

  const layer = LAYERS[stepIndex];
  const questions = QUESTIONS[layer.id];
  const allAnswered = answers.every((a) => a !== null);

  function selectAnswer(questionIndex: number, value: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  }

  async function handleNext() {
    if (!allAnswered || submitting) return;
    setSubmitting(true);

    const patchResponse = await fetch(`/api/assessment-drafts/${draftId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        layerId: layer.id,
        answers: answers as LayerAnswerSet,
      }),
    });

    if (!patchResponse.ok) {
      setSubmitting(false);
      return;
    }

    trackEvent("radar_layer_complete", { layer: layer.id });

    const isLastLayer = stepIndex === LAYERS.length - 1;
    if (!isLastLayer) {
      setStepIndex((i) => i + 1);
      setAnswers([null, null, null, null]);
      setSubmitting(false);
      return;
    }

    const completeResponse = await fetch(`/api/assessment-drafts/${draftId}/complete`, {
      method: "POST",
    });

    if (!completeResponse.ok) {
      setSubmitting(false);
      return;
    }

    const { assessmentId } = await completeResponse.json();
    trackEvent("radar_complete");
    router.push(`/diagnose/result/${assessmentId}`);
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-slate-500">
          {stepIndex + 1} / {LAYERS.length} · {layer.name}
        </p>
        <div className="h-1.5 w-full rounded-full bg-slate-100">
          <div
            className="h-1.5 rounded-full bg-slate-900"
            style={{ width: `${((stepIndex + 1) / LAYERS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold">{layer.name}</h1>
        <p className="text-sm text-slate-500">{LAYER_DESCRIPTIONS[layer.id]}</p>
      </div>

      <div className="flex flex-col gap-8">
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="flex flex-col gap-2.5">
            <p className="text-sm font-medium">
              Q{qIndex + 1}. {question}
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectAnswer(qIndex, value)}
                  className={`h-11 flex-1 rounded-lg border text-sm font-semibold ${
                    answers[qIndex] === value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>전혀 정리되지 않음</span>
              <span>명확하게 정의되고 데이터로 관리됨</span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!allAnswered || submitting}
        className="rounded-full bg-slate-900 py-4 text-sm font-semibold text-white disabled:opacity-40"
      >
        {stepIndex === LAYERS.length - 1 ? "결과 보기" : "다음"}
      </button>
    </main>
  );
}
```

- [ ] **Step 3: Create `src/app/diagnose/[draftId]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { QuestionWizard } from "@/components/diagnose/QuestionWizard";

export default async function DraftPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const supabase = createServiceRoleSupabaseClient();
  const { data: draft } = await supabase
    .from("assessment_drafts")
    .select("current_step")
    .eq("id", draftId)
    .maybeSingle();

  if (!draft) {
    notFound();
  }

  return <QuestionWizard draftId={draftId} initialStep={draft.current_step} />;
}
```

- [ ] **Step 4: Verify the project builds**

Run: `npm run build`
Expected: `Compiled successfully`, `/diagnose/[draftId]` appears as a dynamic route.

- [ ] **Step 5: Commit**

```bash
git add src/components/diagnose/QuestionWizard.tsx "src/app/diagnose/[draftId]"
git commit -m "feat: add question wizard and draft page"
```

---

### Task 17: `radar_result_view` GA4 event + README + full manual verification

**Files:**
- Modify: `src/app/diagnose/result/[assessmentId]/page.tsx`
- Create: `src/components/diagnose/TrackResultView.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: `trackEvent` (existing), `TrackPageView` pattern (existing `src/components/TrackPageView.tsx`, same shape).

- [ ] **Step 1: Create `src/components/diagnose/TrackResultView.tsx`**

Mirrors the existing `TrackPageView` pattern (a Client Component so the Server Component result page stays server-rendered):

```tsx
"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/ga4";

export function TrackResultView({ architectureLevel }: { architectureLevel: string }) {
  useEffect(() => {
    trackEvent("radar_result_view", { architecture_level: architectureLevel });
  }, [architectureLevel]);

  return null;
}
```

- [ ] **Step 2: Wire it into the result page**

In `src/app/diagnose/result/[assessmentId]/page.tsx`, add the import:

```ts
import { TrackResultView } from "@/components/diagnose/TrackResultView";
```

And render it as the first child inside the `<main>` returned by the component, right before `<header>`:

```tsx
      <TrackResultView architectureLevel={level} />
      <header className="flex flex-col gap-1">
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: `Compiled successfully`.

- [ ] **Step 4: Update `README.md`**

Read the current file first, then replace the "Scope of this codebase so far" section (added in the earlier scaffold plan) with:

```md
## Scope of this codebase so far

Implemented: project scaffold, Supabase client wiring, the scoring/level/
bottleneck engine, the `assessments` write path, GA4 setup, and the full
`/diagnose` flow (basic info → 7-layer question wizard → result page with
Radar chart). `radar_landing_view`, `radar_start`, `radar_layer_complete`,
`radar_complete`, and `radar_result_view` are all wired.

**Not yet implemented** (future plans): Phase 2 (PDF generation, Resend
email), the consulting request form (`radar_consulting_click`/
`radar_consulting_submit`/`radar_pdf_request` events wait for it), a
standalone privacy-policy page, and abandoned-draft cleanup (TTL/cron).

**Known copy gaps** (intentional placeholders, not bugs — see
`docs/superpowers/specs/2026-09-17-diagnose-flow-and-result-design.md`
section D): `src/lib/content/layer-descriptions.ts` (all 7 layers) and 4
of 7 entries in `src/lib/content/strength-copy.ts` read
`[카피 필요: ...]`. Fill these in before a real launch.
```

- [ ] **Step 5: Manual end-to-end verification**

Run `npm run dev` and, with `.env.local` filled in (Supabase keys + the Task 1 migrations applied), walk the full path once in a browser:

1. Visit `/` → click "무료 Business Radar 시작하기" → lands on `/diagnose`.
2. Fill in name/email/사업 단계, check "개인정보 수집·이용에 동의합니다", submit → redirected to `/diagnose/<draftId>`.
3. Answer all 4 questions for VALUE, click "다음" → advances to CUSTOMER (2/7).
4. **Reload the browser tab** on the CUSTOMER screen → confirm it reloads showing 2/7 (not back to 1/7 or an error) — this is the spec section 26 Case 5 resume behavior the whole draft/current_step design exists for.
5. Complete the remaining 5 layers → last layer's button reads "결과 보기" → click it → redirected to `/diagnose/result/<assessmentId>`.
6. Confirm the result page shows: score/level, a rendered Radar chart with 7 axes, a summary paragraph, 3 bottleneck cards, 2 strength cards, a 3-phase 90-day timeline, and both CTA buttons.
7. In Supabase Studio, confirm: a row now exists in `assessments` with `privacy_consent = true`, a non-null `privacy_consent_at`, and `privacy_notice_version = '2026-09-17'`; the corresponding `assessment_drafts` row is gone (deleted on completion).
8. Visit `/diagnose/result/<assessmentId>` again directly (fresh page load) → confirms the result is reloadable/shareable by URL, not just reachable via the in-app redirect.

Report the outcome of each of these 8 checks back to the user — this is the plan's acceptance test, equivalent to requirements spec section 26 Case 5 plus the section 27 checklist items this plan covers.

- [ ] **Step 6: Commit**

```bash
git add src/components/diagnose/TrackResultView.tsx "src/app/diagnose/result/[assessmentId]/page.tsx" README.md
git commit -m "feat: wire radar_result_view GA4 event, update README"
```

---

## Self-Review Notes

- **Spec coverage:** design spec sections A (data model incl. consent tracking), B (all 5 routes), C (all pages/components + GA4 events), D (all content files incl. `questions.ts`, which the design spec didn't explicitly name but is required by section C's `QuestionWizard`), F (privacy notice, implemented verbatim from Figma per the user's explicit instruction) are all covered by a task. E (testing) is satisfied per-task rather than as a separate task — every logic-bearing file has a co-located test.
- **Placeholder scan:** no TBD/TODO markers in code. The `[카피 필요: ...]` strings are intentional product content gaps, called out explicitly in Task 4, Task 17, and the design spec — not implementation placeholders.
- **Type consistency:** `AssessmentInsertRow` (Task 6) gains exactly the 3 fields (`privacy_consent`, `privacy_consent_at`, `privacy_notice_version`) that migration `0002` (Task 1) adds to the `assessments` table, and matches what `persistAssessment` (Task 7) and `getAssessmentById` (Task 8) both read/write. `AssessmentDraftRow` (Task 2) matches the `assessment_drafts` columns from migration `0003` (Task 1) exactly. `DraftAnswers`/`mergeLayerAnswers`/`countCompletedLayers`/`isDraftComplete` (Task 5) are used identically by the PATCH route (Task 10) and the complete route (Task 11).
- **Known residual issue, carried forward on purpose:** the design spec's section F flags that the Figma-authorized privacy notice text (implemented verbatim in Task 4/15) describes a decline path that Decision 5 makes unreachable. This plan does not fix that copy — it's the user's call, not engineering's, per their explicit instruction not to further edit the Figma-derived text.
