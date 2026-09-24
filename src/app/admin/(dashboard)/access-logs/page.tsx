import { redirect } from "next/navigation";
import { requireOperator } from "@/lib/operators/require-operator";
import { listOperators } from "@/lib/operators/list-operators";
import {
  listAccessLogs,
  summarizeAccessLogs,
  parseAccessLogRange,
  ACCESS_LOG_MAX_ROWS,
} from "@/lib/access-logs/list-access-logs";
import type { AccessLogOutcome } from "@/lib/access-logs/build-access-log-entry";
import { formatAccessTime } from "@/lib/access-logs/format-access-time";
import { AccessLogsTable } from "@/components/admin/AccessLogsTable";
import { AccessLogsFilters } from "@/components/admin/AccessLogsFilters";

// This page exists so the monthly inspection required by
// 「개인정보의 안전성 확보조치 기준」 제8조 제2항 is something an operator can
// actually do, rather than a SQL query nobody runs. That means it has to be
// able to show a month at a time, not just the newest few days — /admin is
// scanned continuously, and without a date range those scans would be the
// only thing on screen.
const OUTCOMES: (AccessLogOutcome | "all")[] = ["all", "granted", "denied", "forbidden"];

function readParam(
  value: string | string[] | undefined,
  allowed: readonly string[],
  fallback: string
): string {
  const single = Array.isArray(value) ? value[0] : value;
  return single && allowed.includes(single) ? single : fallback;
}

export default async function AccessLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Verify the operator before reading anything: a layout redirect alone
  // still lets this page's data reach the response body.
  const operator = await requireOperator();

  // owner-only, like 운영자 관리: this is a record of what every operator did,
  // and staff should not be able to read (or audit) each other. Middleware
  // has already recorded a staff account that got this far as `forbidden`
  // (see src/lib/operators/owner-only-paths.ts), so the attempt is on the
  // record even though the redirect below is what actually stops it.
  if (operator.role !== "owner") {
    redirect("/admin/consulting-requests");
  }

  const params = await searchParams;
  const operators = await listOperators();
  const accounts = operators.map((o) => o.email).filter(Boolean);

  const filters = {
    range: parseAccessLogRange(Array.isArray(params.range) ? params.range[0] : params.range),
    outcome: readParam(params.outcome, OUTCOMES, "all") as AccessLogOutcome | "all",
    account: readParam(params.account, ["all", ...accounts], "all"),
    subjectOnly: readParam(params.subjects, ["all", "subject"], "all") === "subject",
  };

  const [page, summary] = await Promise.all([
    listAccessLogs(filters),
    // Counted over the same range and account, but across every outcome, so
    // the totals stay honest when the table below is capped.
    summarizeAccessLogs({ ...filters, outcome: "all" }),
  ]);

  const rows = page.rows.map((log) => ({
    ...log,
    occurredAtLabel: formatAccessTime(log.occurred_at),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">접속기록</h1>
        <p className="mt-1 text-sm text-slate-500">
          어드민 화면 조회와 어드민 API를 통한 변경(파기·보존기간 변경·운영자 추가/삭제·공지
          삭제 등)을 모두 기록합니다. owner만 볼 수 있으며, 기록은 13개월간 보관되고 매월 1회
          이상 점검해야 합니다.
        </p>
        {/* The one thing this screen cannot show, said plainly: the owner
            would otherwise read "차단 0건" as "nobody tried to break in". */}
        <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
          로그인 시도는 여기에 남지 않습니다. 로그인은 브라우저에서 Supabase Auth로 직접
          처리되어 이 서비스를 거치지 않기 때문에, 비밀번호 추측 같은 로그인 실패는 Supabase
          대시보드의 Auth Logs에서 확인해야 합니다. 로그인 성공은 그 직후 어드민 요청이
          「허용」으로 남아 간접적으로 확인됩니다.
        </p>
      </div>

      <AccessLogsFilters values={filters} accounts={accounts} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-slate-500">
          {formatAccessTime(page.since)} 이후 · 조건에 맞는 기록 {page.total.toLocaleString()}건
        </span>
        <span className="text-slate-600">허용 {summary.granted.toLocaleString()}건</span>
        <span className={summary.denied > 0 ? "font-semibold text-red-600" : "text-slate-600"}>
          차단 {summary.denied.toLocaleString()}건
        </span>
        <span className={summary.forbidden > 0 ? "font-semibold text-amber-600" : "text-slate-600"}>
          권한없음 {summary.forbidden.toLocaleString()}건
        </span>
      </div>

      {page.total > rows.length && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          기간 내 {page.total.toLocaleString()}건 중 최신 {ACCESS_LOG_MAX_ROWS.toLocaleString()}건만
          표시했습니다. 기간을 좁히거나 결과·계정으로 걸러서 보세요.
        </p>
      )}

      <AccessLogsTable logs={rows} />
    </div>
  );
}
