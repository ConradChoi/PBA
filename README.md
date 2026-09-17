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
3. The database schema (`assessments`, `consulting_requests`, RLS policies,
   the `reports` storage bucket) lives in `supabase/migrations/0001_init.sql`.
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
- `radar_pdf_request`, `radar_consulting_click`, `radar_consulting_submit` —
  declared but not yet called; wait for Phase 2 / the consulting form.

## Scope of this codebase so far

Implemented: project scaffold, Supabase client wiring, the scoring/level/
bottleneck engine, the `assessments` write path, GA4 setup, and the full
`/diagnose` flow (basic info → 7-layer question wizard, resumable via
server-persisted drafts → result page with Radar chart, summary,
bottleneck/strength cards, and a 90-day priority timeline).

**Not yet implemented** (future plans): Phase 2 (PDF generation, Resend
email), the consulting request form (`radar_consulting_click`/
`radar_consulting_submit`/`radar_pdf_request` events wait for it), a
standalone privacy-policy page, and abandoned-draft cleanup (TTL/cron).

**Known copy gaps** (intentional placeholders, not bugs — see
`docs/superpowers/specs/2026-09-17-diagnose-flow-and-result-design.md`
section D): `src/lib/content/layer-descriptions.ts` (all 7 layers) and 4
of 7 entries in `src/lib/content/strength-copy.ts` read
`[카피 필요: ...]`. Fill these in before a real launch.
