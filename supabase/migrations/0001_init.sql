-- PBA 7-Layer Business Radar — initial schema
-- Replaces the Google Sheets/Drive storage described in
-- data/PBA_7Layer_business_radar_requirements.md (section 16-18)

create extension if not exists "pgcrypto";

create table assessments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company_name text,
  role text,
  business_stage text not null
    check (business_stage in ('idea','mvp_prep','building','operating','growth','realign')),
  industry text,
  team_size text,
  score_value_raw smallint not null check (score_value_raw between 4 and 20),
  score_value_100 smallint not null check (score_value_100 between 0 and 100),
  score_customer_raw smallint not null check (score_customer_raw between 4 and 20),
  score_customer_100 smallint not null check (score_customer_100 between 0 and 100),
  score_offer_raw smallint not null check (score_offer_raw between 4 and 20),
  score_offer_100 smallint not null check (score_offer_100 between 0 and 100),
  score_experience_raw smallint not null check (score_experience_raw between 4 and 20),
  score_experience_100 smallint not null check (score_experience_100 between 0 and 100),
  score_process_raw smallint not null check (score_process_raw between 4 and 20),
  score_process_100 smallint not null check (score_process_100 between 0 and 100),
  score_data_raw smallint not null check (score_data_raw between 4 and 20),
  score_data_100 smallint not null check (score_data_100 between 0 and 100),
  score_scale_raw smallint not null check (score_scale_raw between 4 and 20),
  score_scale_100 smallint not null check (score_scale_100 between 0 and 100),
  total_raw smallint not null check (total_raw between 28 and 140),
  architecture_level text not null
    check (architecture_level in ('IDEA_STAGE','FOUNDER_DEPENDENT','STRUCTURE_NEEDED','GROWTH_READY','SYSTEMIZED')),
  bottleneck_1 text not null,
  bottleneck_2 text not null,
  bottleneck_3 text not null,
  strength_1 text not null,
  strength_2 text not null,
  consulting_cta_clicked boolean not null default false,
  consulting_requested boolean not null default false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  marketing_consent boolean not null default false,
  report_pdf_path text
);

create table consulting_requests (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  preferred_contact text not null,
  message text,
  requested_at timestamptz not null default now()
);

-- Row Level Security: anon (browser) can only insert, never read/update/delete.
-- All reads/updates (admin dashboard, PDF generation, CRM sync) go through
-- server routes using the service_role key.

alter table assessments enable row level security;
alter table consulting_requests enable row level security;

create policy "anon can insert assessments"
  on assessments for insert
  to anon
  with check (true);

create policy "service role full access assessments"
  on assessments for all
  to service_role
  using (true) with check (true);

create policy "anon can insert consulting_requests"
  on consulting_requests for insert
  to anon
  with check (true);

create policy "service role full access consulting_requests"
  on consulting_requests for all
  to service_role
  using (true) with check (true);

-- Storage bucket for generated PDF reports (replaces Google Drive).
-- Kept private; reports are handed to users via short-lived signed URLs.

insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

create policy "service role manage reports"
  on storage.objects for all
  to service_role
  using (bucket_id = 'reports')
  with check (bucket_id = 'reports');
