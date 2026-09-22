import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function DraftNotFound() {
  const t = await getTranslations("common.notFound.draft");

  return (
    <main className="mx-auto flex w-full flex-1 max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-bold">{t("title")}</h1>
      <p className="text-sm text-slate-600">{t("description")}</p>
      <Link href="/diagnose" className="text-sm font-semibold text-indigo-600 underline">
        {t("cta")}
      </Link>
    </main>
  );
}
