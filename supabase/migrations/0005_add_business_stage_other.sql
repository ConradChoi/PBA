-- Adds an "other" option to business_stage, with a free-text detail column
-- on both assessments and assessment_drafts.
alter table assessments drop constraint if exists assessments_business_stage_check;
alter table assessments add constraint assessments_business_stage_check
  check (business_stage in ('idea','mvp_prep','building','operating','growth','realign','other'));
alter table assessments add column if not exists business_stage_other text;
