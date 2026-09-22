import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getAssessmentById } from "@/lib/assessments/get-assessment";
import { TrackResultView } from "@/components/diagnose/TrackResultView";
import { ConsultingCtaLink } from "@/components/diagnose/ConsultingCtaLink";
import { ResultReport } from "@/components/diagnose/ResultReport";
import { PrintResultButton } from "@/components/diagnose/PrintResultButton";
import { ResultFeedback } from "@/components/diagnose/ResultFeedback";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  const assessment = await getAssessmentById(assessmentId);

  if (!assessment) {
    notFound();
  }

  const locale = await getLocale();
  const t = await getTranslations("result");

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 print:max-w-none print:gap-6 print:p-0">
      <TrackResultView architectureLevel={assessment.architecture_level} />
      <ResultReport assessment={assessment} locale={locale} />

      <ResultFeedback assessmentId={assessmentId} />

      <section className="flex flex-col gap-3 print:hidden">
        <ConsultingCtaLink assessmentId={assessmentId} />
        <PrintResultButton />
        <Link
          href="/"
          className="py-2 text-center text-sm font-semibold text-slate-500 underline"
        >
          {t("backHome")}
        </Link>
      </section>

      <p className="hidden border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400 print:block">
        {t("printFooter")}
      </p>
    </main>
  );
}
