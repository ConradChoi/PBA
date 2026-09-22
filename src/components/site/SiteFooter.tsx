import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { companyFor } from "@/lib/content/company";

export async function SiteFooter() {
  const locale = await getLocale();
  const company = companyFor(locale);
  const t = await getTranslations("common");

  return (
    <footer className="border-t border-slate-200 bg-slate-50 print:hidden">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-8 text-xs text-slate-500">
        <div className="flex gap-4">
          <Link href="/notice" className="text-slate-600">
            {t("notice")}
          </Link>
          <Link href="/privacy" className="font-bold text-slate-900">
            {t("privacy")}
          </Link>
        </div>
        <p>
          {company.name} | {company.ceoTitle} {company.ceo} | {company.businessNumberLabel}{" "}
          {company.businessNumber}
        </p>
        <p>
          {company.address} | {t("contact")}{" "}
          <a href={`mailto:${company.email}`} className="underline">
            {company.email}
          </a>
        </p>
        <p>{t("copyright")}</p>
      </div>
    </footer>
  );
}
