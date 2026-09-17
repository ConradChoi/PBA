import { notFound } from "next/navigation";
import { getAssessmentById } from "@/lib/assessments/get-assessment";
import { RadarChart } from "@/components/diagnose/RadarChart";
import { ARCHITECTURE_LEVEL_COPY } from "@/lib/content/architecture-level-copy";
import { BOTTLENECK_COPY } from "@/lib/content/bottleneck-copy";
import { STRENGTH_COPY } from "@/lib/content/strength-copy";
import { ACTION_LIBRARY } from "@/lib/content/action-library";
import { buildSummaryParagraph } from "@/lib/content/summary";
import type { LayerId, LayerScore } from "@/lib/types/assessment";
import { LAYER_IDS } from "@/lib/types/assessment";

function rowToLayerScores(row: Record<string, unknown>): LayerScore[] {
  return LAYER_IDS.map((layerId) => ({
    layerId,
    raw: row[`score_${layerId}_raw`] as number,
    score100: row[`score_${layerId}_100`] as number,
  }));
}

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

  const layerScores = rowToLayerScores(assessment as unknown as Record<string, unknown>);
  const bottlenecks = [
    assessment.bottleneck_1,
    assessment.bottleneck_2,
    assessment.bottleneck_3,
  ] as LayerId[];
  const strengths = [assessment.strength_1, assessment.strength_2] as LayerId[];
  const level = assessment.architecture_level;
  const summary = buildSummaryParagraph(level, bottlenecks[0]);

  const phases: [string, LayerId][] = [
    ["1~30일", bottlenecks[0]],
    ["31~60일", bottlenecks[1]],
    ["61~90일", bottlenecks[2]],
  ];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          PBA 7-Layer Business Radar
        </p>
        <p className="text-sm text-slate-500">
          {assessment.name} · {new Date(assessment.created_at).toLocaleDateString("ko-KR")}
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">
          Architecture Score {assessment.total_raw} / 140
        </h1>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
          {level.replace("_", " ")}
        </span>
      </section>

      <section className="mx-auto w-full max-w-sm">
        <RadarChart layerScores={layerScores} />
      </section>

      <p className="text-sm leading-relaxed text-slate-600">{summary}</p>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Business Bottleneck Top 3</h2>
        {bottlenecks.map((layerId, i) => (
          <div key={layerId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold">
              {i + 1}. {layerId.toUpperCase()}
            </p>
            <p className="mt-1 text-xs text-slate-600">{BOTTLENECK_COPY[layerId]}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Strength Top 2</h2>
        {strengths.map((layerId, i) => (
          <div key={layerId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold">
              {i + 1}. {layerId.toUpperCase()}
            </p>
            <p className="mt-1 text-xs text-slate-600">{STRENGTH_COPY[layerId]}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">90-Day Architecture Priority</h2>
        {phases.map(([period, layerId]) => (
          <div key={period} className="flex items-start gap-3">
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
              {period}
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">{layerId.toUpperCase()}</p>
              <p className="text-sm font-medium text-slate-700">
                {ACTION_LIBRARY[layerId][0]}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <button className="rounded-full bg-slate-900 py-4 text-sm font-semibold text-white">
          내 사업 구조 상담하기
        </button>
        <button className="rounded-full border border-slate-200 py-4 text-sm font-semibold text-slate-700">
          결과 PDF 받기
        </button>
      </section>
    </main>
  );
}
