import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getConsultingRequestById,
  markConsultingRequestRead,
} from "@/lib/consulting/get-consulting-requests";
import { getAssessmentById } from "@/lib/assessments/get-assessment";
import { formatBusinessStage } from "@/lib/content/business-stage";
import { formatLocaleLabel } from "@/lib/content/format-locale";
import ko from "@/i18n/messages/ko";
import { requireOperator } from "@/lib/operators/require-operator";

export default async function ConsultingRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  // Verify the operator before reading anything: a layout redirect alone
  // still lets this page's data reach the response body.
  await requireOperator();

  const request = await getConsultingRequestById(requestId);

  if (!request) {
    notFound();
  }

  if (!request.read_at) {
    await markConsultingRequestRead(requestId);
  }

  const assessment = await getAssessmentById(request.assessment_id);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/consulting-requests" className="text-sm text-slate-500">
          ← 상담 신청 목록
        </Link>
        <h1 className="mt-2 text-2xl font-bold">상담 신청 상세</h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date(request.created_at).toLocaleString("ko-KR")} 접수
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-6">
        <div>
          <p className="text-xs font-semibold text-slate-500">연락할 이메일</p>
          <p className="mt-1 text-sm text-slate-900">{assessment?.email ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">전달하고 싶은 말</p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-900">
            {request.message ?? "-"}
          </p>
        </div>
      </div>

      {assessment && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs font-semibold text-slate-500">연결된 진단</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-500">이름</p>
              <p className="font-medium">{assessment.name ?? "익명"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">이메일</p>
              <p className="font-medium">{assessment.email ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">사업 단계</p>
              <p className="font-medium">
                {formatBusinessStage(
                  ko.basicInfo.stages[assessment.business_stage],
                  assessment.business_stage_other,
                  assessment.business_stage
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">점수</p>
              <p className="font-medium">{assessment.total_raw} / 140</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">언어</p>
              <p className="font-medium">{formatLocaleLabel(assessment.locale)}</p>
            </div>
          </div>
          <Link
            href={`/admin/assessments/${assessment.id}`}
            className="w-fit text-sm font-semibold text-indigo-600"
          >
            전체 진단 결과 보기 →
          </Link>
        </div>
      )}
    </div>
  );
}
