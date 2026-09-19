# Result Enrichment (Maturity, Risk Signals, Hypothesis Teaser) + Outcome Data Design

**Status:** Approved for planning
**Builds on:** the result page, `ResultReport`, anonymous diagnosis, and print-to-PDF as of commit `0293f0c`
**Precedes:** multi-language support (`docs/superpowers/specs/2026-09-19-i18n-design.md`); its migration moves from `0010` to `0011`

## Goal

First, minimal step of the PBA methodology roadmap (Assess → Maturity → Detect → Explain → Verify → Prioritize → Improve → Re-Assess → Learn → Validate). Make the free result page a more professional report without giving away what consulting sells, and start capturing the data that later steps (Re-Assess, Learn, Validate) will need.

## Decisions Made During Brainstorming

1. **Direction approved, scope cut** (per the ceo-advisor review): the free result gets ② Maturity, ③ rule-based Risk Signals, and a one-hypothesis teaser of ④. ⑤–⑦ in full stay in paid consulting. ⑧ is designed now (linkage + comparison). ⑨–⑩ wait for data.
2. **Free shows "what", consulting sells "why/how".** Only one cause hypothesis is public; the second is internal, visible in the admin only.
3. **No "validated method" claims** in public copy until ⑩ has data.
4. **Korean content first; translation later.** Copy is expected to change; i18n translates only after it stabilizes.
5. **Maturity levels follow the response scale** (layer average rounded): the level a person reaches means the same thing as the answer they gave.
6. **Outcome bands and result fit are collected on the result page**, not at the start, to keep the start light.
7. **Re-assessment links by assessment ID, never by email**, so linkage survives the 1-year personal-data purge (migration 0009).
8. **Content is drafted by Claude in a review document**; implementation proceeds with the drafts, and approved wording later only replaces data files.
9. **4-week checkpoint:** if consult conversion and result-fit averages clear the bar, expand to per-question anchors (140). Not part of this design.

## A. Maturity

`maturityLevel(raw: number): 1 | 2 | 3 | 4 | 5` in `src/lib/scoring/maturity.ts`, from the layer raw score (4–20):

| Raw | Level | Name | Matches response scale |
|---|---|---|---|
| 4–5 | L1 | 미정의 | 전혀 정리되지 않음 |
| 6–9 | L2 | 인식 | 생각은 있으나 구체적이지 않음 |
| 10–13 | L3 | 정리 | 어느 정도 정리되어 있음 |
| 14–17 | L4 | 운영 | 실제 운영에 적용되고 있음 |
| 18–20 | L5 | 체계화 | 명확하게 정의되고 데이터로 관리됨 |

Computed at render time from stored `score_*_raw`; nothing new is stored.

**UI:** a "레이어별 성숙도" section right below the radar chart: one row per layer — layer name, `L{n} {name}`, a 5-step bar, and that layer's anchor for its level (`maturity-anchors.ts`, 7 × 5 = 35 lines).

## B. Risk Signals

`src/lib/content/risk-signals.ts` holds rules as data:

```ts
type RiskSignalRule = {
  id: string;
  priority: number;            // lower = shown first
  when: { layer: LayerId; op: "<=" | ">="; level: 1 | 2 | 3 | 4 | 5 }[]; // all must hold
  title: string;               // e.g. "구조 없는 확장"
  message: string;
};
```

`evaluateRiskSignals(levels: Record<LayerId, Level>): RiskSignalRule[]` in `src/lib/scoring/risk-signals.ts` returns matching rules sorted by priority, **max 2**. Five rules to start (drafted in the content document). The section ("위험 신호") renders below Bottleneck Top 3 and is omitted when nothing matches.

## C. Cause Hypothesis Teaser

`src/lib/content/cause-hypotheses.ts`: `Record<LayerId, { public: string; internal: string }>`.

- Result page: for the lowest layer (bottleneck #1) only, a "가능성 높은 원인 가설" card with the `public` hypothesis and the line "위 가설이 실제 원인인지, 상담에서 프로세스와 데이터를 함께 확인해 드립니다."
- Admin result popup: shows both `public` and `internal` for all three bottleneck layers.
- `ResultReport` gets an `audience: "public" | "admin"` prop to control this.

**CTA:** "내 사업 구조 상담하기" → "원인 가설 검증 상담받기" (same destination and GA4 event).

## D. Result Fit and Outcome Bands

Rendered on the result page above the consult CTA; hidden in print and in the admin popup.

**Result fit:** "이 진단 결과가 실제 상황과 맞나요?" as 1–5 `ChipGroup`. Selecting saves immediately (`PATCH /api/assessments/[id]/feedback` with `{ resultFit }`), shows "의견 감사합니다", and can be changed.

**Outcome bands (optional):** a collapsed card "더 정확한 분석을 위해 알려주세요" with three `ChipGroup`s and a submit button (`PATCH /api/assessments/[id]/outcome`; all three optional, at least one required):

| Field | Codes (label) |
|---|---|
| `revenue_band` | `pre_revenue` 매출 전, `lt_100m` 1억 미만, `100m_1b` 1~10억, `1b_5b` 10~50억, `5b_10b` 50~100억, `gte_10b` 100억 이상 |
| `headcount_band` | `solo` 1명, `2_5`, `6_20`, `21_50`, `51_200`, `gt_200` 200명 이상 |
| `growth_band` | `decline` 감소, `flat` 정체(±10%), `10_50` 10~50% 성장, `50_100` 50~100% 성장, `gte_100` 2배 이상, `lt_1y` 1년 미만 사업 |

Both routes: Zod-validated (400), unknown assessment (404), service_role write, knowing the result URL is the only credential (same as viewing the result). Submitting sets `result_fit_at` / `outcome_at`.

## E. Re-Assessment

- Result page: a "90일 후 다시 진단하기" card showing the recommended date (`created_at + 90 days`), a tip to bookmark the result page, and a button to `/diagnose?prev=<assessmentId>`.
- `/diagnose` passes `prev` through to `POST /api/assessment-drafts` as `previousAssessmentId`; the server ignores it unless it's an existing assessment ID. It's stored on the draft and copied to the assessment on completion.
- A result whose `previous_assessment_id` resolves shows a "이전 진단과 비교" section: radar with the previous run as a grey series, total score change, and per-layer level change (e.g. `CUSTOMER L2 → L3 ▲`). `compareAssessments(prev, curr)` in `src/lib/scoring/compare.ts`.
- 90-day reminder email: Phase 2, consented users only. Not built here.

## F. Data (migration `0010_result_enrichment.sql`)

`assessments`:
- `result_fit smallint check (result_fit between 1 and 5)`, `result_fit_at timestamptz`
- `revenue_band text`, `headcount_band text`, `growth_band text` (each with a `check` on its code list), `outcome_at timestamptz`
- `previous_assessment_id uuid references assessments(id) on delete set null`

`assessment_drafts`: `previous_assessment_id uuid references assessments(id) on delete set null`.

The i18n design's locale migration becomes `0011_add_locale.sql`.

## G. Privacy

- Result fit and outcome bands are **non-identifying diagnosis information**: collected regardless of consent, and untouched by the 1-year purge (kept for statistics). Re-assessment linkage uses assessment IDs only.
- `/privacy` updates: add these fields to the "진단 정보" row; add "진단 방법론 연구·개선" to the purposes. The consent notice (personal items) is unchanged, so `PRIVACY_NOTICE_VERSION` stays.
- The privacy-security-officer agent reviews this section before implementation.

## H. Admin

Assessment detail adds: result fit, the three bands (labels), and a link to the previous assessment when present. The result popup uses `audience="admin"` (both hypotheses).

## I. GA4

New events in `src/lib/analytics/events.ts`: `radar_result_feedback` (fit chosen), `radar_outcome_submit` (bands submitted), `radar_reassess_start` (the re-assess button).

## J. Content Drafting

Claude drafts all new copy in `docs/content/2026-09-19-result-content-draft.md`: level names, 35 anchors, 5 risk rules, 14 hypotheses (7 public + 7 internal), and the new UI strings — grounded in each layer's four questions and existing bottleneck/strength copy. The CEO edits the document; approved wording replaces the data files. Implementation does not wait for approval.

## K. Testing

- **Unit:** `maturityLevel` boundaries (4, 5/6, 9/10, 13/14, 17/18, 20, and out-of-range throws); `evaluateRiskSignals` for no match, one match, three or more matches → first two by priority; `compareAssessments`.
- **Content completeness:** every layer has 5 anchors and both hypotheses; every risk rule references valid layers and levels.
- **API:** feedback and outcome routes — valid (200), invalid values (400), unknown assessment (404); drafts route accepts a valid `previousAssessmentId`, drops an unknown one; completion copies it.
- **Manual (dev server):** diagnose → maturity, risk signals, and hypothesis render → submit fit and bands → re-assess from the card → comparison renders → admin detail/popup show the new fields and internal hypotheses → print includes maturity, risk signals, and the hypothesis card but not the fit/outcome/re-assess UI.

## Explicitly Out of Scope

- Per-question anchors (140), decided at the 4-week checkpoint.
- Standardized industry codes.
- 90-day reminder email.
- Consulting-side tooling for ⑤ Verify, ⑥ Prioritize scoring, ⑦ DMAIC; ⑨ pattern mining; ⑩ statistical validation.
- Translating any of the new copy.
