// The decision half of admin access logging: what, if anything, a given
// admin request should leave in admin_access_logs. Pure on purpose — the
// Supabase write lives in record-access-log.ts — so the rules that decide
// whether an access is recorded at all can be tested without a database, and
// without going through Next's request pipeline (which Vitest cannot do; see
// scripts/check-admin-no-leak.mjs for why).
//
// Fields map onto 「개인정보의 안전성 확보조치 기준」 제8조: 계정
// (operator_id/operator_email), 접속일시 (the table's occurred_at default),
// 접속지 정보 (ip), 처리한 정보주체 정보 (subject_assessment_id /
// subject_consulting_request_id), 수행업무 (method + path).
//
// WHAT THIS CANNOT SEE: login attempts. src/app/admin/login/page.tsx signs in
// with supabase.auth.signInWithPassword() from the browser, straight to the
// Supabase Auth endpoint — the request never touches this application, so
// neither a successful nor a failed login produces a row here. A successful
// login is still covered indirectly, because the operator's very next admin
// request is recorded as `granted`; a failed one, and therefore password
// guessing against an operator account, is not visible to us at all and has
// to be inspected in Supabase Auth Logs. The access-log screen says so rather
// than letting the owner assume otherwise.

import { isOwnerOnlyAdminPath } from "../operators/owner-only-paths";
import { parseOperatorRole } from "../operators/operator-role";

export type AccessLogOutcome = "granted" | "denied" | "forbidden";

export type AccessLogEntry = {
  outcome: AccessLogOutcome;
  operator_id: string | null;
  operator_email: string | null;
  method: string;
  path: string;
  subject_assessment_id: string | null;
  subject_consulting_request_id: string | null;
  ip: string | null;
  user_agent: string | null;
};

// A user agent is an attacker-controlled header of unbounded length. 255 is
// past the length of every real browser's string, so nothing legitimate is
// lost, and a single row can no longer be inflated.
const USER_AGENT_MAX = 255;

// The path is attacker-controlled too, and for the same reason: anyone can
// request /admin/<many kilobytes> without authenticating, and each attempt
// writes a row that is kept for 13 months. Every route this project actually
// serves is far under 512 characters, so a truncated path only ever happens
// to a request that was never going to match one.
const PATH_MAX = 512;

const UUID = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
// Both the page and its API counterpart address the same person, e.g.
// /admin/assessments/<id> (read) and /api/admin/assessments/<id>/purge
// (destroy), so the optional /api prefix is part of the same rule.
const ASSESSMENT_PATH = new RegExp(`^/(?:api/)?admin/assessments/(${UUID})(?:/|$)`);
const CONSULTING_REQUEST_PATH = new RegExp(
  `^/(?:api/)?admin/consulting-requests/(${UUID})(?:/|$)`
);

const IPV4_WITH_PORT = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/;

function readIp(headers: Headers): string | null {
  // Behind CloudFront the client is the first entry; everything after it is
  // the proxy chain. NextRequest.ip does not exist in Next 15, so this is
  // the only source.
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const client = forwardedFor.split(",")[0].trim();
    if (client) {
      return client;
    }
  }

  const viewerAddress = headers.get("cloudfront-viewer-address");
  if (!viewerAddress) {
    return null;
  }

  // CloudFront sends "<ip>:<source port>". Stripping the port is only
  // unambiguous for IPv4; for IPv6 the address itself is full of colons, so
  // the raw value is stored rather than risk truncating the address.
  const ipv4 = viewerAddress.match(IPV4_WITH_PORT);
  return ipv4 ? ipv4[1] : viewerAddress;
}

// granted / denied / forbidden, decided from the same source the pages use.
//
// `denied` is "no session at all"; `forbidden` is "a session that is not
// allowed here" — either an authenticated account that was never made an
// operator (requireOperator() bounces it) or a staff account reaching for an
// owner-only screen (the page's own `role !== "owner"` bounces it). Both
// refusals happen after middleware, so without this the log would call an
// insider probing /admin/operators an ordinary `granted` read, and the
// monthly inspection would have nothing to notice.
function decideOutcome(
  path: string,
  user: { app_metadata?: unknown } | null
): AccessLogOutcome {
  if (!user) {
    return "denied";
  }

  const role = parseOperatorRole(user.app_metadata);

  if (!role) {
    return "forbidden";
  }

  return role !== "owner" && isOwnerOnlyAdminPath(path) ? "forbidden" : "granted";
}

export function buildAccessLogEntry({
  path,
  method,
  headers,
  user,
}: {
  path: string;
  method: string;
  headers: Headers;
  user: { id: string; email?: string | null; app_metadata?: unknown } | null;
}): AccessLogEntry | null {
  // The visitor's denied request is already recorded against the path they
  // asked for; the login page they land on afterwards is the same attempt
  // counted twice.
  if (path === "/admin/login") {
    return null;
  }

  // A prefetch is a request no operator made, and must not become a row —
  // least of all one carrying subject_assessment_id, which would read as
  // "this operator opened that person's file".
  //
  // This check does NOT currently fire, and cannot: Next 15 deletes the
  // FLIGHT_HEADERS (rsc, next-router-prefetch, next-router-state-tree, …)
  // from the request before middleware runs — see
  // node_modules/next/dist/esm/server/web/adapter.js, "Headers should only
  // be stripped for middleware". It is kept because it costs nothing and is
  // correct the day that changes. What actually keeps prefetches out of the
  // table is that no admin <Link> prefetches at all; that is the invariant
  // src/app/admin/admin-link-prefetch.guard.test.ts pins, and its comment
  // has the full reasoning.
  if (headers.get("next-router-prefetch")) {
    return null;
  }

  const assessment = path.match(ASSESSMENT_PATH);
  // A consulting request's id is NOT its assessment's id (consulting_requests
  // has its own uuid primary key plus an assessment_id column), and this
  // screen shows the person's name, email and message — the densest personal
  // data in the panel. Putting the request id into subject_assessment_id
  // would make that column point at a row that does not exist, so it is kept
  // in its own column and the 정보주체 is recovered at inspection time with
  // `join consulting_requests on id = subject_consulting_request_id`.
  // Resolving it here instead would mean a database read inside middleware on
  // every admin request, which is exactly the latency the logging write is
  // already being kept short to avoid.
  const consultingRequest = path.match(CONSULTING_REQUEST_PATH);
  const userAgent = headers.get("user-agent");

  return {
    outcome: decideOutcome(path, user),
    operator_id: user?.id ?? null,
    operator_email: user?.email ?? null,
    method,
    path: path.slice(0, PATH_MAX),
    subject_assessment_id: assessment ? assessment[1] : null,
    subject_consulting_request_id: consultingRequest ? consultingRequest[1] : null,
    ip: readIp(headers),
    user_agent: userAgent ? userAgent.slice(0, USER_AGENT_MAX) : null,
  };
}
