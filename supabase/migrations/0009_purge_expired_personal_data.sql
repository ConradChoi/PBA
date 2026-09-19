-- Enforces the retention periods in the privacy policy (/privacy, section 3):
--   * personal data from a diagnosis or consulting request: 1 year
--   * marketing consent: 1 year (or until withdrawn)
--   * unfinished diagnosis drafts: 30 days after the last answer
-- Runs daily at 03:00 KST via pg_cron.

create extension if not exists pg_cron;

create or replace function purge_expired_personal_data()
returns void
language sql
security definer
set search_path = public
as $$
  -- Keep the diagnosis itself (non-identifying, used for statistics) but
  -- strip everything that identifies the person. Rows from before consent
  -- tracking have no privacy_consent_at, so fall back to created_at.
  update assessments
  set name = null,
      email = null,
      company_name = null,
      role = null,
      marketing_consent = false
  where coalesce(privacy_consent_at, created_at) < now() - interval '1 year'
    and (name is not null or email is not null or company_name is not null
         or role is not null or marketing_consent);

  delete from consulting_requests
  where created_at < now() - interval '1 year';

  delete from assessment_drafts
  where updated_at < now() - interval '30 days';
$$;

-- Functions in public are callable through the REST API by default; only the
-- scheduler (and service_role, for manual runs) should be able to call this.
revoke execute on function purge_expired_personal_data() from public, anon, authenticated;
grant execute on function purge_expired_personal_data() to service_role;

-- 18:00 UTC = 03:00 KST. Scheduling under the same name replaces the job.
select cron.schedule(
  'purge-expired-personal-data',
  '0 18 * * *',
  'select purge_expired_personal_data()'
);
