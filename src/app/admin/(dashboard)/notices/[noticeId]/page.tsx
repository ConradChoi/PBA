import Link from "next/link";
import { notFound } from "next/navigation";
import { getNoticeById } from "@/lib/notices/get-notices";
import { NoticeForm } from "@/components/admin/NoticeForm";
import { requireOperator } from "@/lib/operators/require-operator";

export default async function EditNoticePage({
  params,
}: {
  params: Promise<{ noticeId: string }>;
}) {
  const { noticeId } = await params;
  // Verify the operator before reading anything: a layout redirect alone
  // still lets this page's data reach the response body.
  await requireOperator();

  const notice = await getNoticeById(noticeId);

  if (!notice) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link prefetch={false} href="/admin/notices" className="text-sm text-slate-500">
          ← 공지사항 목록
        </Link>
        <h1 className="mt-2 text-2xl font-bold">공지 수정</h1>
        <p className="mt-1 text-xs text-slate-500">
          작성 {notice.created_by} · {new Date(notice.created_at).toLocaleString("ko-KR")} / 최종
          수정 {notice.updated_by} · {new Date(notice.updated_at).toLocaleString("ko-KR")}
        </p>
      </div>
      <NoticeForm notice={notice} />
    </div>
  );
}
