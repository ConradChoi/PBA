import Link from "next/link";
import { COMPANY } from "@/lib/content/company";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 print:hidden">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-8 text-xs text-slate-500">
        <div className="flex gap-4">
          <Link href="/notice" className="text-slate-600">
            공지사항
          </Link>
          <Link href="/privacy" className="font-bold text-slate-900">
            개인정보처리방침
          </Link>
        </div>
        <p>
          {COMPANY.name} | 대표 {COMPANY.ceo} | 사업자등록번호 {COMPANY.businessNumber}
        </p>
        <p>
          {COMPANY.address} | 문의{" "}
          <a href={`mailto:${COMPANY.email}`} className="underline">
            {COMPANY.email}
          </a>
        </p>
        <p>© 2026 {COMPANY.nameEn} All rights reserved.</p>
      </div>
    </footer>
  );
}
