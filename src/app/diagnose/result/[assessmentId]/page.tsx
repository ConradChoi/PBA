import Link from "next/link";
import { notFound } from "next/navigation";
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

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 print:max-w-none print:gap-6 print:p-0">
      <TrackResultView architectureLevel={assessment.architecture_level} />
      <ResultReport assessment={assessment} />

      <ResultFeedback assessmentId={assessmentId} />

      <section className="flex flex-col gap-3 print:hidden">
        <ConsultingCtaLink assessmentId={assessmentId} />
        <PrintResultButton />
        <Link
          href="/"
          className="py-2 text-center text-sm font-semibold text-slate-500 underline"
        >
          홈으로 돌아가기
        </Link>
      </section>

      <p className="hidden border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400 print:block">
        PBA 7-Layer Business Radar · pba.ylia.io · 주식회사 일리아
      </p>
    </main>
  );
}
