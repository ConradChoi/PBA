import { RadarChart } from "@/components/diagnose/RadarChart";
import { BOTTLENECK_COPY } from "@/lib/content/bottleneck-copy";
import { STRENGTH_COPY } from "@/lib/content/strength-copy";
import { ACTION_LIBRARY } from "@/lib/content/action-library";
import { buildSummaryParagraph } from "@/lib/content/summary";
import type { AssessmentRow } from "@/lib/assessments/get-assessment";
import type { LayerId, LayerScore } from "@/lib/types/assessment";
import { LAYER_IDS } from "@/lib/types/assessment";
import { maturityLevel, type MaturityLevel } from "@/lib/scoring/maturity";
import { evaluateRiskSignals } from "@/lib/scoring/risk-signals";
import { MATURITY_LEVELS } from "@/lib/content/maturity-levels";
import { MATURITY_ANCHORS } from "@/lib/content/maturity-anchors";
import { CAUSE_HYPOTHESES } from "@/lib/content/cause-hypotheses";
import { LAYERS } from "@/lib/scoring/layers.config";

function rowToLayerScores(row: Record<string, unknown>): LayerScore[] {
  return LAYER_IDS.map((layerId) => ({
    layerId,
    raw: row[`score_${layerId}_raw`] as number,
    score100: row[`score_${layerId}_100`] as number,
  }));
}

// The result body shared by the public result page and the admin preview
// popup. Page-specific pieces (CTAs, GA4 tracking) stay with each caller.
export function ResultReport({
  assessment,
  audience = "public",
}: {
  assessment: AssessmentRow;
  // "admin" additionally shows the consulting-only hypotheses.
  audience?: "public" | "admin";
}) {
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

  const levelByLayer = Object.fromEntries(
    layerScores.map((score) => [
      score.layerId,
      // Stored scores are 4-20 by construction, but nothing in the database
      // enforces it; clamp so one bad row degrades this section instead of
      // failing the whole page render.
      maturityLevel(Math.min(20, Math.max(4, score.raw))),
    ])
  ) as Record<LayerId, MaturityLevel>;
  const riskSignals = evaluateRiskSignals(levelByLayer);
  const layerNameById = new Map(LAYERS.map((layer) => [layer.id, layer.name]));

  return (
    <>
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          PBA 7-Layer Business Radar
        </p>
        <p className="text-sm text-slate-500">
          {assessment.name ?? "익명 진단"} · {new Date(assessment.created_at).toLocaleDateString("ko-KR")}
        </p>
      </header>

      <section className="flex flex-col gap-3 break-inside-avoid">
        <h1 className="text-2xl font-bold">
          Architecture Score {assessment.total_raw} / 140
        </h1>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
          {level.replace("_", " ")}
        </span>
      </section>

      <section className="mx-auto w-full max-w-sm break-inside-avoid">
        <RadarChart layerScores={layerScores} />
      </section>

      <section className="flex flex-col gap-3 break-inside-avoid">
        <h2 className="text-lg font-bold">레이어별 성숙도</h2>
        <div className="flex flex-col gap-2.5">
          {LAYER_IDS.map((layerId) => {
            const level = levelByLayer[layerId];
            return (
              <div
                key={layerId}
                className="flex flex-col gap-1 rounded-lg border border-slate-200 p-3 break-inside-avoid"
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{layerNameById.get(layerId)}</p>
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    L{level} {MATURITY_LEVELS[level]}
                  </span>
                  <span className="ml-auto flex gap-0.5" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <span
                        key={step}
                        className={`h-1.5 w-5 rounded-full ${
                          step <= level ? "bg-slate-900" : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {MATURITY_ANCHORS[layerId][level]}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-sm leading-relaxed text-slate-600">{summary}</p>

      <section className="flex flex-col gap-3 break-inside-avoid">
        <h2 className="text-lg font-bold">Business Bottleneck Top 3</h2>
        {bottlenecks.map((layerId, i) => (
          <div key={layerId} className="rounded-lg border border-slate-200 bg-slate-50 p-4 break-inside-avoid">
            <p className="text-sm font-semibold">
              {i + 1}. {layerId.toUpperCase()}
            </p>
            <p className="mt-1 text-xs text-slate-600">{BOTTLENECK_COPY[layerId]}</p>
          </div>
        ))}
      </section>

      {riskSignals.length > 0 && (
        <section className="flex flex-col gap-3 break-inside-avoid">
          <h2 className="text-lg font-bold">위험 신호</h2>
          {riskSignals.map((signal) => (
            <div
              key={signal.id}
              className="rounded-lg border border-amber-200 bg-amber-50 p-4 break-inside-avoid"
            >
              <p className="text-sm font-semibold text-amber-900">{signal.title}</p>
              <p className="mt-1 text-xs text-amber-900/80">{signal.message}</p>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-3 break-inside-avoid">
        <h2 className="text-lg font-bold">가능성 높은 원인 가설</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">
            {layerNameById.get(bottlenecks[0])}가 낮은 원인으로 가장 흔한 경우는 다음과 같습니다.
          </p>
          <p className="mt-1.5 text-sm text-slate-800">
            {CAUSE_HYPOTHESES[bottlenecks[0]].public}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            위 가설이 실제 원인인지, 상담에서 프로세스와 데이터를 함께 확인해 드립니다.
          </p>
        </div>
        {audience === "admin" && (
          <div className="flex flex-col gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-xs font-semibold text-indigo-900">
              상담용 가설 (고객 화면에는 보이지 않습니다)
            </p>
            {bottlenecks.map((layerId) => (
              <div key={layerId}>
                <p className="text-xs font-semibold text-indigo-900">
                  {layerNameById.get(layerId)}
                </p>
                <p className="text-xs text-indigo-900/80">
                  {CAUSE_HYPOTHESES[layerId].internal}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 break-inside-avoid">
        <h2 className="text-lg font-bold">Strength Top 2</h2>
        {strengths.map((layerId, i) => (
          <div key={layerId} className="rounded-lg border border-slate-200 bg-slate-50 p-4 break-inside-avoid">
            <p className="text-sm font-semibold">
              {i + 1}. {layerId.toUpperCase()}
            </p>
            <p className="mt-1 text-xs text-slate-600">{STRENGTH_COPY[layerId]}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3 break-inside-avoid">
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
    </>
  );
}
