"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/consulting-requests", label: "상담 신청" },
  { href: "/admin/assessments", label: "전체 진단" },
  { href: "/admin/notices", label: "공지사항" },
];

// Both are a record of, or control over, other operators, so both pages
// redirect a staff account away. Keep this list in step with those checks —
// and with src/lib/operators/owner-only-paths.ts, which is what makes a staff
// account's attempt show up in the access log as 「권한없음」 rather than as an
// ordinary read.
const OWNER_NAV_ITEMS = [
  { href: "/admin/operators", label: "운영자 관리" },
  { href: "/admin/access-logs", label: "접속기록" },
];

export function AdminNav({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();
  const items = isOwner ? [...NAV_ITEMS, ...OWNER_NAV_ITEMS] : NAV_ITEMS;

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            // Admin links never prefetch: a prefetched page is an access
            // nobody made, and the access log cannot tell the two apart
            // (see src/lib/access-logs/build-access-log-entry.ts).
            prefetch={false}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
              active ? "bg-slate-800 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
