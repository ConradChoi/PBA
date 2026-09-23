import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssessmentById } from "@/lib/assessments/get-assessment";
import { formatBusinessStage } from "@/lib/content/business-stage";
import { formatLocaleLabel } from "@/lib/content/format-locale";
import ko from "@/i18n/messages/ko";
import { RetentionCard } from "@/components/admin/RetentionCard";
import { ResultReport } from "@/components/diagnose/ResultReport";
import { ResultPreviewButton } from "@/components/admin/ResultPreviewButton";

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  const assessment = await getAssessmentById(assessmentId);

  if (!assessment) {
    notFound();
  }

  // team_size holds a known code from the wizard, or legacy free text typed
  // before the code list existed — show the label when we have one, else the
  // raw value as-is.
  const teamSizeLabel = assessment.team_size
    ? ((ko.basicInfo.teamSizes as Record<string, string>)[assessment.team_size] ??
      assessment.team_size)
    : "-";
  // revenue_band/growth_band hold a known code, or null if the visitor never
  // submitted the (optional) outcome form.
  const revenueBandLabel = assessment.revenue_band
    ? ((ko.result.feedback.revenueBands as Record<string, string>)[assessment.revenue_band] ??
      assessment.revenue_band)
    : "-";
  const growthBandLabel = assessment.growth_band
    ? ((ko.result.feedback.growthBands as Record<string, string>)[assessment.growth_band] ??
      assessment.growth_band)
    : "-";

  const fields: [string, string][] = [
    ["이름", assessment.name ?? "익명"],
    ["이메일", assessment.email ?? "-"],
    ["회사/브랜드명", assessment.company_name ?? "-"],
    ["역할", assessment.role ?? "-"],
    [
      "사업 단계",
      formatBusinessStage(
        ko.basicInfo.stages[assessment.business_stage],
        assessment.business_stage_other,
        assessment.business_stage
      ),
    ],
    ["업종", assessment.industry ?? "-"],
    ["팀 규모", teamSizeLabel],
    ["총점", `${assessment.total_raw} / 140`],
    ["Architecture Level", assessment.architecture_level],
    [
      "Bottleneck",
      `${assessment.bottleneck_1}, ${assessment.bottleneck_2}, ${assessment.bottleneck_3}`,
    ],
    ["Strength", `${assessment.strength_1}, ${assessment.strength_2}`],
    ["상담 신청 여부", assessment.consulting_requested ? "예" : "아니오"],
    ["언어", formatLocaleLabel(assessment.locale)],
    [
      "개인정보 동의",
      `${assessment.privacy_consent ? "동의" : "미동의"} (${assessment.privacy_notice_version})`,
    ],
    ["마케팅 동의", assessment.marketing_consent ? "동의" : "미동의"],
    ["결과 적합도", assessment.result_fit ? `${assessment.result_fit} / 5` : "-"],
    ["연 매출", revenueBandLabel],
    ["최근 12개월 성장", growthBandLabel],
    [
      "UTM",
      [assessment.utm_source, assessment.utm_medium, assessment.utm_campaign]
        .filter(Boolean)
        .join(" / ") || "-",
    ],
    ["진단일", new Date(assessment.created_at).toLocaleString("ko-KR")],
  ];

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/assessments" className="text-sm text-slate-500">
          ← 전체 진단 목록
        </Link>
        <h1 className="mt-2 text-2xl font-bold">
          {assessment.name ? `${assessment.name}님의 진단` : "익명 진단"}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-6 text-sm">
        {fields.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-0.5 font-medium text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <RetentionCard
        assessmentId={assessment.id}
        hasPersonalData={assessment.email !== null || assessment.name !== null}
        defaultPurgeAt={new Date(
          new Date(assessment.privacy_consent_at ?? assessment.created_at).getTime() +
            365 * 24 * 60 * 60 * 1000
        ).toISOString()}
        retainUntil={assessment.retain_until}
        retentionReason={assessment.retention_reason}
        retentionUpdatedBy={assessment.retention_updated_by}
        retentionUpdatedAt={assessment.retention_updated_at}
      />

      <ResultPreviewButton>
        <ResultReport assessment={assessment} audience="admin" locale="ko" />
      </ResultPreviewButton>
    </div>
  );
}
