import Link from "next/link";

export default function NoticeNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-bold">공지를 찾을 수 없습니다</h1>
      <Link href="/notice" className="text-sm font-semibold text-indigo-600 underline">
        공지사항 목록으로
      </Link>
    </main>
  );
}
