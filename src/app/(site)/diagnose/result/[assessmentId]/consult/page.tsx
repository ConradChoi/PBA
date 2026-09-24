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
  // 가격·형식 문구는 result.sessionOffer 하나만 두고 여기서도 그대로 읽는다.
  // 같은 문장을 consult에 복사해 두면 5개 언어 중 한 곳만 가격이 바뀌는
  // 사고가 나고, 그 사고의 비용은 "무료인 줄 알았다"는 신청자다.
  const tOffer = await getTranslations("result");

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
      <div className="flex flex-col gap-1 rounded-lg border border-slate-300 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("offerLabel")}
        </p>
        <p className="text-sm font-bold text-slate-900">
          {tOffer("sessionOffer.priceLine")}{" "}
          <span className="text-xs font-medium text-slate-500">
            {tOffer("sessionOffer.vatNote")}
          </span>
        </p>
        <p className="text-xs text-slate-600">{tOffer("sessionOffer.format")}</p>
      </div>
      <ConsultForm
        assessmentId={assessmentId}
        maskedEmail={assessment.email ? maskEmail(assessment.email) : null}
      />
    </main>
  );
}
