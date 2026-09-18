import Link from "next/link";
import { listAssessments } from "@/lib/assessments/get-assessment";
import { formatBusinessStage } from "@/lib/content/business-stage";

export default async function AssessmentsPage() {
  const assessments = await listAssessments();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">전체 진단</h1>
        <p className="mt-1 text-sm text-slate-500">지금까지 완료된 모든 진단 결과입니다.</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3.5">진단일</th>
              <th className="px-4 py-3.5">이름</th>
              <th className="px-4 py-3.5">이메일</th>
              <th className="px-4 py-3.5">사업단계</th>
              <th className="px-4 py-3.5">진단 등급</th>
              <th className="px-4 py-3.5">점수</th>
              <th className="px-4 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr key={a.id} className="border-t border-slate-200">
                <td className="px-4 py-3.5">
                  {new Date(a.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-3.5">{a.name}</td>
                <td className="px-4 py-3.5">{a.email}</td>
                <td className="px-4 py-3.5">
                  {formatBusinessStage(a.business_stage, a.business_stage_other)}
                </td>
                <td className="px-4 py-3.5 font-semibold text-indigo-600">
                  {a.architecture_level}
                </td>
                <td className="px-4 py-3.5">{a.total_raw} / 140</td>
                <td className="px-4 py-3.5 text-right">
                  <Link href={`/admin/assessments/${a.id}`} className="font-semibold text-indigo-600">
                    보기 →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
