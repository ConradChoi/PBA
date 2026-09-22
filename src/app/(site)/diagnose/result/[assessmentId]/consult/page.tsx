import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAssessmentById } from "@/lib/assessments/get-assessment";
import { ConsultForm } from "@/components/diagnose/ConsultForm";
import { maskEmail } from "@/lib/content/mask-email";

export default async function ConsultPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  const assessment = await getAssessmentById(assessmentId);

  if (!assessment) {
    notFound();
  }

  const t = await getTranslations("consult");
  const tCommon = await getTranslations("common");

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <Link href={`/diagnose/result/${assessmentId}`} className="text-sm text-slate-500">
        {t("backToResult")}
      </Link>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {tCommon("brand")}
        </p>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-slate-500">
          {t("subtitle", {
            hasName: assessment.name ? "yes" : "other",
            name: assessment.name ?? "",
          })}
        </p>
      </div>
      <ConsultForm
        assessmentId={assessmentId}
        maskedEmail={assessment.email ? maskEmail(assessment.email) : null}
      />
    </main>
  );
}
