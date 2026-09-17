# PBA 7-Layer Business Radar

Independent MVP for `radar.ylia.io`. See `data/PBA_7Layer_business_radar_requirements.md`
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

- `radar_landing_view` — wired via `<TrackPageView>` on the landing page
- the remaining 7 events (`radar_start`, `radar_layer_complete`,
  `radar_complete`, `radar_result_view`, `radar_pdf_request`,
  `radar_consulting_click`, `radar_consulting_submit`) are declared but not
  yet called — wire them into their corresponding screen as it's built.

## Scope of this codebase so far

Implemented: project scaffold, Supabase client wiring, the scoring/level/
bottleneck engine, the `assessments` write path, and GA4 setup (one event
wired). **Not yet implemented** (future plans): the 28-question UI flow,
the `/diagnose` route, the Radar chart, PDF generation, Resend email, the
remaining GA4 events, and the consulting form.
