"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/consulting-requests", label: "상담 신청" },
  { href: "/admin/assessments", label: "전체 진단" },
  { href: "/admin/notices", label: "공지사항" },
];

export function AdminNav({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();
  const items = isOwner
    ? [...NAV_ITEMS, { href: "/admin/operators", label: "운영자 관리" }]
    : NAV_ITEMS;

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
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
