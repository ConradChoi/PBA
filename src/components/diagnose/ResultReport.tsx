import { getTranslations } from "next-intl/server";
import { RadarChart } from "@/components/diagnose/RadarChart";
import { CAUSE_HYPOTHESES } from "@/lib/content/cause-hypotheses";
import type { AssessmentRow } from "@/lib/assessments/get-assessment";
import type { LayerId, LayerScore } from "@/lib/types/assessment";
import { LAYER_IDS } from "@/lib/types/assessment";
import { maturityLevel, type MaturityLevel } from "@/lib/scoring/maturity";
import { evaluateRiskSignals } from "@/lib/scoring/risk-signals";
import { subjectParticle } from "@/lib/content/korean-particle";
import { formatDate } from "@/lib/content/format-date";
import { LAYERS } from "@/lib/scoring/layers.config";
import type { Locale } from "@/i18n/locales";

function rowToLayerScores(row: Record<string, unknown>): LayerScore[] {
  return LAYER_IDS.map((layerId) => ({
    layerId,
    raw: row[`score_${layerId}_raw`] as number,
    score100: row[`score_${layerId}_100`] as number,
  }));
}

// The result body shared by the public result page and the admin preview
// popup. Page-specific pieces (CTAs, GA4 tracking) stay with each caller.
export async function ResultReport({
  assessment,
  audience = "public",
  locale,
}: {
  assessment: AssessmentRow;
  // "admin" additionally shows the consulting-only hypotheses.
  audience?: "public" | "admin";
  // The admin preview forces "ko"; the public result page passes the
  // visitor's resolved locale.
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "result" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const layerScores = rowToLayerScores(assessment as unknown as Record<string, unknown>);
  const bottlenecks = [
    assessment.bottleneck_1,
    assessment.bottleneck_2,
    assessment.bottleneck_3,
  ] as LayerId[];
  const strengths = [assessment.strength_1, assessment.strength_2] as LayerId[];
  const level = assessment.architecture_level;
  const summary = `${t(`levelCopy.${level}`)} ${t(`bottleneck.${bottlenecks[0]}`)}`;

  const phases: [string, LayerId][] = [
    [t("periods.p1"), bottlenecks[0]],
    [t("periods.p2"), bottlenecks[1]],
    [t("periods.p3"), bottlenecks[2]],
  ];

  const levelByLayer = Object.fromEntries(
    layerScores.map((score) => [
      score.layerId,
      // Stored scores are 4-20 by construction, but nothing in the database
      // enforces it; clamp so one bad row degrades this section instead of
      // failing the whole page render. A non-finite raw (NaN/Infinity) would
      // pass straight through Math.min/Math.max, so guard it explicitly and
      // fall back to the lowest valid score.
      maturityLevel(
        Number.isFinite(score.raw) ? Math.min(20, Math.max(4, score.raw)) : 4
      ),
    ])
  ) as Record<LayerId, MaturityLevel>;
  const riskSignals = evaluateRiskSignals(levelByLayer);
  const layerNameById = new Map(LAYERS.map((layer) => [layer.id, layer.name]));
  const bottleneckLayerName = layerNameById.get(bottlenecks[0]) ?? "";
  // The Korean subject particle (이/가) is a Korean-only grammar rule, so it
  // never belongs inside the message string itself (that would force every
  // other locale's translation to route around it). Instead the message
  // takes a plain {layer} placeholder, and only for `ko` do we append the
  // particle to the value we hand it -- every other locale gets the bare
  // layer name.
  const hypothesisLayerArg =
    locale === "ko"
      ? `${bottleneckLayerName}${subjectParticle(bottleneckLayerName)}`
      : bottleneckLayerName;

  return (
    <>
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {tCommon("brand")}
        </p>
        <p className="text-sm text-slate-500">
          {assessment.name ?? t("anonymousLabel")} ·{" "}
          {/* The `locale` prop, not a fresh getLocale(): the admin preview
              forces "ko" and its date must stay Korean-formatted too. */}
          {formatDate(assessment.created_at, locale)}
        </p>
      </header>

      <section className="flex flex-col gap-3 break-inside-avoid">
        <h1 className="text-2xl font-bold">{t("scoreHeading", { score: assessment.total_raw })}</h1>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
          {level.replace("_", " ")}
        </span>
      </section>

      <section className="mx-auto w-full max-w-sm break-inside-avoid">
        <RadarChart layerScores={layerScores} />
      </section>

      <section className="flex flex-col gap-3 break-inside-avoid">
        <h2 className="text-lg font-bold">{t("maturityHeading")}</h2>
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
                    L{level} {t(`maturityLevels.${level}`)}
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
                  {t(`maturityAnchors.${layerId}.${level}`)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-sm leading-relaxed text-slate-600">{summary}</p>

      <section className="flex flex-col gap-3 break-inside-avoid">
        <h2 className="text-lg font-bold">{t("bottleneckHeading")}</h2>
        {bottlenecks.map((layerId, i) => (
          <div key={layerId} className="rounded-lg border border-slate-200 bg-slate-50 p-4 break-inside-avoid">
            <p className="text-sm font-semibold">
              {i + 1}. {layerId.toUpperCase()}
            </p>
            <p className="mt-1 text-xs text-slate-600">{t(`bottleneck.${layerId}`)}</p>
          </div>
        ))}
      </section>

      {riskSignals.length > 0 && (
        <section className="flex flex-col gap-3 break-inside-avoid">
          <h2 className="text-lg font-bold">{t("riskSignalsHeading")}</h2>
          {riskSignals.map((signal) => (
            <div
              key={signal.id}
              className="rounded-lg border border-amber-200 bg-amber-50 p-4 break-inside-avoid"
            >
              <p className="text-sm font-semibold text-amber-900">
                {t(`riskSignals.${signal.id}.title`)}
              </p>
              <p className="mt-1 text-xs text-amber-900/80">
                {t(`riskSignals.${signal.id}.message`)}
              </p>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-3 break-inside-avoid">
        <h2 className="text-lg font-bold">{t("hypothesisHeading")}</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">
            {t("hypothesisIntro", { layer: hypothesisLayerArg })}
          </p>
          <p className="mt-1.5 text-sm text-slate-800">
            {t(`hypotheses.${bottlenecks[0]}`)}
          </p>
          <p className="mt-3 text-xs text-slate-500">{t("hypothesisOutro")}</p>
        </div>
        {audience === "admin" && (
          <div className="flex flex-col gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            {/* Admin-only chrome, hardcoded rather than translated: the
                admin panel is always Korean (see project convention), and
                routing this through `t()` would ship the label's text into
                every public page's client message bundle for no benefit. */}
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
        <h2 className="text-lg font-bold">{t("strengthHeading")}</h2>
        {strengths.map((layerId, i) => (
          <div key={layerId} className="rounded-lg border border-slate-200 bg-slate-50 p-4 break-inside-avoid">
            <p className="text-sm font-semibold">
              {i + 1}. {layerId.toUpperCase()}
            </p>
            <p className="mt-1 text-xs text-slate-600">{t(`strength.${layerId}`)}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3 break-inside-avoid">
        <h2 className="text-lg font-bold">{t("actionsHeading")}</h2>
        {phases.map(([period, layerId]) => (
          <div key={period} className="flex items-start gap-3">
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
              {period}
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">{layerId.toUpperCase()}</p>
              <p className="text-sm font-medium text-slate-700">
                {(t.raw(`actions.${layerId}`) as [string, string, string])[0]}
              </p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
