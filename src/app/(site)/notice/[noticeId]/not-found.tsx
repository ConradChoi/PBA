import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NoticeNotFound() {
  const t = await getTranslations("common.notFound.notice");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-bold">{t("title")}</h1>
      <Link href="/notice" className="text-sm font-semibold text-indigo-600 underline">
        {t("cta")}
      </Link>
    </main>
  );
}
