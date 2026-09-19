import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 print:hidden">
      <div className="mx-auto flex max-w-3xl items-center px-4 py-3.5">
        <Link href="/" className="text-sm font-bold tracking-tight text-slate-900">
          PBA 7-Layer Business Radar
        </Link>
      </div>
    </header>
  );
}
