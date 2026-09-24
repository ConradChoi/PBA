// 접속일시 for the access-log screen. The zone is pinned to Asia/Seoul rather
// than left to the renderer for two reasons: the server runs in UTC while the
// operator inspecting the log reads in KST, and this timestamp is evidence in
// a compliance record, so it must not mean different things depending on
// which machine produced the string. Formatting on the server also keeps the
// client table from hydrating a different value than it was sent.
export function formatAccessTime(value: string): string {
  return new Date(value).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
