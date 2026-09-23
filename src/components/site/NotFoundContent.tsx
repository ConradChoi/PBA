import Link from "next/link";
import { getTranslations } from "next-intl/server";

// Shared body for the app-wide 404. Used by two different files for two
// different reasons:
// - src/app/(site)/not-found.tsx: catches a `notFound()` call thrown by a
//   page inside the (site) group that has no more specific not-found.tsx of
//   its own (the draft/result/notice routes each already have one).
// - src/app/global-not-found.tsx: catches a URL that matches no route at
//   all. Placing not-found.tsx inside (site) alone does NOT cover this case
//   -- verified against a built `next start`: an unmatched top-level path
//   never enters the (site) route tree, so it falls straight to Next's
//   built-in unbranded default unless `experimental.globalNotFound` and an
//   app-root `global-not-found.tsx` are both present (see next.config.ts).
export async function NotFoundContent() {
  const t = await getTranslations("common.notFound.global");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-bold">{t("title")}</h1>
      <p className="text-sm text-slate-600">{t("description")}</p>
      <Link href="/" className="text-sm font-semibold text-indigo-600 underline">
        {t("cta")}
      </Link>
    </main>
  );
}
