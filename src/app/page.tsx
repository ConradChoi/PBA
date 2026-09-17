export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        PBA 7-Layer Business Radar
      </p>
      <h1 className="text-3xl font-bold sm:text-4xl">
        사업이 막힐 때, 기능보다 구조부터 봅니다.
      </h1>
      <p className="text-lg text-slate-600">
        5분이면 현재 사업의 구조적 병목을 확인할 수 있습니다.
      </p>
      <a
        href="/diagnose"
        className="rounded-full bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-700"
      >
        무료 Business Radar 시작하기
      </a>
      <ul className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
        <li>28문항</li>
        <li>약 5분</li>
        <li>7개 구조 영역</li>
        <li>결과 즉시 확인</li>
      </ul>
    </main>
  );
}
