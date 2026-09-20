import Link from "next/link";
import { listNotices } from "@/lib/notices/get-notices";

export default async function AdminNoticesPage() {
  const notices = await listNotices();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">공지사항</h1>
          <p className="mt-1 text-sm text-slate-500">
            사용자 화면 푸터와 /notice 페이지에 노출됩니다.
          </p>
        </div>
        <Link
          href="/admin/notices/new"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          새 공지 작성
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3.5">제목</th>
              <th className="px-4 py-3.5">게시</th>
              <th className="px-4 py-3.5">중요</th>
              <th className="px-4 py-3.5">작성일</th>
              <th className="px-4 py-3.5">수정자</th>
              <th className="px-4 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {notices.map((notice) => (
              <tr key={notice.id} className="border-t border-slate-200">
                <td className="px-4 py-3.5 font-medium">{notice.title}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      notice.is_published
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {notice.is_published ? "게시중" : "숨김"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-600">
                  {notice.is_important ? `~ ${notice.important_until}` : "-"}
                </td>
                <td className="px-4 py-3.5">
                  {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{notice.updated_by}</td>
                <td className="px-4 py-3.5 text-right">
                  <Link
                    href={`/admin/notices/${notice.id}`}
                    className="font-semibold text-indigo-600"
                  >
                    수정 →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
