-- Follow-up to 0013_admin_access_logs.sql. A separate file rather than an
-- edit to 0013, because 0013 may already have been applied by hand.
--
-- Two gaps found in review, both about 「개인정보의 안전성 확보조치 기준」
-- 제8조's "처리한 정보주체 정보" and the monthly inspection that reads it.

-- 1. outcome could only say whether the request was authenticated, never
--    whether it was authorised. A staff account repeatedly opening
--    /admin/operators or /admin/access-logs was recorded as 'granted',
--    because those pages refuse it themselves, after middleware. An insider
--    exceeding their privileges is exactly what a monthly inspection is for,
--    so it now has its own value:
--
--      granted   = an operator reached a route their role allows
--      denied    = no session at all; the request was sent to the login page
--                  (or, under /api/admin, answered with 401)
--      forbidden = a real session that is not allowed here — an account with
--                  no operator role, or a staff account on an owner-only route
alter table admin_access_logs drop constraint if exists admin_access_logs_outcome_check;
alter table admin_access_logs
  add constraint admin_access_logs_outcome_check
  check (outcome in ('granted', 'denied', 'forbidden'));

-- 2. /admin/consulting-requests/<id> shows the person's name, email and
--    free-text message — the densest personal data in the panel — but left
--    no 정보주체 on the row, because a consulting request's id is its own
--    uuid, not the assessment's. It gets its own column instead of being
--    forced into subject_assessment_id, which would have pointed at an
--    assessments row that does not exist. The person is recovered at
--    inspection time with
--      join consulting_requests on id = subject_consulting_request_id
--    which yields assessment_id.
--
--    No foreign key, for the same reason as subject_assessment_id: the
--    consulting request is deleted after a year by
--    purge_expired_personal_data() while this log is kept for 13 months, and
--    a cascade would erase the record of who read it.
alter table admin_access_logs add column if not exists subject_consulting_request_id uuid;
