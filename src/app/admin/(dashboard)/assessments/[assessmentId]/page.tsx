import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssessmentById } from "@/lib/assessments/get-assessment";
import { formatBusinessStage } from "@/lib/content/business-stage";
import { formatTeamSize } from "@/lib/content/team-size";
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

  const fields: [string, string][] = [
    ["이름", assessment.name ?? "익명"],
    ["이메일", assessment.email ?? "-"],
    ["회사/브랜드명", assessment.company_name ?? "-"],
    ["역할", assessment.role ?? "-"],
    ["사업 단계", formatBusinessStage(assessment.business_stage, assessment.business_stage_other)],
    ["업종", assessment.industry ?? "-"],
    ["팀 규모", formatTeamSize(assessment.team_size)],
    ["총점", `${assessment.total_raw} / 140`],
    ["Architecture Level", assessment.architecture_level],
    [
      "Bottleneck",
      `${assessment.bottleneck_1}, ${assessment.bottleneck_2}, ${assessment.bottleneck_3}`,
    ],
    ["Strength", `${assessment.strength_1}, ${assessment.strength_2}`],
    ["상담 신청 여부", assessment.consulting_requested ? "예" : "아니오"],
    [
      "개인정보 동의",
      `${assessment.privacy_consent ? "동의" : "미동의"} (${assessment.privacy_notice_version})`,
    ],
    ["마케팅 동의", assessment.marketing_consent ? "동의" : "미동의"],
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

      <ResultPreviewButton>
        <ResultReport assessment={assessment} audience="admin" />
      </ResultPreviewButton>
    </div>
  );
}
