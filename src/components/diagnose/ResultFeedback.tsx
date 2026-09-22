"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { trackEvent } from "@/lib/analytics/ga4";
import {
  GROWTH_BAND_VALUES,
  REVENUE_BAND_VALUES,
  type GrowthBand,
  type RevenueBand,
} from "@/lib/assessments/outcome.schema";

const FIT_OPTIONS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

export function ResultFeedback({ assessmentId }: { assessmentId: string }) {
  const t = useTranslations("result.feedback");
  const revenueBandOptions = REVENUE_BAND_VALUES.map((value) => ({
    value,
    label: t(`revenueBands.${value}`),
  }));
  const growthBandOptions = GROWTH_BAND_VALUES.map((value) => ({
    value,
    label: t(`growthBands.${value}`),
  }));
  const [fit, setFit] = useState("");
  const [fitSaved, setFitSaved] = useState(false);
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [revenueBand, setRevenueBand] = useState<RevenueBand | "">("");
  const [growthBand, setGrowthBand] = useState<GrowthBand | "">("");
  const [outcomeSaved, setOutcomeSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveFit(value: string) {
    setFit(value);
    setError(null);

    const response = await fetch(`/api/assessments/${assessmentId}/feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resultFit: Number(value) }),
    });

    if (!response.ok) {
      setError(t("fitError"));
      return;
    }

    trackEvent("radar_result_feedback");
    setFitSaved(true);
  }

  async function saveOutcome() {
    setError(null);

    if (!revenueBand && !growthBand) {
      setError(t("selectAtLeastOne"));
      return;
    }

    const response = await fetch(`/api/assessments/${assessmentId}/outcome`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        revenueBand: revenueBand || null,
        growthBand: growthBand || null,
      }),
    });

    if (!response.ok) {
      setError(response.status === 409 ? t("alreadySubmitted") : t("saveError"));
      return;
    }

    trackEvent("radar_outcome_submit");
    setOutcomeSaved(true);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-slate-200 p-5 print:hidden">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-slate-900">{t("question")}</p>
        <ChipGroup
          name="resultFit"
          label={t("fitLabel")}
          options={FIT_OPTIONS}
          value={fit}
          onChange={saveFit}
          size="sm"
        />
        <p className="text-xs text-slate-500">{t("fitScale")}</p>
        {fitSaved && <p className="text-xs text-emerald-600">{t("fitThanks")}</p>}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
        {outcomeSaved ? (
          <p className="text-sm text-emerald-600">{t("outcomeThanks")}</p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setOutcomeOpen((open) => !open)}
              className="w-fit text-sm font-semibold text-indigo-600"
            >
              {t("outcomeToggle")} {outcomeOpen ? "▴" : "▾"}
            </button>

            {outcomeOpen && (
              <div className="flex flex-col gap-4">
                <p className="text-xs leading-relaxed text-slate-500">{t("outcomeNotice")}</p>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-slate-600">{t("revenueLabel")}</span>
                  <ChipGroup
                    name="revenueBand"
                    label={t("revenueLabel")}
                    options={revenueBandOptions}
                    value={revenueBand}
                    onChange={setRevenueBand}
                    size="sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-slate-600">{t("growthLabel")}</span>
                  <ChipGroup
                    name="growthBand"
                    label={t("growthLabel")}
                    options={growthBandOptions}
                    value={growthBand}
                    onChange={setGrowthBand}
                    size="sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={saveOutcome}
                  className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  {t("outcomeSubmit")}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </section>
  );
}
