import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { companyFor } from "@/lib/content/company";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return { title: `${t("privacyTitle")} | ${t("siteTitle")}` };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 font-semibold text-slate-600">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-200 align-top">
              {row.map((cell, j) => (
                <td key={j} className="whitespace-pre-line px-3 py-2.5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function PrivacyPolicyPage() {
  // The company block (name, CEO, contact) always follows the visitor's
  // resolved locale; the policy text itself is translated via `messages.privacy`.
  const locale = await getLocale();
  const company = companyFor(locale);
  const t = await getTranslations("privacy");

  const responsibleLabels = t.raw("section10.table.rowLabels") as [string, string, string];
  const responsibleValues = [`${company.ceo} (${company.ceoTitle})`, company.email, company.phone];
  const section10Rows = responsibleLabels.map((label, i) => [label, responsibleValues[i]]);

  const translationNotice = t("translationNotice");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          {t("intro", { company: company.name })}
        </p>
        <p className="text-xs text-slate-500">
          {t("effectiveDateLabel", { date: t("effectiveDate") })}
        </p>
      </div>

      {translationNotice ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {translationNotice}
        </p>
      ) : null}

      <Section title={t("section1.title")}>
        <p>{t("section1.intro")}</p>
        <ul className="list-disc pl-5">
          {(t.raw("section1.items") as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title={t("section2.title")}>
        <p>{t("section2.intro")}</p>
        <Table
          head={t.raw("section2.table.head") as string[]}
          rows={t.raw("section2.table.rows") as string[][]}
        />
        <p>{t("section2.note")}</p>
      </Section>

      <Section title={t("section3.title")}>
        <ul className="list-disc pl-5">
          {(t.raw("section3.items") as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title={t("section4.title")}>
        <p>{t("section4.body")}</p>
      </Section>

      <Section title={t("section5.title")}>
        <p>{t("section5.intro")}</p>
        <Table
          head={t.raw("section5.table.head") as string[]}
          rows={t.raw("section5.table.rows") as string[][]}
        />
        <p>{t("section5.note")}</p>
      </Section>

      <Section title={t("section6.title")}>
        {(t.raw("section6.paragraphs") as string[]).map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </Section>

      <Section title={t("section7.title")}>
        <p>{t("section7.intro")}</p>
        <Table
          head={t.raw("section7.table.head") as string[]}
          rows={t.raw("section7.table.rows") as string[][]}
        />
      </Section>

      <Section title={t("section8.title")}>
        <p>{t("section8.body")}</p>
      </Section>

      <Section title={t("section9.title")}>
        <ul className="list-disc pl-5">
          {(t.raw("section9.items") as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title={t("section10.title")}>
        <Table head={t.raw("section10.table.head") as string[]} rows={section10Rows} />
      </Section>

      <Section title={t("section11.title")}>
        <p>{t("section11.intro")}</p>
        <ul className="list-disc pl-5">
          {(t.raw("section11.items") as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title={t("section12.title")}>
        <p>{t("section12.body", { date: t("effectiveDate") })}</p>
      </Section>
    </main>
  );
}
