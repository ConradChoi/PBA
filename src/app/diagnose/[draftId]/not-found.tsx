import Link from "next/link";

export default function DraftNotFound() {
  return (
    <main className="mx-auto flex w-full flex-1 max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-bold">진단을 찾을 수 없습니다</h1>
      <p className="text-sm text-slate-600">
        링크가 잘못되었거나 이미 완료된 진단일 수 있습니다.
      </p>
      <Link href="/diagnose" className="text-sm font-semibold text-indigo-600 underline">
        새로 시작하기
      </Link>
    </main>
  );
}
