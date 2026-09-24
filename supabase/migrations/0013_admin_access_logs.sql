-- 접속기록(access records) for the admin panel, required by
-- 「개인정보의 안전성 확보조치 기준」 제8조: a 개인정보처리시스템 must record
-- its 개인정보취급자's 계정 / 접속일시 / 접속지 정보 / 처리한 정보주체 정보 /
-- 수행업무, keep them for at least 1 year, and inspect them monthly.
-- The admin panel shows customer names and emails, so it qualifies.
--
-- This also fills a gap found while investigating the 2026-09-23 exposure
-- incident (docs/security/2026-09-23-admin-exposure-incident.md, §9): Amplify
-- exposes access logs only for the default *.amplifyapp.com domain, never for
-- pba.ylia.io, so infrastructure logs cannot answer "who reached the admin
-- panel". This application-level record is the replacement, and unlike the
-- Amplify log it also captures denied (unauthenticated) attempts.
--
-- Rows are written by src/middleware.ts on every /admin/* request.
create table admin_access_logs (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  -- granted = an authenticated operator reached the route;
  -- denied = the request was redirected to the login page.
  outcome text not null check (outcome in ('granted', 'denied')),
  -- Null on a denied request: there is no account to attribute it to.
  operator_id uuid,
  operator_email text,
  method text not null,
  path text not null,
  -- The 정보주체 whose data the request touched, parsed from
  -- /admin/assessments/<uuid>. Deliberately NOT a foreign key: an assessment
  -- can be deleted or purged long before this log's 13-month retention ends,
  -- and a cascade (or a blocking reference) would either erase the record of
  -- who looked at it or stop the purge from running at all.
  subject_assessment_id uuid,
  -- 접속지 정보. x-forwarded-for's first entry, falling back to
  -- cloudfront-viewer-address.
  ip text,
  user_agent text
);

-- Every read of this table is "the most recent N rows", for the monthly
-- inspection and for the /admin/access-logs screen.
create index admin_access_logs_occurred_at_idx on admin_access_logs (occurred_at desc);

alter table admin_access_logs enable row level security;
-- No anon/authenticated policies and no grants: all access goes through the
-- server using the service role, same as assessments and notices. Belt and
-- braces with RLS, since a future grant would otherwise expose an operator
-- activity trail through the REST API.
revoke all on admin_access_logs from anon, authenticated;

-- Redefined (not altered) to add the access-log purge. The body below is
-- 0011_result_enrichment.sql's definition verbatim plus the final delete;
-- `create or replace` overwrites the whole function, so every existing
-- statement has to be repeated or the personal data it purges would silently
-- stop being purged.
create or replace function purge_expired_personal_data()
returns void
language sql
security definer
set search_path = public
as $$
  -- Strip everything that identifies the person, including the free-text and
  -- campaign fields that could re-identify a small business. Coarse bands
  -- (revenue, growth, team size) stay: they are not identifying on their own.
  update assessments
  set name = null,
      email = null,
      company_name = null,
      role = null,
      marketing_consent = false,
      industry = null,
      utm_source = null,
      utm_medium = null,
      utm_campaign = null
  where coalesce(privacy_consent_at, created_at) < now() - interval '1 year'
    and (retain_until is null or retain_until < now())
    and (name is not null or email is not null or company_name is not null
         or role is not null or marketing_consent or industry is not null
         or utm_source is not null or utm_medium is not null
         or utm_campaign is not null);

  delete from consulting_requests
  where created_at < now() - interval '1 year'
    and assessment_id not in (
      select id from assessments where retain_until is not null and retain_until >= now()
    );

  delete from assessment_drafts
  where updated_at < now() - interval '30 days';

  -- 13 months, not 12: the legal floor is 1 year, and the extra month keeps
  -- the purge from trimming a record that is still inside the required
  -- window because of timing (a run scheduled for 03:00 KST, a month that
  -- has just turned over, an inspection still in progress).
  delete from admin_access_logs
  where occurred_at < now() - interval '13 months';
$$;

revoke execute on function purge_expired_personal_data() from public, anon, authenticated;
grant execute on function purge_expired_personal_data() to service_role;
