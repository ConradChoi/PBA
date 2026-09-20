import Link from "next/link";

export default function NoticeNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <h1 className="text-lg font-bold">공지를 찾을 수 없습니다</h1>
      <Link href="/admin/notices" className="text-sm font-semibold text-indigo-600 underline">
        목록으로 돌아가기
      </Link>
    </div>
  );
}
