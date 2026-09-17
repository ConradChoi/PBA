-- Adds consent record-keeping to assessments and removes the now-unused
-- anon insert policy (all writes go through server routes with service_role).
alter table assessments add column privacy_consent_at timestamptz;
alter table assessments add column privacy_notice_version text not null default '2026-09-17';

drop policy if exists "anon can insert assessments" on assessments;
drop policy if exists "service role full access assessments" on assessments;
create policy "service role full access assessments"
  on assessments for all
  to service_role
  using (true) with check (true);
