import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/site/LocaleSwitcher";

export async function SiteHeader() {
  const [t, locale] = await Promise.all([getTranslations("common"), getLocale()]);

  return (
    <header className="border-b border-slate-200 print:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="text-sm font-bold tracking-tight text-slate-900">
          {t("brand")}
        </Link>
        <div className="print:hidden">
          <LocaleSwitcher locale={locale} ariaLabel={t("languageLabel")} />
        </div>
      </div>
    </header>
  );
}
