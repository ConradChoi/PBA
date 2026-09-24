import { createServiceRoleSupabaseClient } from "../supabase/server";
import type { AccessLogOutcome } from "./build-access-log-entry";

export type AccessLogRow = {
  id: string;
  occurred_at: string;
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

// The inspection this screen exists for is monthly (안전성 확보조치 기준 제8조
// 제2항) over a 13-month retention, so a fixed "newest 200 rows" was the wrong
// shape: /admin is scanned continuously by bots, every scan is now a denied
// row, and each deploy's security check adds more — at that volume 200 rows is
// a few days, and real operator activity is pushed off the screen before the
// owner ever sees it. Every query is therefore bounded by a date range the
// owner picks, and filtered in the database rather than in the browser, so the
// row cap applies to what was asked for instead of to everything.
export type AccessLogRange = "7d" | "30d" | "90d" | "13m";

export const DEFAULT_ACCESS_LOG_RANGE: AccessLogRange = "30d";

// 13m is 396 days rather than 13 × 30: it has to reach the oldest row the
// retention keeps, and a short month would otherwise hide it.
const RANGE_DAYS: Record<AccessLogRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "13m": 396,
};

// The range arrives from the URL, so it is whatever anyone types. `in` would
// also accept inherited keys ("toString" is in every object literal), which
// would produce a NaN date and a 500 instead of a view.
export function parseAccessLogRange(value: string | undefined): AccessLogRange {
  return value && Object.prototype.hasOwnProperty.call(RANGE_DAYS, value)
    ? (value as AccessLogRange)
    : DEFAULT_ACCESS_LOG_RANGE;
}

export function accessLogRangeStart(range: AccessLogRange, now: Date = new Date()): Date {
  return new Date(now.getTime() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000);
}

// A ceiling, not a page size: the summary counts are queried separately and
// are exact, so a truncated table still tells the owner how much it is not
// showing and which filter would narrow it.
export const ACCESS_LOG_MAX_ROWS = 500;

export type AccessLogFilters = {
  range?: AccessLogRange;
  outcome?: AccessLogOutcome | "all";
  /** An operator's email, or "all". */
  account?: string;
  /** Only requests that touched an identifiable person's record. */
  subjectOnly?: boolean;
  now?: Date;
};

export type AccessLogPage = {
  rows: AccessLogRow[];
  /** Rows matching the filters in the database, before the row cap. */
  total: number;
  since: string;
};

export type AccessLogSummary = {
  granted: number;
  denied: number;
  forbidden: number;
};

// The filters are described as data rather than applied to a builder here,
// because the row query and the count queries use two differently-typed
// PostgREST builders and a function generic over both makes tsc give up
// (TS2589). This keeps one definition of "what the owner asked for" and lets
// each caller apply it to its own builder.
type FilterOp =
  | { kind: "gte"; column: string; value: string }
  | { kind: "eq"; column: string; value: string }
  | { kind: "or"; filter: string };

function filterOps(filters: AccessLogFilters, since: string): FilterOp[] {
  const ops: FilterOp[] = [{ kind: "gte", column: "occurred_at", value: since }];

  if (filters.outcome && filters.outcome !== "all") {
    ops.push({ kind: "eq", column: "outcome", value: filters.outcome });
  }

  if (filters.account && filters.account !== "all") {
    ops.push({ kind: "eq", column: "operator_email", value: filters.account });
  }

  if (filters.subjectOnly) {
    // "Which requests touched someone's record" — the question the 처리한
    // 정보주체 정보 column exists to answer. Either subject column counts.
    ops.push({
      kind: "or",
      filter: "subject_assessment_id.not.is.null,subject_consulting_request_id.not.is.null",
    });
  }

  return ops;
}

export async function listAccessLogs(filters: AccessLogFilters = {}): Promise<AccessLogPage> {
  const range = filters.range ?? DEFAULT_ACCESS_LOG_RANGE;
  const since = accessLogRangeStart(range, filters.now).toISOString();

  const supabase = createServiceRoleSupabaseClient();
  let query = supabase.from("admin_access_logs").select("*", { count: "exact" });

  for (const op of filterOps(filters, since)) {
    if (op.kind === "gte") query = query.gte(op.column, op.value);
    else if (op.kind === "eq") query = query.eq(op.column, op.value);
    else query = query.or(op.filter);
  }

  const { data, error, count } = await query
    .order("occurred_at", { ascending: false })
    .limit(ACCESS_LOG_MAX_ROWS);

  if (error) {
    throw new Error(error.message);
  }

  return {
    rows: (data ?? []) as AccessLogRow[],
    total: count ?? (data ?? []).length,
    since,
  };
}

// Counted in the database rather than from the rows above, so the numbers stay
// true when the table is capped — the point of the monthly inspection is
// noticing a spike, and a spike is exactly what overflows the cap.
export async function summarizeAccessLogs(
  filters: AccessLogFilters = {}
): Promise<AccessLogSummary> {
  const range = filters.range ?? DEFAULT_ACCESS_LOG_RANGE;
  const since = accessLogRangeStart(range, filters.now).toISOString();
  const supabase = createServiceRoleSupabaseClient();

  const outcomes: AccessLogOutcome[] = ["granted", "denied", "forbidden"];
  const counted = await Promise.all(
    outcomes.map(async (outcome) => {
      let query = supabase.from("admin_access_logs").select("id", { count: "exact", head: true });

      for (const op of filterOps({ ...filters, outcome }, since)) {
        if (op.kind === "gte") query = query.gte(op.column, op.value);
        else if (op.kind === "eq") query = query.eq(op.column, op.value);
        else query = query.or(op.filter);
      }

      const { count, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return count ?? 0;
    })
  );

  return { granted: counted[0], denied: counted[1], forbidden: counted[2] };
}
