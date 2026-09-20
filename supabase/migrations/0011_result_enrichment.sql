-- Phase B of the result enrichment design: non-identifying outcome data
-- collected on the result page, plus operator-controlled retention for
-- contracted customers.
alter table assessments
  add column result_fit smallint check (result_fit between 1 and 5),
  add column result_fit_at timestamptz,
  add column revenue_band text check (
    revenue_band in ('pre_revenue', 'lt_100m', '100m_1b', '1b_5b', '5b_10b', 'gte_10b')
  ),
  add column growth_band text check (
    growth_band in ('decline', 'flat', '10_50', '50_100', 'gte_100', 'lt_1y')
  ),
  add column outcome_at timestamptz,
  -- Retention hold: while retain_until is in the future the daily purge
  -- leaves this row (and its consulting requests) alone.
  add column retain_until timestamptz,
  add column retention_reason text,
  add column retention_updated_by text,
  add column retention_updated_at timestamptz;

-- Statistics and methodology research run against this view, never the base
-- table, so identifying columns can't leak into an analysis by accident.
create view assessments_research as
select
  id, business_stage, business_stage_other, industry, team_size,
  score_value_raw, score_value_100, score_customer_raw, score_customer_100,
  score_offer_raw, score_offer_100, score_experience_raw, score_experience_100,
  score_process_raw, score_process_100, score_data_raw, score_data_100,
  score_scale_raw, score_scale_100, total_raw, architecture_level,
  bottleneck_1, bottleneck_2, bottleneck_3, strength_1, strength_2,
  consulting_requested, result_fit, revenue_band, growth_band, created_at
from assessments;

revoke all on assessments_research from anon, authenticated;

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
$$;

revoke execute on function purge_expired_personal_data() from public, anon, authenticated;
grant execute on function purge_expired_personal_data() to service_role;
