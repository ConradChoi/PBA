import { notFound } from "next/navigation";
import { getAssessmentById } from "@/lib/assessments/get-assessment";
import { ConsultForm } from "@/components/diagnose/ConsultForm";

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

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          PBA 7-Layer Business Radar
        </p>
        <h1 className="text-2xl font-bold">상담 신청</h1>
        <p className="text-sm text-slate-500">
          {assessment.name}님의 진단 결과를 바탕으로 상담을 도와드리겠습니다.
        </p>
      </div>
      <ConsultForm assessmentId={assessmentId} />
    </main>
  );
}
