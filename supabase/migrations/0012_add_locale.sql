-- Which language the person took the diagnosis in: operators answer consult
-- requests in it, and Phase 2 PDFs/emails will be generated in it.
alter table assessment_drafts
  add column locale text not null default 'ko'
  check (locale in ('ko', 'en', 'zh-CN', 'zh-TW', 'ja'));

alter table assessments
  add column locale text not null default 'ko'
  check (locale in ('ko', 'en', 'zh-CN', 'zh-TW', 'ja'));
