import Link from "next/link";
import { NoticeForm } from "@/components/admin/NoticeForm";

export default function NewNoticePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link prefetch={false} href="/admin/notices" className="text-sm text-slate-500">
          ← 공지사항 목록
        </Link>
        <h1 className="mt-2 text-2xl font-bold">새 공지 작성</h1>
      </div>
      <NoticeForm />
    </div>
  );
}
