-- consulting_requests already exists from 0001_init.sql; align it with the
-- admin panel design instead of recreating it.

-- Match assessments.created_at so admin list/detail code sorts the same way.
alter table consulting_requests rename column requested_at to created_at;

-- read_at is null until an operator opens the request's own detail page --
-- it backs the admin header's notification bell, not a processing status.
alter table consulting_requests add column read_at timestamptz;

-- Inserts now go through the server route (service_role), same pattern as
-- assessment_drafts, so the browser no longer needs direct insert access.
drop policy if exists "anon can insert consulting_requests" on consulting_requests;
