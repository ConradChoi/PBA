import Link from "next/link";
import type { AccessLogRow } from "@/lib/access-logs/list-access-logs";

// 접속일시 is formatted on the server (see formatAccessTime): the server runs
// in UTC and the browser in KST, so formatting in the browser would show a
// different string than the one the row was rendered with.
export type AccessLogView = AccessLogRow & { occurredAtLabel: string };

// Presentational only. Filtering moved to the database (see
// list-access-logs.ts): a month of this table is more rows than the screen
// caps at, so filtering here would only have filtered the rows that survived
// the cap.
const OUTCOME_STYLE = {
  granted: { label: "허용", row: "", badge: "bg-slate-100 text-slate-700" },
  // Someone with no session at all — usually an internet scanner, sometimes
  // an operator whose session expired.
  denied: { label: "차단", row: "bg-red-50", badge: "bg-red-600 text-white" },
  // A real account reaching past its privileges: staff on an owner-only
  // screen, or an account that was never made an operator. Distinct from
  // 차단 on purpose — this is the row an insider leaves behind.
  forbidden: { label: "권한없음", row: "bg-amber-50", badge: "bg-amber-600 text-white" },
} as const;

function SubjectCell({ log }: { log: AccessLogView }) {
  if (log.subject_assessment_id) {
    return (
      <Link
        href={`/admin/assessments/${log.subject_assessment_id}`}
        prefetch={false}
        className="font-mono text-xs font-semibold text-indigo-600"
      >
        진단 {log.subject_assessment_id.slice(0, 8)}
      </Link>
    );
  }

  if (log.subject_consulting_request_id) {
    return (
      <Link
        href={`/admin/consulting-requests/${log.subject_consulting_request_id}`}
        prefetch={false}
        className="font-mono text-xs font-semibold text-indigo-600"
      >
        상담 {log.subject_consulting_request_id.slice(0, 8)}
      </Link>
    );
  }

  return <span className="text-slate-400">-</span>;
}

export function AccessLogsTable({ logs }: { logs: AccessLogView[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
          <tr>
            <th className="whitespace-nowrap px-4 py-3.5">일시</th>
            <th className="px-4 py-3.5">결과</th>
            <th className="px-4 py-3.5">계정</th>
            <th className="px-4 py-3.5">수행업무</th>
            <th className="px-4 py-3.5">대상</th>
            <th className="px-4 py-3.5">IP</th>
            <th className="px-4 py-3.5">브라우저</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const style = OUTCOME_STYLE[log.outcome] ?? OUTCOME_STYLE.granted;
            return (
              <tr key={log.id} className={`border-t border-slate-200 ${style.row}`}>
                <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-slate-600">
                  {log.occurredAtLabel}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}
                  >
                    {style.label}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  {log.operator_email ?? <span className="text-slate-400">비로그인</span>}
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-slate-700">
                  {log.method === "GET" ? log.path : `${log.method} ${log.path}`}
                </td>
                <td className="px-4 py-3.5">
                  <SubjectCell log={log} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-600">
                  {log.ip ?? "-"}
                </td>
                {/* The full string is attacker-controlled and up to 255
                    characters; show a readable head and keep the rest in
                    the tooltip rather than wrecking the row height. */}
                <td
                  className="max-w-[16rem] truncate px-4 py-3.5 text-xs text-slate-500"
                  title={log.user_agent ?? undefined}
                >
                  {log.user_agent ?? "-"}
                </td>
              </tr>
            );
          })}
          {logs.length === 0 && (
            <tr className="border-t border-slate-200">
              <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                조건에 맞는 기록이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
