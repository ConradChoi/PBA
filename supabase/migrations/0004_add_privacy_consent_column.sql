-- Fixes an omission in 0002_add_consent_tracking.sql: that migration added
-- privacy_consent_at/privacy_notice_version but forgot the base
-- privacy_consent boolean column itself.
alter table assessments add column if not exists privacy_consent boolean not null default false;
