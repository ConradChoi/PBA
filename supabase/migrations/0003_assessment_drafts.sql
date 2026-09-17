-- In-progress diagnosis state, keyed by draftId in the URL. No RLS policy
-- is granted to anon/authenticated: with RLS enabled and zero policies,
-- those roles get zero access. Only service_role (which bypasses RLS in
-- Supabase) can read/write this table -- all client access goes through
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
