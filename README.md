# PBA 7-Layer Business Radar

Independent MVP for `pba.ylia.io`. See `data/PBA_7Layer_business_radar_requirements.md`
for the full spec. Completely separate from the BARA/도형심리 project — do not
mix code, data, or branding between the two.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase project's
   URL and keys (Project Settings → API in the Supabase dashboard):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only — never commit this or expose
     it to the client)
3. Apply every file in `supabase/migrations/` (0001-0011) in order, in the
   Supabase SQL Editor. They define `assessments`, `assessment_drafts`,
   `consulting_requests`, `notices`, RLS policies, the `reports` and
   `notice-images` storage buckets, and a
   daily pg_cron job (03:00 KST) that enforces the privacy policy's retention
   periods: personal fields on diagnoses (name, email, company, role, industry
   and UTM) and consulting requests are removed after 1 year, unfinished drafts
   after 30 days. Rows an operator has put on a retention hold are skipped
   until the hold expires. Statistics should read the `assessments_research`
   view, which excludes name, email, company and role.
4. (Optional) Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to your GA4 web stream's
   measurement ID (Google Analytics → Admin → Data Streams → your stream).
   Without it, no GA4 script loads.

## Commands

- `npm run dev` — start the dev server at http://localhost:3000
- `npm run build` — production build
- `npm test` — run the Vitest suite (scoring engine + API route)
- `npm run typecheck` — TypeScript check with no emit

## Manually verifying the Supabase write path

With `.env.local` filled in (including `SUPABASE_SERVICE_ROLE_KEY`) and
`npm run dev` running:

```bash
curl -X POST http://localhost:3000/api/assessments \
  -H "Content-Type: application/json" \
  -d '{
    "basicInfo": { "name": "테스트", "email": "test@example.com", "businessStage": "idea" },
    "answers": {
      "value": [1,1,1,1], "customer": [1,1,1,1], "offer": [1,1,1,1],
      "experience": [1,1,1,1], "process": [1,1,1,1], "data": [1,1,1,1], "scale": [1,1,1,1]
    },
    "marketingConsent": false
  }'
```

Expected: `201` response with `"architectureLevel": "IDEA_STAGE"` and a new row
visible in the `assessments` table in Supabase Studio.

## GA4 events

Event names are defined in `src/lib/analytics/events.ts` (spec section 21).
Call `trackEvent(name, params)` from `src/lib/analytics/ga4.ts` — it's a
safe no-op during SSR or when `window.gtag` isn't available (e.g. no
measurement ID configured, or an ad blocker).

- `radar_landing_view` — landing page
- `radar_start` — basic info submitted / draft created
- `radar_layer_complete` — each layer's answers saved
- `radar_complete` — diagnosis finished, assessment persisted
- `radar_result_view` — result page viewed
- `radar_consulting_click` — result page "내 사업 구조 상담하기" CTA
- `radar_consulting_submit` — consult form submitted
- `radar_pdf_request` — "결과 PDF 저장 · 인쇄" on the result page (opens the
  print dialog; print styles give a clean A4 PDF via "Save as PDF")
- Page paths containing an assessment or draft id are masked
  (`/diagnose/result/:id`) before gtag sees them — see
  `src/lib/analytics/mask-path.ts` and
  `src/components/analytics/MaskedPageLocation.tsx`.

## Admin panel

`/admin` is gated by Supabase Auth (`@supabase/ssr`, session refreshed in
`middleware.ts`). Operators are Supabase Auth users whose `app_metadata.role`
is `owner` or `staff`; any other account is refused. Keep "Allow new users to
sign up" off in Supabase (Authentication → Sign In / Providers) — operators
are only ever created from `/admin/operators` or the Admin API.

- `/admin/login` — email/password login
- `/admin/consulting-requests` — requests submitted from the consult page.
  Unread ones show a NEW badge and light up the header bell; opening a
  request's detail page marks it read.
- `/admin/assessments` — every completed diagnosis, with a detail page that
  includes fields the public result page omits (email, UTM, consent, result
  fit, revenue/growth bands). Its 정보 보관 card holds the personal data past
  the default year with a required reason, reverts to the default, or deletes
  it now.
- `/admin/notices` — write and publish announcements. The body is rich text
  (Tiptap), images upload to the `notice-images` bucket, and the HTML is
  sanitized server-side on save (`src/lib/notices/sanitize-notice-html.ts`)
  so every render trusts the stored row. Published notices appear at
  `/notice`; one marked important shows in a dismissible banner on every
  public page until its end date.
- `/admin/operators` — owner-only. Add or delete operators. An owner can't
  delete their own account or the last remaining owner.
- `/admin/account` — every operator can change their own password (current
  password required). Supabase then signs the account out everywhere; the
  browser that made the change is signed straight back in.

The first owner account can't be created from inside the app. Create it once
with the Supabase Admin API using the service role key:

```js
await supabase.auth.admin.createUser({
  email: "owner@example.com",
  password: "<temporary password>",
  email_confirm: true,
  app_metadata: { role: "owner" },
});
```

## Scope of this codebase so far

Implemented: project scaffold, Supabase client wiring, the scoring/level/
bottleneck engine, the `assessments` write path, GA4 setup, and the full
`/diagnose` flow (basic info → 7-layer question wizard, resumable via
server-persisted drafts → result page with Radar chart, summary,
per-layer maturity, risk signals, a cause hypothesis, bottleneck/strength
cards, and a 90-day priority timeline), the consulting
request flow (`/diagnose/result/[assessmentId]/consult`), the notice board
(`/notice`), and the admin panel described above.

**Not yet implemented** (future plans): Phase 2 (server-side PDF and Resend
email delivery) and multi-language support.
