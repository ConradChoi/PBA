# Result Enrichment Phase A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the free result page into a fuller diagnostic report — per-layer maturity, rule-based risk signals, and one cause hypothesis — without collecting any new data, and stop sending assessment UUIDs to GA4.

**Architecture:** Everything new is derived at render time from scores already stored on the assessment. Pure functions live in `src/lib/scoring/` (unit-tested), copy lives as data in `src/lib/content/` (the CEO edits these files later), and `ResultReport` renders them. A new `audience` prop on `ResultReport` decides whether the admin-only hypothesis is shown. No migration, no API change, no new dependency.

**Tech Stack:** Next.js 15 App Router (server components), TypeScript, Tailwind v3, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-19-result-enrichment-design.md` (Phase A sections A1–A4). Copy comes from `docs/content/2026-09-19-result-content-draft.md`.

## Global Constraints

- Phase A collects **no new data**: no migration, no new column, no new API route, no privacy policy or consent notice change.
- Copy is data, not code: every new sentence lives in a `src/lib/content/*.ts` file so it can be edited without touching logic.
- Public copy must not claim the method is validated or statistically proven.
- Only one cause hypothesis (`public`) may ever reach the public result page; `internal` is admin-only.
- Korean copy only — no translation work here (i18n comes later and will move these files into locale messages).
- Print output must include the new sections; it already hides site chrome and CTAs.
- The existing test suite (115 tests) must stay green; run `npm test` before each commit.

---

### Task 1: Maturity level function and level names

**Files:**
- Create: `src/lib/scoring/maturity.ts`
- Create: `src/lib/scoring/maturity.test.ts`
- Create: `src/lib/content/maturity-levels.ts`

**Interfaces:**
- Produces: `type MaturityLevel = 1 | 2 | 3 | 4 | 5`, `maturityLevel(raw: number): MaturityLevel`, `MATURITY_LEVELS: Record<MaturityLevel, string>` — consumed by Tasks 2, 3 and 4.

- [ ] **Step 1: Write the failing test**

Create `src/lib/scoring/maturity.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { maturityLevel } from "./maturity";

describe("maturityLevel", () => {
  it("maps each band of the layer raw score (4-20) to a level", () => {
    expect(maturityLevel(4)).toBe(1);
    expect(maturityLevel(5)).toBe(1);
    expect(maturityLevel(6)).toBe(2);
    expect(maturityLevel(9)).toBe(2);
    expect(maturityLevel(10)).toBe(3);
    expect(maturityLevel(13)).toBe(3);
    expect(maturityLevel(14)).toBe(4);
    expect(maturityLevel(17)).toBe(4);
    expect(maturityLevel(18)).toBe(5);
    expect(maturityLevel(20)).toBe(5);
  });

  it("rejects a raw score outside the 4-20 range", () => {
    expect(() => maturityLevel(3)).toThrow(RangeError);
    expect(() => maturityLevel(21)).toThrow(RangeError);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/scoring/maturity.test.ts`
Expected: FAIL — `Cannot find module './maturity'`

- [ ] **Step 3: Implement `src/lib/scoring/maturity.ts`**

```ts
export type MaturityLevel = 1 | 2 | 3 | 4 | 5;

// The layer raw score is the sum of its four 1-5 answers, so the level is
// the rounded average: a layer reaches the level its answers describe.
export function maturityLevel(raw: number): MaturityLevel {
  if (raw < 4 || raw > 20) {
    throw new RangeError(`layer raw score must be between 4 and 20, got ${raw}`);
  }
  if (raw >= 18) return 5;
  if (raw >= 14) return 4;
  if (raw >= 10) return 3;
  if (raw >= 6) return 2;
  return 1;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/scoring/maturity.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Create `src/lib/content/maturity-levels.ts`**

```ts
import type { MaturityLevel } from "../scoring/maturity";

// Names mirror the answer scale (요구사항 6장), so the level a layer reaches
// means the same thing as the answers the person gave.
export const MATURITY_LEVELS: Record<MaturityLevel, string> = {
  1: "미정의",
  2: "인식",
  3: "정리",
  4: "운영",
  5: "체계화",
};
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/scoring/maturity.ts src/lib/scoring/maturity.test.ts src/lib/content/maturity-levels.ts
git commit -m "feat: add per-layer maturity levels"
```

---

### Task 2: Maturity anchors content

**Files:**
- Create: `src/lib/content/maturity-anchors.ts`
- Create: `src/lib/content/maturity-anchors.test.ts`

**Interfaces:**
- Consumes: `MaturityLevel` (Task 1).
- Produces: `MATURITY_ANCHORS: Record<LayerId, Record<MaturityLevel, string>>` — consumed by Task 4.

- [ ] **Step 1: Write the failing test**

Create `src/lib/content/maturity-anchors.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { MATURITY_ANCHORS } from "./maturity-anchors";
import { LAYER_IDS } from "../types/assessment";

describe("MATURITY_ANCHORS", () => {
  it("has a non-empty anchor for all 7 layers at all 5 levels", () => {
    for (const layerId of LAYER_IDS) {
      for (const level of [1, 2, 3, 4, 5] as const) {
        expect(MATURITY_ANCHORS[layerId][level].length).toBeGreaterThan(10);
      }
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/content/maturity-anchors.test.ts`
Expected: FAIL — `Cannot find module './maturity-anchors'`

- [ ] **Step 3: Create `src/lib/content/maturity-anchors.ts`**

Copy verbatim from `docs/content/2026-09-19-result-content-draft.md` section 2:

```ts
import type { LayerId } from "../types/assessment";
import type { MaturityLevel } from "../scoring/maturity";

// Drafted by Claude (2026-09-19) from each layer's four questions; pending
// the CEO's review in docs/content/2026-09-19-result-content-draft.md.
export const MATURITY_ANCHORS: Record<LayerId, Record<MaturityLevel, string>> = {
  value: {
    1: "고객이 해결하려는 문제와 우리가 주는 가치가 아직 정리되지 않은 상태입니다.",
    2: "해결하려는 문제는 떠올릴 수 있지만, 한 문장으로 정의하거나 기존 대안과 비교해 설명하지는 못하는 상태입니다.",
    3: "핵심 문제와 차별점은 정리되어 있지만, 실제 고객이 원하는 가치와 일치하는지는 확인되지 않았습니다.",
    4: "정리된 가치 제안이 영업·마케팅에 실제로 쓰이고, 고객이 비용을 지불하는 이유를 설명할 수 있습니다.",
    5: "가치 제안이 고객 인터뷰와 구매·이탈 데이터로 확인되고 주기적으로 갱신됩니다.",
  },
  customer: {
    1: "누가 우리 고객인지 구체적으로 정의되어 있지 않습니다.",
    2: "대략적인 고객층은 있지만, 사용자와 구매자, 고객별 니즈를 구분하지 않습니다.",
    3: "핵심 고객과 구매자·사용자는 정의되어 있지만, 구매를 결정하게 만드는 계기는 추정 수준입니다.",
    4: "고객 정의와 구매 계기가 마케팅·영업 대상을 정하는 데 실제로 쓰이고 있습니다.",
    5: "고객군별 전환·유지 데이터로 고객 정의를 확인하고 갱신합니다.",
  },
  offer: {
    1: "무엇을 얼마에 파는지가 고객이나 상황마다 달라지는 상태입니다.",
    2: "핵심 상품은 있지만, 가격 기준과 다음 상품으로 이어지는 구조가 없습니다.",
    3: "핵심 상품과 가격 기준은 정리되어 있지만, 입문→핵심→고가로 이어지는 구조와 반복 매출은 아직 설계 단계입니다.",
    4: "상품 사다리와 가격 체계가 실제 판매에 적용되고, 반복 매출이 일부 발생합니다.",
    5: "상품별 전환율·객단가·재구매 데이터로 상품 구성과 가격을 조정합니다.",
  },
  experience: {
    1: "고객이 어떻게 우리를 알게 되고 어디서 떠나는지 파악되지 않았습니다.",
    2: "주요 유입 경로는 짐작하지만, 구매 이후의 여정과 이탈 지점은 관리하지 않습니다.",
    3: "관심부터 재구매까지의 여정은 그려져 있지만, 경험의 질이 담당자에 따라 달라집니다.",
    4: "설계된 고객 여정이 실제로 운영되고, 주요 이탈 지점을 파악해 대응합니다.",
    5: "여정 단계별 전환·이탈 데이터를 추적하며 경험을 계속 개선합니다.",
  },
  process: {
    1: "업무가 정해진 흐름 없이 그때그때 사람의 판단으로 처리됩니다.",
    2: "업무 흐름은 머릿속에 있지만 문서로 정리되지 않았고, 반복 수작업이 많습니다.",
    3: "주요 프로세스는 정리되어 있지만, 사람과 시스템의 역할은 일부만 나뉘어 있습니다.",
    4: "정의된 프로세스대로 업무가 돌아가며, 대표나 특정 직원이 빠져도 대부분 처리됩니다.",
    5: "프로세스 성과를 측정하고, 반복 업무를 자동화하며 계속 개선합니다.",
  },
  data: {
    1: "고객 행동이나 서비스 이용 데이터가 거의 기록되지 않습니다.",
    2: "일부 데이터는 쌓이지만, 무엇을 왜 수집하는지 정의되어 있지 않습니다.",
    3: "수집할 데이터와 목적은 정의되어 있지만, 의사결정에는 가끔만 쓰입니다.",
    4: "데이터를 근거로 고객 경험이나 업무를 실제로 개선하고 있습니다.",
    5: "데이터가 의사결정의 기본이며, AI·자동화 적용 지점이 구체적으로 운영됩니다.",
  },
  scale: {
    1: "매출이 늘면 대표의 업무시간도 그만큼 늘어나는 구조입니다.",
    2: "확장이 필요하다고 느끼지만, 업무 표준이나 매뉴얼이 없습니다.",
    3: "일부 업무는 표준화되어 있지만, 다른 사람이 같은 품질을 내기는 아직 어렵습니다.",
    4: "표준과 매뉴얼로 다른 사람도 같은 품질을 내며, 반복 매출 구조가 작동합니다.",
    5: "매출이 늘어도 운영 부담이 비례해 늘지 않고, 구독·라이선스·파트너 구조로 확장합니다.",
  },
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/content/maturity-anchors.test.ts`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/maturity-anchors.ts src/lib/content/maturity-anchors.test.ts
git commit -m "content: add maturity anchors for all 7 layers"
```

---

### Task 3: Risk signal rules and evaluation

**Files:**
- Create: `src/lib/content/risk-signals.ts`
- Create: `src/lib/scoring/risk-signals.ts`
- Create: `src/lib/scoring/risk-signals.test.ts`

**Interfaces:**
- Consumes: `MaturityLevel` (Task 1).
- Produces: `type RiskSignalRule = { id: string; priority: number; when: { layer: LayerId; op: "<=" | ">="; level: MaturityLevel }[]; title: string; message: string }`, `RISK_SIGNALS: RiskSignalRule[]`, `evaluateRiskSignals(levels: Record<LayerId, MaturityLevel>): RiskSignalRule[]` (max 2, priority order) — consumed by Task 5.

- [ ] **Step 1: Create `src/lib/content/risk-signals.ts`**

Copy verbatim from the content draft section 3:

```ts
import type { LayerId } from "../types/assessment";
import type { MaturityLevel } from "../scoring/maturity";

export type RiskSignalRule = {
  id: string;
  // Lower runs first; at most two signals are ever shown.
  priority: number;
  // Every condition must hold for the signal to fire.
  when: { layer: LayerId; op: "<=" | ">="; level: MaturityLevel }[];
  title: string;
  message: string;
};

// Drafted by Claude (2026-09-19); pending the CEO's review in
// docs/content/2026-09-19-result-content-draft.md.
export const RISK_SIGNALS: RiskSignalRule[] = [
  {
    id: "founder_bottleneck",
    priority: 1,
    when: [
      { layer: "process", op: "<=", level: 2 },
      { layer: "scale", op: "<=", level: 2 },
    ],
    title: "대표 의존 병목",
    message: "업무가 대표에게 묶여 있어, 성장이 대표의 시간에 막힐 가능성이 큽니다.",
  },
  {
    id: "scaling_without_structure",
    priority: 2,
    when: [
      { layer: "value", op: "<=", level: 2 },
      { layer: "scale", op: ">=", level: 4 },
    ],
    title: "구조 없는 확장",
    message:
      "가치 정의가 흐린 상태에서 규모를 키우고 있습니다. 확장할수록 고객 이탈과 가격 압박이 커질 수 있습니다.",
  },
  {
    id: "automation_before_process",
    priority: 3,
    when: [
      { layer: "data", op: ">=", level: 4 },
      { layer: "process", op: "<=", level: 2 },
    ],
    title: "정리 전 자동화",
    message:
      "데이터·AI 활용에 비해 업무 흐름이 정리되어 있지 않습니다. 정리되지 않은 프로세스를 자동화하면 비효율도 함께 자동화됩니다.",
  },
  {
    id: "offer_without_customer",
    priority: 4,
    when: [
      { layer: "customer", op: "<=", level: 2 },
      { layer: "offer", op: ">=", level: 4 },
    ],
    title: "고객 없는 상품 설계",
    message:
      "상품 구조는 갖춰졌지만 핵심 고객 정의가 약합니다. 상품이 고객이 아니라 공급자 관점에서 설계되었을 수 있습니다.",
  },
  {
    id: "invisible_churn",
    priority: 5,
    when: [
      { layer: "experience", op: "<=", level: 2 },
      { layer: "data", op: "<=", level: 2 },
    ],
    title: "보이지 않는 이탈",
    message: "고객이 어디서, 왜 떠나는지 보이지 않는 상태입니다. 개선이 감에 의존하게 됩니다.",
  },
];
```

- [ ] **Step 2: Write the failing test**

Create `src/lib/scoring/risk-signals.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { evaluateRiskSignals } from "./risk-signals";
import { RISK_SIGNALS } from "../content/risk-signals";
import { LAYER_IDS } from "../types/assessment";
import type { MaturityLevel } from "./maturity";
import type { LayerId } from "../types/assessment";

function levels(overrides: Partial<Record<LayerId, MaturityLevel>>) {
  return Object.fromEntries(
    LAYER_IDS.map((id) => [id, overrides[id] ?? 3])
  ) as Record<LayerId, MaturityLevel>;
}

describe("evaluateRiskSignals", () => {
  it("returns nothing when no rule matches", () => {
    expect(evaluateRiskSignals(levels({}))).toEqual([]);
  });

  it("returns the single matching rule", () => {
    const result = evaluateRiskSignals(levels({ value: 2, scale: 4 }));

    expect(result.map((r) => r.id)).toEqual(["scaling_without_structure"]);
  });

  it("returns at most two, in priority order", () => {
    // process 2 + scale 2 (priority 1), data 4 + process 2 (priority 3),
    // experience 2 + data 2 does not hold because data is 4.
    const result = evaluateRiskSignals(
      levels({ process: 2, scale: 2, data: 4, customer: 2, offer: 4 })
    );

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual([
      "founder_bottleneck",
      "automation_before_process",
    ]);
  });
});

describe("RISK_SIGNALS", () => {
  it("references valid layers and levels and has unique ids and priorities", () => {
    const ids = new Set(RISK_SIGNALS.map((r) => r.id));
    const priorities = new Set(RISK_SIGNALS.map((r) => r.priority));

    expect(ids.size).toBe(RISK_SIGNALS.length);
    expect(priorities.size).toBe(RISK_SIGNALS.length);
    for (const rule of RISK_SIGNALS) {
      expect(rule.when.length).toBeGreaterThan(0);
      for (const condition of rule.when) {
        expect(LAYER_IDS).toContain(condition.layer);
        expect(condition.level).toBeGreaterThanOrEqual(1);
        expect(condition.level).toBeLessThanOrEqual(5);
      }
    }
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/lib/scoring/risk-signals.test.ts`
Expected: FAIL — `Cannot find module './risk-signals'`

- [ ] **Step 4: Implement `src/lib/scoring/risk-signals.ts`**

```ts
import type { LayerId } from "../types/assessment";
import type { MaturityLevel } from "./maturity";
import { RISK_SIGNALS, type RiskSignalRule } from "../content/risk-signals";

const MAX_SIGNALS = 2;

export function evaluateRiskSignals(
  levels: Record<LayerId, MaturityLevel>
): RiskSignalRule[] {
  return RISK_SIGNALS.filter((rule) =>
    rule.when.every(({ layer, op, level }) =>
      op === "<=" ? levels[layer] <= level : levels[layer] >= level
    )
  )
    .sort((a, b) => a.priority - b.priority)
    .slice(0, MAX_SIGNALS);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/lib/scoring/risk-signals.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add src/lib/content/risk-signals.ts src/lib/scoring/risk-signals.ts src/lib/scoring/risk-signals.test.ts
git commit -m "feat: add rule-based risk signals"
```

---

### Task 4: Cause hypotheses content

**Files:**
- Create: `src/lib/content/cause-hypotheses.ts`
- Create: `src/lib/content/cause-hypotheses.test.ts`

**Interfaces:**
- Produces: `CAUSE_HYPOTHESES: Record<LayerId, { public: string; internal: string }>` — consumed by Task 5.

- [ ] **Step 1: Write the failing test**

Create `src/lib/content/cause-hypotheses.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { CAUSE_HYPOTHESES } from "./cause-hypotheses";
import { LAYER_IDS } from "../types/assessment";

describe("CAUSE_HYPOTHESES", () => {
  it("has a public and an internal hypothesis for every layer", () => {
    for (const layerId of LAYER_IDS) {
      expect(CAUSE_HYPOTHESES[layerId].public.length).toBeGreaterThan(10);
      expect(CAUSE_HYPOTHESES[layerId].internal.length).toBeGreaterThan(10);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/content/cause-hypotheses.test.ts`
Expected: FAIL — `Cannot find module './cause-hypotheses'`

- [ ] **Step 3: Create `src/lib/content/cause-hypotheses.ts`**

Copy verbatim from the content draft section 4. `public` is shown on the result page for the worst layer only; `internal` never leaves the admin.

```ts
import type { LayerId } from "../types/assessment";

// Drafted by Claude (2026-09-19); pending the CEO's review in
// docs/content/2026-09-19-result-content-draft.md.
export const CAUSE_HYPOTHESES: Record<
  LayerId,
  { public: string; internal: string }
> = {
  value: {
    public: "고객 인터뷰 없이 공급자 관점에서 가치를 정의했을 가능성이 있습니다.",
    internal:
      "여러 고객군의 요구를 하나의 가치 제안에 담으려다 메시지가 흐려졌을 가능성. CUSTOMER 정의와 함께 확인.",
  },
  customer: {
    public:
      "'누구나 고객'이라는 넓은 정의로 시작해, 핵심 고객을 좁히지 못했을 가능성이 있습니다.",
    internal:
      "구매자와 사용자가 다른데 사용자만 보고 설계했을 가능성. B2B·교육·헬스케어에서 흔함. 실제 결제 결정자를 확인.",
  },
  offer: {
    public:
      "고객 요청마다 맞춤으로 대응하다 상품이 표준화되지 않았을 가능성이 있습니다.",
    internal:
      "가격을 원가나 경쟁사 기준으로 정해, 고객이 체감하는 가치와 연결되지 않았을 가능성. 가격 결정 근거를 확인.",
  },
  experience: {
    public:
      "유입과 첫 구매에 집중하느라 구매 이후의 경험이 설계되지 않았을 가능성이 있습니다.",
    internal:
      "고객 응대가 특정 담당자 역량에 의존해 담당자마다 경험 품질이 달라질 가능성. 응대 기록과 담당자별 재구매율을 확인.",
  },
  process: {
    public:
      "대표가 대부분의 판단을 직접 하면서, 업무 흐름을 문서로 만들 기회가 없었을 가능성이 있습니다.",
    internal:
      "프로세스 정의 없이 도구를 먼저 도입해 업무가 도구마다 흩어졌을 가능성. 사용 중인 도구 목록과 업무 연결을 확인.",
  },
  data: {
    public:
      "데이터를 '나중에 볼 것'으로 미뤄, 무엇을 왜 기록할지 정하지 않았을 가능성이 있습니다.",
    internal:
      "데이터는 쌓이지만 여러 도구에 흩어져 한곳에서 볼 수 없을 가능성. 데이터 위치와 담당자를 확인.",
  },
  scale: {
    public:
      "'대표가 직접 해야 품질이 나온다'는 전제로 운영해, 표준화가 계속 미뤄졌을 가능성이 있습니다.",
    internal:
      "반복 매출 없이 프로젝트성 매출에 의존해, 매출이 투입 인력에 비례할 가능성. 매출 구성을 확인.",
  },
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/content/cause-hypotheses.test.ts`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/cause-hypotheses.ts src/lib/content/cause-hypotheses.test.ts
git commit -m "content: add per-layer cause hypotheses"
```

---

### Task 5: Render the new sections in `ResultReport`

**Files:**
- Modify: `src/components/diagnose/ResultReport.tsx`
- Modify: `src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx`
- Modify: `src/app/diagnose/result/[assessmentId]/page.tsx`
- Modify: `src/components/diagnose/ConsultingCtaLink.tsx`

**Interfaces:**
- Consumes: `maturityLevel`, `MATURITY_LEVELS` (Task 1), `MATURITY_ANCHORS` (Task 2), `evaluateRiskSignals` (Task 3), `CAUSE_HYPOTHESES` (Task 4), `LAYERS` from `src/lib/scoring/layers.config.ts` (existing, gives each layer's display name).
- Produces: `ResultReport` gains a required-with-default prop `audience: "public" | "admin"` (defaults to `"public"`).

- [ ] **Step 1: Add the maturity section to `ResultReport.tsx`**

Add these imports at the top of the file:

```ts
import { maturityLevel } from "@/lib/scoring/maturity";
import { evaluateRiskSignals } from "@/lib/scoring/risk-signals";
import { MATURITY_LEVELS } from "@/lib/content/maturity-levels";
import { MATURITY_ANCHORS } from "@/lib/content/maturity-anchors";
import { CAUSE_HYPOTHESES } from "@/lib/content/cause-hypotheses";
import { LAYERS } from "@/lib/scoring/layers.config";
```

Change the component signature from `export function ResultReport({ assessment }: { assessment: AssessmentRow })` to:

```tsx
export function ResultReport({
  assessment,
  audience = "public",
}: {
  assessment: AssessmentRow;
  // "admin" additionally shows the consulting-only hypotheses.
  audience?: "public" | "admin";
}) {
```

Inside the component, after the existing `const phases: [string, LayerId][] = [...]` block, add:

```ts
  const levelByLayer = Object.fromEntries(
    layerScores.map((score) => [score.layerId, maturityLevel(score.raw)])
  ) as Record<LayerId, ReturnType<typeof maturityLevel>>;
  const riskSignals = evaluateRiskSignals(levelByLayer);
  const layerNameById = new Map(LAYERS.map((layer) => [layer.id, layer.name]));
```

Then insert this section immediately after the radar chart `<section>` (the one containing `<RadarChart ... />`):

```tsx
      <section className="flex flex-col gap-3 break-inside-avoid">
        <h2 className="text-lg font-bold">레이어별 성숙도</h2>
        <div className="flex flex-col gap-2.5">
          {LAYER_IDS.map((layerId) => {
            const level = levelByLayer[layerId];
            return (
              <div
                key={layerId}
                className="flex flex-col gap-1 rounded-lg border border-slate-200 p-3 break-inside-avoid"
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{layerNameById.get(layerId)}</p>
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    L{level} {MATURITY_LEVELS[level]}
                  </span>
                  <span className="ml-auto flex gap-0.5" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <span
                        key={step}
                        className={`h-1.5 w-5 rounded-full ${
                          step <= level ? "bg-slate-900" : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {MATURITY_ANCHORS[layerId][level]}
                </p>
              </div>
            );
          })}
        </div>
      </section>
```

- [ ] **Step 2: Add the risk signal section**

Insert immediately after the "Business Bottleneck Top 3" `<section>`:

```tsx
      {riskSignals.length > 0 && (
        <section className="flex flex-col gap-3 break-inside-avoid">
          <h2 className="text-lg font-bold">위험 신호</h2>
          {riskSignals.map((signal) => (
            <div
              key={signal.id}
              className="rounded-lg border border-amber-200 bg-amber-50 p-4 break-inside-avoid"
            >
              <p className="text-sm font-semibold text-amber-900">{signal.title}</p>
              <p className="mt-1 text-xs text-amber-900/80">{signal.message}</p>
            </div>
          ))}
        </section>
      )}
```

- [ ] **Step 3: Add the hypothesis card**

Insert immediately after the risk signal block (before "Strength Top 2"):

```tsx
      <section className="flex flex-col gap-3 break-inside-avoid">
        <h2 className="text-lg font-bold">가능성 높은 원인 가설</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">
            {layerNameById.get(bottlenecks[0])}가 낮은 원인으로 가장 흔한 경우는 다음과 같습니다.
          </p>
          <p className="mt-1.5 text-sm text-slate-800">
            {CAUSE_HYPOTHESES[bottlenecks[0]].public}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            위 가설이 실제 원인인지, 상담에서 프로세스와 데이터를 함께 확인해 드립니다.
          </p>
        </div>
        {audience === "admin" && (
          <div className="flex flex-col gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-xs font-semibold text-indigo-900">
              상담용 가설 (고객 화면에는 보이지 않습니다)
            </p>
            {bottlenecks.map((layerId) => (
              <div key={layerId}>
                <p className="text-xs font-semibold text-indigo-900">
                  {layerNameById.get(layerId)}
                </p>
                <p className="text-xs text-indigo-900/80">
                  {CAUSE_HYPOTHESES[layerId].internal}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
```

- [ ] **Step 4: Pass `audience="admin"` from the admin detail page**

In `src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx`, change:

```tsx
        <ResultReport assessment={assessment} />
```

to:

```tsx
        <ResultReport assessment={assessment} audience="admin" />
```

- [ ] **Step 5: Update the consult CTA copy**

In `src/components/diagnose/ConsultingCtaLink.tsx`, change the link text `내 사업 구조 상담하기` to `원인 가설 검증 상담받기`. Leave the href and `trackEvent("radar_consulting_click")` call unchanged.

- [ ] **Step 6: Typecheck, test, and build**

Run: `npm run typecheck && npm test && npm run build`
Expected: no type errors, all tests pass (123 after Tasks 1-4), `✓ Compiled successfully`.

- [ ] **Step 7: Verify in the browser**

Start `npm run dev`, create an assessment through `/diagnose` (or reuse an existing result URL), and confirm on the result page: the maturity section lists all 7 layers with a level badge, bar and anchor; a risk signal appears only when a rule matches; the hypothesis card shows exactly one hypothesis; the CTA reads "원인 가설 검증 상담받기". Then open the same assessment in `/admin/assessments/<id>` → "고객 결과 화면 보기" and confirm the indigo consulting-only block appears there and only there. Delete any test data created via Supabase afterwards.

- [ ] **Step 8: Commit**

```bash
git add src/components/diagnose/ResultReport.tsx src/components/diagnose/ConsultingCtaLink.tsx "src/app/admin/(dashboard)/assessments/[assessmentId]/page.tsx"
git commit -m "feat: show maturity, risk signals and a cause hypothesis on the result"
```

---

### Task 6: Keep assessment IDs out of GA4

**Files:**
- Create: `src/lib/analytics/mask-path.ts`
- Create: `src/lib/analytics/mask-path.test.ts`
- Modify: `src/components/GoogleAnalytics.tsx`

**Interfaces:**
- Produces: `maskAnalyticsPath(path: string): string` and `MASK_RULES_JS: string` (the same rules serialized for the inline gtag snippet) — used only by `GoogleAnalytics`.

**Why:** the assessment UUID in the result URL is the only credential needed to view that result. GA4 sends `page_location` to Google (US) on every event, which would hand out those credentials. Masking replaces the UUID with `:id` before gtag ever sees it.

- [ ] **Step 1: Write the failing test**

Create `src/lib/analytics/mask-path.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { maskAnalyticsPath, MASK_RULES_JS } from "./mask-path";

describe("maskAnalyticsPath", () => {
  it("masks the assessment id on a result page", () => {
    expect(
      maskAnalyticsPath("/diagnose/result/8f9fef0b-7a8d-4336-9d06-b7de6c881e3d")
    ).toBe("/diagnose/result/:id");
  });

  it("masks the assessment id on a consult page", () => {
    expect(
      maskAnalyticsPath("/diagnose/result/8f9fef0b-7a8d-4336-9d06-b7de6c881e3d/consult")
    ).toBe("/diagnose/result/:id/consult");
  });

  it("masks the draft id while answering questions", () => {
    expect(maskAnalyticsPath("/diagnose/9d7bd91d-0675-401c-b65a-e930c1399573")).toBe(
      "/diagnose/:draftId"
    );
  });

  it("leaves paths without an id untouched", () => {
    expect(maskAnalyticsPath("/diagnose")).toBe("/diagnose");
    expect(maskAnalyticsPath("/privacy")).toBe("/privacy");
  });
});

describe("MASK_RULES_JS", () => {
  it("serializes every rule for the inline gtag snippet", () => {
    const rules = JSON.parse(MASK_RULES_JS) as [string, string][];

    expect(rules).toHaveLength(2);
    expect(rules.map(([, replacement]) => replacement)).toEqual([
      "/diagnose/result/:id",
      "/diagnose/:draftId",
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/analytics/mask-path.test.ts`
Expected: FAIL — `Cannot find module './mask-path'`

- [ ] **Step 3: Implement `src/lib/analytics/mask-path.ts`**

```ts
const UUID = "[0-9a-fA-F-]{36}";

// Single source of truth: used directly on the server and serialized into
// the inline gtag snippet so both mask identically.
const MASK_RULES: [RegExp, string][] = [
  [new RegExp(`/diagnose/result/${UUID}`), "/diagnose/result/:id"],
  [new RegExp(`/diagnose/${UUID}`), "/diagnose/:draftId"],
];

export function maskAnalyticsPath(path: string): string {
  return MASK_RULES.reduce(
    (masked, [pattern, replacement]) => masked.replace(pattern, replacement),
    path
  );
}

export const MASK_RULES_JS = JSON.stringify(
  MASK_RULES.map(([pattern, replacement]) => [pattern.source, replacement])
);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/analytics/mask-path.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Apply the mask in `GoogleAnalytics.tsx`**

Replace the file's contents with:

```tsx
import Script from "next/script";
import { MASK_RULES_JS } from "@/lib/analytics/mask-path";

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          // A result URL's id is the only credential to view that result, so
          // it must never reach Google. gtag('set') applies to page_view and
          // to every later event.
          var maskRules = ${MASK_RULES_JS};
          var maskedPath = maskRules.reduce(function (path, rule) {
            return path.replace(new RegExp(rule[0]), rule[1]);
          }, location.pathname);
          gtag('set', {
            page_path: maskedPath,
            page_location: location.origin + maskedPath + location.search,
          });
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
```

- [ ] **Step 6: Typecheck, test, and build**

Run: `npm run typecheck && npm test && npm run build`
Expected: no type errors, all tests pass (128 after Tasks 1-5), `✓ Compiled successfully`.

- [ ] **Step 7: Verify the rendered script**

With `npm run dev` running and `NEXT_PUBLIC_GA_MEASUREMENT_ID` set in `.env.local`:

```bash
curl -s "http://localhost:3000/diagnose/result/<any-assessment-id>" | grep -o "maskRules = .*"
```

Expected: the serialized rules appear, and the page's GA snippet contains `page_path: maskedPath`. In a browser with devtools open, load a result page and confirm the request to `google-analytics.com/g/collect` carries `dl=` ending in `/diagnose/result/:id` rather than the UUID.

- [ ] **Step 8: Commit**

```bash
git add src/lib/analytics/mask-path.ts src/lib/analytics/mask-path.test.ts src/components/GoogleAnalytics.tsx
git commit -m "fix: mask assessment ids in GA4 page paths"
```

---

### Task 7: Documentation and final verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update `README.md`**

In the "Scope of this codebase so far" section, extend the sentence about the result page so it reads "… result page with Radar chart, summary, per-layer maturity, risk signals, a cause hypothesis, bottleneck/strength cards, and a 90-day priority timeline". In the GA4 section, add a bullet: "Page paths containing an assessment or draft id are masked (`/diagnose/result/:id`) before gtag sees them — see `src/lib/analytics/mask-path.ts`."

- [ ] **Step 2: Full verification**

Run: `npm run typecheck && npm test && npm run build`
Expected: no type errors, all tests pass, build succeeds.

With `npm run dev` running, complete one diagnosis end to end and check:
1. Maturity section renders 7 layers with level badges and anchors matching the level.
2. A layer answered all 1s shows L1 with the L1 anchor; all 5s shows L5.
3. Risk signals appear only when a rule matches, never more than two.
4. The hypothesis card shows the public hypothesis for bottleneck #1 only.
5. The CTA reads "원인 가설 검증 상담받기" and still opens the consult page.
6. "결과 PDF 저장 · 인쇄" includes maturity, risk signals and the hypothesis card, and still excludes the CTAs.
7. The admin result popup shows the consulting-only hypotheses; the public page does not contain the word "상담용".
8. GA4 collect requests carry `:id` instead of the UUID.

Delete any assessments created during verification from Supabase.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: note result enrichment and GA4 path masking in README"
```

---

## Self-Review Notes

- **Spec coverage:** A1 (maturity) → Tasks 1, 2, 5; A2 (risk signals) → Tasks 3, 5; A3 (hypothesis teaser, `audience` prop, CTA copy) → Tasks 4, 5; A4 (GA4 masking) → Task 6. Phase B sections are deliberately absent — they ship after the privacy policy announcement takes effect.
- **Placeholder scan:** no TBD/TODO; every copy string is spelled out; every code step has runnable code.
- **Type consistency:** `MaturityLevel` is defined once in `src/lib/scoring/maturity.ts` and imported by the content files and `evaluateRiskSignals`. `RiskSignalRule` is defined once in `src/lib/content/risk-signals.ts` and imported by the evaluator. `ResultReport`'s new `audience` prop is optional with a `"public"` default, so the consult page and any other existing caller keep working unchanged.
- **No data changes:** no migration, no API route, no new stored column — matching the Phase A constraint that nothing new is collected.
