import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssessmentById } from "@/lib/assessments/get-assessment";
import { TrackResultView } from "@/components/diagnose/TrackResultView";
import { ConsultingCtaLink } from "@/components/diagnose/ConsultingCtaLink";
import { ResultReport } from "@/components/diagnose/ResultReport";

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

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <TrackResultView architectureLevel={assessment.architecture_level} />
      <ResultReport assessment={assessment} />

      <section className="flex flex-col gap-3">
        <ConsultingCtaLink assessmentId={assessmentId} />
        <button className="rounded-full border border-slate-200 py-4 text-sm font-semibold text-slate-700">
          결과 PDF 받기
        </button>
        <Link
          href="/"
          className="py-2 text-center text-sm font-semibold text-slate-500 underline"
        >
          홈으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
