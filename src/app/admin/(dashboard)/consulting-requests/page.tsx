import Link from "next/link";
import { listConsultingRequests } from "@/lib/consulting/get-consulting-requests";
import { getAssessmentsByIds } from "@/lib/assessments/get-assessment";
import { formatLocaleLabel } from "@/lib/content/format-locale";

export default async function ConsultingRequestsPage() {
  const requests = await listConsultingRequests();
  const assessments = await getAssessmentsByIds(requests.map((r) => r.assessment_id));
  const assessmentById = new Map(assessments.map((a) => [a.id, a]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">상담 신청</h1>
        <p className="mt-1 text-sm text-slate-500">
          결과 페이지에서 접수된 상담 요청 목록입니다.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3.5">신청일</th>
              <th className="px-4 py-3.5">이름</th>
              <th className="px-4 py-3.5">이메일</th>
              <th className="px-4 py-3.5">메시지</th>
              <th className="px-4 py-3.5">진단 등급</th>
              <th className="px-4 py-3.5">언어</th>
              <th className="px-4 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const assessment = assessmentById.get(r.assessment_id);
              return (
                <tr key={r.id} className="border-t border-slate-200">
                  <td className="px-4 py-3.5">
                    {new Date(r.created_at).toLocaleDateString("ko-KR")}
                    {!r.read_at && (
                      <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                        NEW
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">{assessment?.name ?? "-"}</td>
                  <td className="px-4 py-3.5">{assessment?.email ?? "-"}</td>
                  <td className="max-w-xs truncate px-4 py-3.5">{r.message ?? "-"}</td>
                  <td className="px-4 py-3.5 font-semibold text-indigo-600">
                    {assessment?.architecture_level ?? "-"}
                  </td>
                  <td className="px-4 py-3.5">
                    {assessment ? formatLocaleLabel(assessment.locale) : "-"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/admin/consulting-requests/${r.id}`}
                      className="font-semibold text-indigo-600"
                    >
                      보기 →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
