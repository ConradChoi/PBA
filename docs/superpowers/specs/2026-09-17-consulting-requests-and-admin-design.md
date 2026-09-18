# Consulting Requests + Admin Panel Design

**Status:** Approved for planning
**Spec this implements:** `data/PBA_7Layer_business_radar_requirements.md` section 20 (상담 전환), section 5.4/15 (CTA buttons)
**Builds on:** `/diagnose` flow and result page (`docs/superpowers/specs/2026-09-17-diagnose-flow-and-result-design.md`), existing Supabase wiring, GA4 setup

## Goal

Make the result page's "내 사업 구조 상담하기" CTA actually do something: capture a consulting request tied to the finished assessment, and give the operator (최종훈) a way to see incoming requests and all diagnoses — plus a way to add more operators later without touching Supabase directly. "결과 PDF 받기" (the other CTA) is explicitly out of scope for this plan; it's a separate, heavier piece of work (server-side PDF rendering) to be designed on its own.

## Decisions Made During Brainstorming

1. **Consult form is a separate page**, not an inline expand on the result page — `/diagnose/result/[assessmentId]/consult`. It never re-asks for name/email; those are already on the linked assessment.
2. **Admin auth is real Supabase Auth** (email/password), not a shared password. This is heavier than a single-operator tool strictly needs, but the user explicitly wants multi-operator support later, so the extra structure pays for itself.
3. **Admin screens**, not just an email notification: `/admin/consulting-requests` and `/admin/assessments`, both behind login.
4. **Operators are managed from the admin UI**, not the Supabase Dashboard, once the first account exists. New operators get a temporary password the owner sets directly (no invite-email flow).
5. **Two roles: `owner` and `staff`.** Only `owner` can see or use `/admin/operators`; `staff` can use the two list screens but the operator-management nav item doesn't even render for them, and the routes reject them server-side if they try direct navigation.
6. **No new `operators` table.** Roles live in Supabase Auth's `app_metadata.role` on the `auth.users` row itself — `app_metadata` is only writable via the admin API, never by the user, so `staff` cannot self-promote. This avoids a second table that would need to stay in sync with `auth.users`.
7. **Bootstrapping problem**: the very first operator can't be created from `/admin/operators` (nothing can log in yet to use it). Claude creates this one account directly via the Supabase Admin API as a one-time step outside the app's own code, then all subsequent operators go through the UI.
8. **Shared admin shell** (confirmed against the Figma mockup): every `/admin/*` page (except `/admin/login`) renders inside a common layout — a left sidebar (brand + nav: 상담 신청 / 전체 진단 / 운영자 관리, the last hidden for `staff`) and, in the content area, a full-width header bar with a bottom border that visually separates it from the page title below. The header holds a notification bell (with an unread-count badge, sourced from `consulting_requests.read_at is null`) and the logout button, right-aligned. Clicking the bell navigates to `/admin/consulting-requests` — no dropdown, no live push; simplicity over polish. A request is marked read (`read_at = now()`) when its own detail page (`/admin/consulting-requests/[requestId]`) is opened, not in bulk from the list — matching the inbox convention of "opening one marks that one read."
9. **List pages always need a detail page**, not a link out to an unrelated public page — caught after the first Figma pass only linked "보기" to the public result page, which doesn't carry the consulting request's own fields or admin-only assessment fields (email, UTM, consent metadata). See section D.

## A. Data Model

### New `consulting_requests` table (migration `0006_consulting_requests.sql`)

```sql
create table consulting_requests (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  preferred_contact text not null,
  message text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table consulting_requests enable row level security;
-- No policies granted to anon/authenticated: same pattern as assessment_drafts.
-- Only service_role can read/write; all access goes through server routes.
```

`read_at` is `null` until an operator opens that request's detail page — it's the notification bell's unread source (Decision 8), not a request-processing status.

No changes needed to `assessments` beyond setting the existing `consulting_requested` column to `true` on submit.

### Operators

No table. `auth.users.app_metadata` holds `{ role: "owner" | "staff" }`. Read via `supabase.auth.admin.listUsers()` (service_role only) for the admin list, and via the session's `user.app_metadata.role` for gating.

## B. Consulting Request Flow

```
Result page CTA ("내 사업 구조 상담하기")
  → onClick fires radar_consulting_click, then navigates
  → /diagnose/result/[assessmentId]/consult
     - 선호 연락처 (required, free text)
     - 전달하고 싶은 말 (optional, textarea)
  → submit: POST /api/assessments/[assessmentId]/consulting-requests
     → validates { preferredContact: string, message?: string }
     → insert into consulting_requests (service_role)
     → update assessments.consulting_requested = true
     → fires radar_consulting_submit (client-side, on success response)
  → form is replaced in place by a "신청 완료" confirmation — no redirect
```

If `assessmentId` doesn't resolve to a real assessment, the consult page 404s (same `not-found.tsx` pattern as the result page).

## C. Admin Authentication

New dependency: `@supabase/ssr` (the current `@supabase/supabase-js` factories in `src/lib/supabase/*` don't manage auth session cookies across Server Components/middleware — `@supabase/ssr` is the standard way to do that in the App Router).

- `middleware.ts` (project root): refreshes the Supabase session and gates every `/admin/*` route except `/admin/login`. No session → redirect to `/admin/login`.
- `/admin/login`: email/password form, calls `supabase.auth.signInWithPassword()` client-side, redirects to `/admin` on success. No signup link — accounts are created by an owner or, for the first one, by Claude directly.
- A `getCurrentOperator()` server helper reads the session and returns `{ id, email, role } | null`, used by admin pages/layout for role-based rendering and by admin API routes to re-verify `owner` server-side (never trust a client-side role check alone).
- Logout: a button in the admin layout calling `supabase.auth.signOut()`.

Data reads on admin pages (consulting requests, assessments, operators) go through the existing `service_role` helper, the same as the rest of the app — the auth gate's job is deciding *whether* to render the page at all, not scoping the query.

## D. Admin Screens

```
/admin                                    redirects to /admin/consulting-requests
/admin/login                              email/password login, no signup
/admin/consulting-requests                list: requested_at, name, preferred_contact,
                                           message (truncated), architecture_level,
                                           read/unread indicator — row → detail below
/admin/consulting-requests/[requestId]    detail: full preferred_contact + full message
                                           (untruncated) + requested_at, plus a summary
                                           card of the linked assessment (name, email,
                                           business_stage, architecture_level, total_raw)
                                           and a link to the public
                                           /diagnose/result/[assessmentId] for the full
                                           radar/bottleneck/strength view. Marks this
                                           request's read_at = now() on first view if null.
/admin/assessments                        list: name, email, business_stage,
                                           architecture_level, total_raw, created_at,
                                           consulting_requested (yes/no) — row → detail
/admin/assessments/[assessmentId]         detail: the full internal record the public
                                           result page doesn't expose — email,
                                           company_name, role, industry, team_size,
                                           all 7 layer scores, utm_source/medium/campaign,
                                           privacy_consent/consent_at/notice_version,
                                           marketing_consent — plus a link to the public
                                           result page and, if consulting_requested,
                                           a link to /admin/consulting-requests/[requestId]
/admin/operators                          owner-only. List: email, role, created_at.
                                           Add form: email + temporary password + role
                                           select. Delete button per row.
```

Reasoning for the two new detail pages (added after reviewing the original "just link to the public result page" shortcut): the public `/diagnose/result/[assessmentId]` page is deliberately consumer-facing and doesn't show `email`, UTM fields, or consent metadata — an operator following up on a lead needs at least the email, which the list row already carries but a detail page makes citable/copyable without hunting through a table. And a consulting request's own fields (contact + message) had no view of their own at all; the list row alone can't comfortably show a long message. `/admin/operators` stays list-only — add/delete are the whole feature, there's nothing a detail page would add.

## E. Operator Management

```
GET  (Server Component, not a route) /admin/operators reads via supabase.auth.admin.listUsers()
POST   /api/admin/operators            { email, password, role } — owner-only
DELETE /api/admin/operators/[userId]   owner-only
```

Guards on delete (both enforced server-side, not just hidden in the UI):
- An owner cannot delete their own account (avoids accidental self-lockout mid-session).
- An owner cannot delete the last remaining `owner` account (avoids the whole panel becoming unreachable — `staff` accounts can't create other operators, so losing the last owner would be unrecoverable without going back to the Supabase Dashboard).

`staff` gets a 403 from both routes even with a crafted request, independent of what the UI shows them.

### Bootstrapping the first account

Before any of this code runs, Claude creates 최종훈's account directly via the Supabase Admin API (`service_role` key, `supabase.auth.admin.createUser()` with `app_metadata: { role: "owner" }`, `email_confirm: true`), as a one-time manual step — not part of the application code, since there's no in-app path to create the first operator. The email/temporary password are shared with the user directly, not committed anywhere.

## F. Testing

Unit-tested (Vitest, existing pattern): the consulting-request schema (required `preferredContact`, optional `message`), the `POST /api/assessments/[assessmentId]/consulting-requests` route (mocked Supabase client — insert + `consulting_requested` update, 404 for a missing assessment), the data-access functions backing the two detail pages (fetch-by-id, 404 shape, and the consulting-request one setting `read_at` only when it was previously null), the unread-count query backing the notification badge, and the two operator-management routes (mocked `supabase.auth.admin.*` calls — role rejection for `staff`, the two delete guards, success paths).

Not automated: the login flow and all admin pages (lists and details) — consistent with the project's existing choice not to add component/E2E testing infrastructure. Verified manually: log in as the bootstrapped owner, open a consulting request's detail page and confirm the bell's unread count drops by one and stays down on a second visit, open an assessment's detail page and confirm it shows fields the public result page doesn't (email, UTM, consent metadata), add a `staff` operator, confirm that account can log in and see both lists and both detail page types but not `/admin/operators`, confirm `staff` gets 403 from the operator API routes directly, then delete the test `staff` account as `owner`.

## Explicitly Out of Scope

- "결과 PDF 받기" — a separate design pass (server-side PDF rendering is a different technical problem from anything here)
- Editing an operator's role or resetting their password from the admin UI (only add/delete for now)
- Any UI for an operator to change their own password (first-login forced password change, etc.) — the owner-set temporary password is used as-is until this is designed
- Rate limiting / spam protection on the public consult form
- GA4 `radar_pdf_request` (still waits for the PDF feature)
