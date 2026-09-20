# Result Enrichment (Maturity, Risk Signals, Hypothesis Teaser) + Outcome Data + Retention Control Design

**Status:** Approved for planning (revised after privacy review)
**Builds on:** the result page, `ResultReport`, anonymous diagnosis, and print-to-PDF as of commit `0293f0c`
**Precedes:** multi-language support (`docs/superpowers/specs/2026-09-19-i18n-design.md`). Migration numbering: notices take `0010`, this design `0011`, i18n `0012`

## Goal

First, minimal step of the PBA methodology roadmap (Assess → Maturity → Detect → Explain → Verify → Prioritize → Improve → Re-Assess → Learn → Validate). Make the free result page a more professional report without giving away what consulting sells, start capturing non-identifying outcome data for later analysis, and let operators keep a contracted customer's data past the default retention.

## Decisions Made During Brainstorming

1. **Direction approved, scope cut** (ceo-advisor review): the free result gets ② Maturity, ③ rule-based Risk Signals, and a one-hypothesis teaser of ④. ⑤–⑦ in full stay in paid consulting. ⑨–⑩ wait for data.
2. **Free shows "what", consulting sells "why/how".** Only one cause hypothesis is public; the second is internal, admin-only.
3. **No "validated method" claims** in public copy until ⑩ has data.
4. **Korean content first; translation later.**
5. **Maturity levels follow the response scale** (layer average rounded).
6. **Result fit and outcome bands are collected on the result page**, not at the start.
7. **⑧ Re-Assessment is not in the free product.** Re-diagnosis happens under a consulting contract. No re-assess button, no assessment-to-assessment linkage, no comparison view, no reminder email. (This also removes the privacy review's critical finding about linkage chains.)
8. **Operators control retention per assessment** (for contracted customers): keep personal data until a set date (days/months/years from today, with a required reason, editable any time), revert to the default policy, or delete personal data now. Any operator (owner or staff) can do this; every change records who and when.
9. **"Delete now" removes personal data only** — same effect as the 1-year purge; the non-identifying diagnosis stays for statistics.
10. **Headcount is asked once:** the basic-info "팀 규모" free-text field becomes headcount-band chips; the result-page outcome card asks only revenue and growth.
11. **Two-phase launch** because the privacy policy promises 7 days' notice of changes (section 12):
    - **Phase A (ship now):** maturity, risk signals, hypothesis teaser, CTA change, GA4 URL masking — no new data collected, no policy change.
    - **Phase B (ships live):** result fit, outcome bands, team-size chips, retention control, consent notice and privacy policy update, purge changes. The site had only just launched, so the CEO decided (2026-09-20) that this is the privacy policy's first real publication, effective the day it ships — section 12's 7-day notice applies from the next revision onward, announced on the notice board.
12. **Content is drafted by Claude in a review document** (`docs/content/2026-09-19-result-content-draft.md`); implementation proceeds with the drafts.
13. **4-week checkpoint:** if consult conversion and result-fit averages clear the bar, expand to per-question anchors (140). Not part of this design.

---

# Phase A

## A1. Maturity

`maturityLevel(raw: number): 1 | 2 | 3 | 4 | 5` in `src/lib/scoring/maturity.ts`, from the layer raw score (4–20):

| Raw | Level | Name | Matches response scale |
|---|---|---|---|
| 4–5 | L1 | 미정의 | 전혀 정리되지 않음 |
| 6–9 | L2 | 인식 | 생각은 있으나 구체적이지 않음 |
| 10–13 | L3 | 정리 | 어느 정도 정리되어 있음 |
| 14–17 | L4 | 운영 | 실제 운영에 적용되고 있음 |
| 18–20 | L5 | 체계화 | 명확하게 정의되고 데이터로 관리됨 |

Computed at render time from stored `score_*_raw`. **UI:** a "레이어별 성숙도" section right below the radar chart — one row per layer: layer name, `L{n} {name}`, a 5-step bar, and that layer's anchor for its level (`src/lib/content/maturity-anchors.ts`, 7 × 5 = 35 lines; level names in `maturity-levels.ts`).

## A2. Risk Signals

`src/lib/content/risk-signals.ts` holds rules as data:

```ts
type RiskSignalRule = {
  id: string;
  priority: number;            // lower = shown first
  when: { layer: LayerId; op: "<=" | ">="; level: 1 | 2 | 3 | 4 | 5 }[]; // all must hold
  title: string;
  message: string;
};
```

`evaluateRiskSignals(levels: Record<LayerId, Level>): RiskSignalRule[]` in `src/lib/scoring/risk-signals.ts` returns matching rules sorted by priority, **max 2**. Five rules to start. The "위험 신호" section renders below Bottleneck Top 3 and is omitted when nothing matches.

## A3. Cause Hypothesis Teaser

`src/lib/content/cause-hypotheses.ts`: `Record<LayerId, { public: string; internal: string }>`.

- Result page: for bottleneck #1 only, a "가능성 높은 원인 가설" card with the `public` hypothesis and "위 가설이 실제 원인인지, 상담에서 프로세스와 데이터를 함께 확인해 드립니다."
- Admin result popup: `public` and `internal` for all three bottleneck layers.
- `ResultReport` gets an `audience: "public" | "admin"` prop.

**CTA:** "내 사업 구조 상담하기" → "원인 가설 검증 상담받기" (same destination and GA4 event).

Print includes maturity, risk signals, and the hypothesis card.

## A4. GA4 URL Masking

The result URL's assessment UUID is the only credential to view a result, and GA4 currently sends it to Google (US) in `page_location`/`page_path`. Configure gtag with a masked location for result and consult pages: `/diagnose/result/[id]` → `/diagnose/result/:id`, `/diagnose/result/[id]/consult` → `/diagnose/result/:id/consult`, draft pages `/diagnose/[draftId]` → `/diagnose/:draftId`. New GA4 events never carry band values or IDs.

---

# Phase B (ships live; the policy is effective on publication)

## B1. Result Fit and Outcome Bands

Rendered on the result page above the consult CTA; hidden in print and in the admin popup.

**Result fit:** "이 진단 결과가 실제 상황과 맞나요?" as a 1–5 `ChipGroup`. Selecting saves immediately (`PATCH /api/assessments/[id]/feedback`, `{ resultFit }`), shows a thank-you line, and can be changed.

**Outcome bands (optional):** a collapsed card with a short notice — purpose (진단 정확도 향상·통계), that it's optional with no disadvantage if skipped, and that for consented diagnoses it's kept with name/email and the identifying part is deleted after 1 year — two `ChipGroup`s, and a submit button labeled "안내를 확인했으며 제출합니다". `PATCH /api/assessments/[id]/outcome`, at least one field. **Write-once:** rejected (409) if `outcome_at` is already set.

| Field | Codes (label) |
|---|---|
| `revenue_band` | `pre_revenue` 매출 전, `lt_100m` 1억 미만, `100m_1b` 1~10억, `1b_5b` 10~50억, `5b_10b` 50~100억, `gte_10b` 100억 이상 |
| `growth_band` | `decline` 감소, `flat` 정체(±10%), `10_50` 10~50% 성장, `50_100` 50~100% 성장, `gte_100` 2배 이상, `lt_1y` 1년 미만 사업 |

Both routes: Zod-validated (400), unknown assessment (404), service_role write.

## B2. Team Size → Headcount Band

The basic-info "팀 규모 (선택)" free-text input becomes a `ChipGroup` storing a code in the existing `team_size` column: `solo` 1명, `2_5` 2~5명, `6_20` 6~20명, `21_50` 21~50명, `51_200` 51~200명, `gt_200` 200명 이상. Existing free-text values stay as they are; admin shows a code's label, or the raw text for legacy rows.

## B3. Retention Control (admin)

**Data:** `assessments.retain_until timestamptz`, `retention_reason text`, `retention_updated_by text` (operator email), `retention_updated_at timestamptz`.

**Admin assessment detail — "정보 보관" card:**
- Default: "기본 정책 · {수집일 + 1년} 개인정보 파기 예정" (or "개인정보 없음" for anonymous/already purged rows, where only "보관 기간 설정" is hidden).
- Extended: "연장 보관 · {retain_until}까지 유지", reason, who/when.
- Actions (any operator):
  - **보관 기간 설정 / 수정:** centered modal — a number input, unit chips (일·개월·년), required reason; `retain_until = today + n units`. Editable any time.
  - **기본 정책으로 되돌리기:** clears the four columns.
  - **개인정보 지금 삭제:** centered confirm dialog → nulls name, email, company, role, marketing consent, industry, utm fields and deletes the assessment's consulting requests (same as the purge), and clears retention columns.
- API: `PUT /api/admin/assessments/[id]/retention` (`{ amount, unit, reason }` or `{ reset: true }`) and `POST /api/admin/assessments/[id]/purge`, both requiring `getCurrentOperator()`.

**Purge (migration update):** skip assessments with `retain_until > now()`, and skip consulting requests whose assessment is retained. When `retain_until` passes, the next run purges normally (if the 1-year point has also passed).

## B4. Purge Changes (privacy review)

The daily purge also nulls `industry` (free text, re-identifying in small industries) and `utm_source`/`utm_medium`/`utm_campaign`. Revenue/growth bands and team-size codes stay (coarse bands). The manual "delete now" uses the same function logic.

## B5. Consent Notice and Privacy Policy

**Consent notice** (`privacy-notice.ts`): add "선택항목(결과 화면에서 입력 시): 매출·성장 구간" and the purpose "진단 정확도 향상"; bump `PRIVACY_NOTICE_VERSION` to `2026-09-20`.

**Privacy policy** (single current version, effective 2026-09-20):
- §1 purposes: add "진단 방법론 연구·개선(개인을 식별할 수 없는 형태로 가공한 정보에 한함)".
- §2 "진단 정보" row: "사업 단계, 업종, 팀 규모, 문항 응답과 진단 결과, 결과 적합도 평가, 연 매출·최근 12개월 성장 구간(선택 입력)", note: "익명 진단 시에는 이 정보만으로 개인을 식별할 수 없습니다. 개인정보 수집에 동의하거나 상담을 신청한 경우에는 이름·이메일과 함께 개인정보로 처리됩니다."
- §3 retention: add "상담·컨설팅 계약을 맺은 경우, 계약 이행과 재진단을 위해 계약에서 정한 기간 동안 보관할 수 있습니다." and "개인정보를 파기할 때 업종 등 자유 입력 정보와 유입 경로 정보도 함께 삭제하여, 남는 진단 정보로는 개인을 알아볼 수 없도록 합니다."
- §12: unchanged — it already promises 7 days' notice, which governs the next revision.

**Future revisions:** bump the effective date, keep the superseded version reachable, and publish a notice-board announcement at least 7 days ahead.

**Research queries** use a view excluding name, email, company, and role (`assessments_research`), created in this migration.

## B6. Data (migration `0011_result_enrichment.sql`)

- `assessments`: `result_fit smallint check 1–5`, `result_fit_at`, `revenue_band` and `growth_band` (checked code lists), `outcome_at`, `retain_until`, `retention_reason`, `retention_updated_by`, `retention_updated_at`.
- `assessments_research` view.
- `purge_expired_personal_data()` replaced per B3/B4.

The i18n locale migration becomes `0012_add_locale.sql` (`0010` is taken by notices).

## B7. Launch Gating

None. With the policy effective on publication there is nothing to gate; each piece goes live as it deploys, and the policy update ships first. The migration can be applied at any time (new columns are unused until then).

## B8. Admin

Assessment detail adds result fit, the revenue/growth band labels, the team-size label, and the "정보 보관" card.

## B9. GA4

New events: `radar_result_feedback` (fit chosen), `radar_outcome_submit` (bands submitted). No values attached.

---

## Testing

- **Unit:** `maturityLevel` boundaries (4, 5/6, 9/10, 13/14, 17/18, 20, out-of-range throws); `evaluateRiskSignals` (none, one, three+ → first two by priority); retention date math (days/months/years, month-end).
- **Content completeness:** every layer has 5 anchors and both hypotheses; every rule references valid layers/levels.
- **API:** feedback/outcome — valid, invalid (400), unknown (404), outcome second write (409), gated before Phase B start; retention/purge routes — unauthenticated (401/403), valid set/reset/delete, required reason.
- **Purge (against Supabase):** retained rows and their consulting requests survive; expired retention purges; industry/utm are nulled.
- **Manual:** Phase A on the dev server (maturity, risks, hypothesis, CTA, print, GA4 masked path); Phase B with the gate overridden (fit, outcome once, team-size chips, admin retention set/edit/reset/delete-now, policy/notice versions).

## Explicitly Out of Scope

- Re-assessment in the free product (button, linkage, comparison, reminders).
- Per-question anchors (140), decided at the 4-week checkpoint.
- Standardized industry codes.
- Consulting-side tooling for ⑤–⑦; ⑨ pattern mining; ⑩ statistical validation.
- Rate limiting beyond write-once outcome (revisit if abuse appears).
- Translating any of the new copy.
