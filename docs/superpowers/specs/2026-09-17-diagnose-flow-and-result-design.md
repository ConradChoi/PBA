# /diagnose Flow + Result Page Design

**Status:** Approved for planning
**Spec this implements:** `data/PBA_7Layer_business_radar_requirements.md` (sections 4-15, 21, 22, 26)
**Builds on:** existing scoring engine (`src/lib/scoring/*`), Supabase wiring (`src/lib/supabase/*`), `assessments` table (`supabase/migrations/0001_init.sql`)

## Goal

Implement the basic-info step, the 28-question flow (7 layers × 4 questions), and the 1-page result screen (Radar chart + interpretation) that the landing page's "무료 Business Radar 시작하기" CTA currently 404s on. Out of scope: Phase 2 (PDF generation, Resend email), the consulting form itself (only its CTA), remaining GA4 events beyond what's wired here.

## Decisions Made During Brainstorming

1. **Placeholder copy**: where the requirements spec doesn't give exact wording (layer one-line descriptions, 4 of 7 strength messages), use a visibly marked placeholder (`[카피 필요: ...]`) rather than leaving it blank, so it's obvious in the UI during QA. Everywhere the spec gives exact wording (Architecture Level descriptions, all 7 Bottleneck messages, all 7×3 Action Library items), transcribe verbatim.
2. **Progress persistence**: server-side, in a new `assessment_drafts` table — not localStorage. This satisfies spec section 26 Case 5 (resume after reload) without relying on browser storage, and keeps the "no direct anon access to Supabase" security posture consistent with the rest of the project.
3. **Routing**: `draftId` identifies in-progress work; `assessmentId` (the real `assessments.id`) identifies a finished result. Since drafts are deleted on completion, the result page cannot key off `draftId`.
4. **Chart library**: Chart.js via `react-chartjs-2`, per the requirements spec's explicit recommendation.
5. **~~Privacy consent is not a hard gate~~ — REVISED 2026-09-17: no anonymous diagnosis.** The initial design let a visitor complete the diagnosis anonymously if they declined `privacy_consent`, matching requirements spec section 22's "익명 진단 옵션" note. The user overrode this after reviewing the Figma mockup: `name` and `email` are **always required**, for every visitor, regardless of consent. `businessStage` was already always required; `companyName`/`role`/`industry`/`teamSize` remain optional either way. Because collecting name/email is now unconditional, requiring consent to collect and use that same data is the legally coherent pairing — **`privacyConsent` becomes a required checkbox** (must be `true` to submit), while `marketingConsent` stays optional. There is no more `false`-consent branch to design for: it can't happen once the API rejects it.
6. **Consent record-keeping**: per `privacy-security-officer` review, storing a bare `privacy_consent` boolean isn't enough to defend a stated retention period (the consent notice below commits to "1 year from collection, deleted on request"). `assessments` gains `privacy_consent_at` (retention-period start) and `privacy_notice_version` (which wording the visitor agreed to, so a future copy change doesn't retroactively reinterpret past consent). The legacy `anon can insert` RLS policies on `assessments` (from `0001_init.sql`) are dropped in the same migration — every write now goes through server routes with `service_role`, so they're dead surface that only invites spam inserts.

**Out of scope, flagged for follow-up (not blocking this plan):** a full privacy-policy page (the consent notice below is the summary + detail required at the point of collection, not the standalone policy page PIPA also requires), and the overseas-transfer disclosure question for Supabase/Resend (revisit when Phase 2 wires up email).

## A. Data Model

### `assessments` table changes (migration `0002_add_consent_tracking.sql`)

The live table is currently empty, so this is safe to apply directly:

```sql
alter table assessments add column privacy_consent boolean not null default false;
alter table assessments add column privacy_consent_at timestamptz;
alter table assessments add column privacy_notice_version text not null default '2026-09-17';

drop policy if exists "anon can insert assessments" on assessments;
drop policy if exists "service role full access assessments" on assessments;
create policy "service role full access assessments"
  on assessments for all
  to service_role
  using (true) with check (true);
```

`name`/`email` stay `not null` as originally defined in `0001_init.sql` — no anonymous path, so the original constraint is still correct and needs no change. `privacy_consent` is `not null default false` at the column level, but the API layer (schema below) rejects any submission where it isn't `true`, so in practice every row has `privacy_consent = true`. `privacy_consent_at` is set server-side (`now()`) on every insert; it's the retention-period start referenced in the consent notice's "1년 보관" commitment. `privacy_notice_version` records which wording (section F below) the visitor saw — bump it if the notice text changes.

With the `anon can insert` policy gone, `anon` has zero direct access to `assessments` (matching `assessment_drafts` below) — all writes go through `POST /api/assessment-drafts/[draftId]/complete` (or the existing `POST /api/assessments`) using `service_role`.

### New `assessment_drafts` table (migration `0003_assessment_drafts.sql`)

```sql
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
-- No policies granted to anon/authenticated: RLS with zero policies denies
-- all access to those roles. Only service_role (which bypasses RLS in
-- Supabase) can read/write this table. All client access goes through the
-- API routes below.
```

`basic_info` shape: `{ name: string, email: string, companyName?: string, role?: string, businessStage: BusinessStage, industry?: string, teamSize?: string }`.
`answers` shape: `Partial<Record<LayerId, [number,number,number,number]>>` — only completed layers are present.

Drafts are deleted once `POST /api/assessment-drafts/[draftId]/complete` succeeds. Abandoned-draft cleanup (TTL/cron) is out of scope for this plan.

## B. API Routes

| Route | Behavior |
|---|---|
| `POST /api/assessment-drafts` | Validate basic info + consent (schema below) → insert draft (`current_step: 0`) → `{ draftId }` |
| `GET /api/assessment-drafts/[draftId]` | Fetch draft for resume: `{ basicInfo, answers, currentStep }`. 404 if missing. |
| `PATCH /api/assessment-drafts/[draftId]` | Body `{ layerId, answers: [1-5, 1-5, 1-5, 1-5] }` → merge into `answers` jsonb, recompute `current_step` as the count of layers present → `{ currentStep }`. 404 if draft missing. |
| `POST /api/assessment-drafts/[draftId]/complete` | Require all 7 layers present in `answers` (400 if not) → run `computeAssessmentResult` → insert into `assessments` → delete draft → `{ assessmentId, architectureLevel, totalRaw, bottlenecks, strengths }` |
| `GET /api/assessments/[assessmentId]` | Fetch a finished assessment's full row (used by the result page). 404 if missing. |

`computeAssessmentResult` (existing, `src/lib/scoring/submit-assessment.ts`) and the row-insert step are shared between this new `complete` route and the existing `POST /api/assessments` route via one extracted helper, so both stay in sync and the existing route's tests keep passing unmodified.

### Schema changes

`submitAssessmentSchema` (existing, `src/lib/scoring/submit-assessment.schema.ts`):

```ts
basicInfo: z.object({
  name: z.string().min(1),
  email: z.string().email(),
  companyName: z.string().optional(),
  role: z.string().optional(),
  businessStage: businessStageSchema,
  industry: z.string().optional(),
  teamSize: z.string().optional(),
}),
answers: z.object({ /* unchanged */ }),
privacyConsent: z.literal(true),
marketingConsent: z.boolean(),
utm: z.object({ /* unchanged */ }).optional(),
```
`name`, `email`, and `privacyConsent` are all unconditionally required now — no `.refine()` needed. A submission with `privacyConsent: false` (or omitted) fails schema validation outright, the same as a missing `businessStage`.

A new, smaller `draftBasicInfoSchema` (same `basicInfo` + `privacyConsent` + `marketingConsent` + `utm` shape, no `answers`) validates `POST /api/assessment-drafts`.

`AssessmentInsertRow` and `SubmitAssessmentInput` (`submit-assessment.ts`) gain `privacy_consent: true` (a literal-true boolean — nothing else reaches this point) / `privacyConsent: true`; `name`/`email` stay `string` (not nullable — no change from before this revision). `computeAssessmentResult` also sets `privacy_consent_at: new Date().toISOString()` and `privacy_notice_version: PRIVACY_NOTICE_VERSION` (a constant next to the copy in section F, so a text change and the version bump land in the same commit) — both unconditional now, since every row that reaches insertion has consent.

## C. Client Pages/Components

```
src/app/diagnose/page.tsx                        Basic info form (Client Component) → POST draft → router.push
src/app/diagnose/[draftId]/page.tsx              Server Component: loads draft, renders QuestionWizard or not-found
src/app/diagnose/[draftId]/not-found.tsx
src/components/diagnose/QuestionWizard.tsx       Client: one layer per screen, 1-5 buttons, "N/7", PATCH per layer, POST complete on last
src/app/diagnose/result/[assessmentId]/page.tsx  Server Component: loads assessment, renders result
src/app/diagnose/result/[assessmentId]/not-found.tsx
src/components/diagnose/RadarChart.tsx           react-chartjs-2 wrapper, 7 axes, 0-100 scale
src/lib/assessments/get-assessment.ts            Shared service_role fetch-by-id, used by the GET route and the result page
```

`QuestionWizard` only moves forward — there is no "이전" button to revisit and edit a completed layer's answers in this plan.

Result page section order follows requirements spec section 15: header → score → radar → summary → bottleneck top 3 → strength top 2 → 90-day priority → CTA. Both CTA buttons ("PDF 받기"/"상담하기") are always enabled — every stored assessment has a contact channel now, so there's no disabled-state branch to build.

### GA4 events wired in this plan

Per requirements spec section 21, these events now have a real screen to fire from: `radar_start` (basic info submitted / draft created), `radar_layer_complete` (each layer's PATCH succeeds), `radar_complete` (the `complete` call succeeds), `radar_result_view` (result page mounts). `radar_pdf_request`, `radar_consulting_click`, `radar_consulting_submit` still wait for Phase 2 / the consulting form and are out of scope here.

## D. Content Config

New files under `src/lib/content/`:

- `architecture-level-copy.ts` — verbatim from requirements spec section 9, keyed by `ArchitectureLevel`.
- `bottleneck-copy.ts` — verbatim from requirements spec section 10, keyed by `LayerId`, all 7 present.
- `action-library.ts` — verbatim from requirements spec section 12, keyed by `LayerId`, 3 actions each, all 7 present.
- `strength-copy.ts` — VALUE/CUSTOMER/PROCESS verbatim from section 11; OFFER/EXPERIENCE/DATA/SCALE are `"[카피 필요: <LAYER> 강점 메시지]"` placeholders.
- `layer-descriptions.ts` — all 7 are `"[카피 필요: <LAYER> 설명 1줄]"` placeholders (nothing in the spec to transcribe).
- `summary.ts` — `buildSummaryParagraph(level, lowestLayerId)` concatenates `architecture-level-copy[level]` + `bottleneck-copy[lowestLayerId]`. Since both source pieces are verbatim spec text, this produces real copy with no placeholder.
- `privacy-notice.ts` — `PRIVACY_NOTICE_VERSION` constant + the consent notice copy from section F below, real text (not a placeholder — drafted by `privacy-security-officer` and finalized against this project's actual data model).

## F. Privacy Consent Notice (basic info screen)

Below the "개인정보 수집·이용에 동의합니다" checkbox: a one-line summary, a "자세히 보기" toggle, and the full 4-part notice (PIPA Article 15(2) requires all four at the point of collection). This is the text as the user finalized it directly in the Figma mockup (`1. 기본정보` frame, `Consent/개인정보 수집·이용에 동의합니다` group) — implement verbatim from Figma, not from an earlier draft.

**Checkbox label:** `개인정보 수집·이용에 동의합니다` — unchecked by default, never pre-checked, and required (per Decision 5 above, submission fails without it — the UI should mark it as required, e.g. `*`, to match how the other required fields are styled).

**One-line summary:**
> 목적: 결과 PDF 발송·상담 안내 / 필수: 이름·이메일 / 선택: 회사명·역할·업종·팀규모 / 보유: 수집일로부터 1년

**1. 개인정보 수집 목적**
> 진단 결과 리포트(PDF)를 이메일로 보내드리고, 진단 결과에 기반한 상담(컨설팅) 안내 및 연락을 위해 개인정보를 수집·이용합니다.

**2. 수집항목**
> 필수항목: 이름, 이메일 주소
> 선택항목: 회사/브랜드명, 역할, 업종, 팀 규모

**3. 보유기간**
> 수집일로부터 1년간 보관한 후 파기합니다.

**4. 동의 거부 시 안내**
> 귀하는 개인정보 수집·이용에 동의하지 않을 권리가 있으며, 동의하지 않으셔도 28문항 진단과 결과(레이더 차트·점수·병목 분석) 확인에는 제한이 없습니다. 다만 연락 수단이 수집되지 않아 결과 PDF 이메일 발송과 상담 연결 서비스는 이용하실 수 없습니다.

**⚠️ Known inconsistency, not resolved here (user asked to implement Figma as-is, no further edits):** sections 2 and 4 above still describe a decline path — "동의하지 않으시면 이름·이메일은 수집하지 않으며…" was dropped from section 2 in the Figma edit, but section 4 still says declining leaves diagnosis/results available while blocking PDF/상담 (the old anonymous-mode framing). Under Decision 5, declining consent isn't actually a reachable state anymore — the form can't submit without it — so section 4's premise ("동의하지 않으셔도 …할 수 있다") no longer matches how the product behaves. Section 3's retention text also dropped the withdrawal/legal-retention clause that was in the original PIPA draft. **This is copy the user should revisit before real deployment**, since section 4 as written is misleading (it describes a choice that doesn't exist); implement it verbatim regardless, since it's the approved mockup text, not a decision for engineering to make unilaterally.

`PRIVACY_NOTICE_VERSION = '2026-09-17'`. Bump this string whenever any of the four sections' wording changes — `privacy_notice_version` on the row records which version a given visitor agreed to.

**Not this plan's job:** the standalone privacy-policy page PIPA also requires (this notice is the collection-point summary, not the full policy), and the overseas-transfer disclosure for Supabase/Resend (revisit with Phase 2 email). Both are legal-review items, not implementation gaps — flagged by `privacy-security-officer`, not resolved here.

## E. Testing

Unit-tested (Vitest, following the existing project pattern): draft answer-merge logic, `current_step` calculation, the new/changed Zod schemas (`privacyConsent: false`/missing rejected, same as a missing `name`/`email`/`businessStage`), `buildSummaryParagraph`, content-config sanity checks (7 entries each), `computeAssessmentResult` setting `privacy_consent_at`/`privacy_notice_version` on every result, and all 4 new/changed API routes (mocked Supabase client, success + error paths) exactly like `src/app/api/assessments/route.test.ts`.

Not automated: the React components (`QuestionWizard`, forms, result page) — the project has no RTL/jsdom setup, consistent with prior work. Verified instead by running `npm run dev` and manually walking the full path once: basic info → answer all 7 layers → reload mid-way to confirm resume → complete → view result — the same way the Supabase write path was manually verified earlier in this project.

## Explicitly Out of Scope

- Phase 2: PDF generation, Resend email delivery
- The consulting form itself (its CTA button exists and is always enabled, but submitting a consulting request is a separate future plan)
- `radar_pdf_request`, `radar_consulting_click`, `radar_consulting_submit` GA4 events (wait for Phase 2 / the consulting form)
- Abandoned-draft cleanup (TTL/cron job)
- Standalone privacy-policy page (PIPA Article 30) and the overseas-transfer disclosure question for Supabase/Resend — both flagged by `privacy-security-officer` as legal-review items, neither blocks this plan
