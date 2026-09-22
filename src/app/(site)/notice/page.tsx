import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedNotices } from "@/lib/notices/get-notices";
import { noticeExcerpt } from "@/lib/notices/notice-view";

export const metadata: Metadata = {
  title: "공지사항 | PBA 7-Layer Business Radar",
};

export default async function NoticeListPage() {
  const notices = await listPublishedNotices();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold">공지사항</h1>

      {notices.length === 0 ? (
        <p className="text-sm text-slate-500">등록된 공지사항이 없습니다.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-200 border-y border-slate-200">
          {notices.map((notice) => (
            <li key={notice.id}>
              <Link href={`/notice/${notice.id}`} className="flex flex-col gap-1 py-4">
                <p className="text-base font-semibold text-slate-900">{notice.title}</p>
                <p className="line-clamp-2 text-sm text-slate-600">
                  {noticeExcerpt(notice.body_html)}
                </p>
                <p className="text-xs text-slate-400">
                  {notice.published_at
                    ? new Date(notice.published_at).toLocaleDateString("ko-KR")
                    : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
