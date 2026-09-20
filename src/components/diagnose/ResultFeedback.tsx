"use client";

import { useState } from "react";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { trackEvent } from "@/lib/analytics/ga4";
import {
  GROWTH_BANDS,
  REVENUE_BANDS,
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
      setError("의견을 저장하지 못했습니다.");
      return;
    }

    trackEvent("radar_result_feedback");
    setFitSaved(true);
  }

  async function saveOutcome() {
    setError(null);

    if (!revenueBand && !growthBand) {
      setError("한 가지 이상 선택해주세요.");
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
      setError(
        response.status === 409
          ? "이미 제출되었습니다."
          : "저장하지 못했습니다. 다시 시도해주세요."
      );
      return;
    }

    trackEvent("radar_outcome_submit");
    setOutcomeSaved(true);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-slate-200 p-5 print:hidden">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-slate-900">
          이 진단 결과가 실제 상황과 맞나요?
        </p>
        <ChipGroup
          name="resultFit"
          label="결과 적합도"
          options={FIT_OPTIONS}
          value={fit}
          onChange={saveFit}
          size="sm"
        />
        <p className="text-xs text-slate-500">1 전혀 다르다 · 5 매우 정확하다</p>
        {fitSaved && (
          <p className="text-xs text-emerald-600">
            의견 감사합니다. 다음 진단을 개선하는 데 쓰입니다.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
        {outcomeSaved ? (
          <p className="text-sm text-emerald-600">알려주셔서 감사합니다.</p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setOutcomeOpen((open) => !open)}
              className="w-fit text-sm font-semibold text-indigo-600"
            >
              더 정확한 분석을 위해 알려주세요 (선택) {outcomeOpen ? "▴" : "▾"}
            </button>

            {outcomeOpen && (
              <div className="flex flex-col gap-4">
                <p className="text-xs leading-relaxed text-slate-500">
                  선택 입력이며 입력하지 않아도 불이익은 없습니다. 진단 정확도 향상과 통계에
                  쓰이며, 개인정보에 동의하신 경우 이름·이메일과 함께 보관되다가 1년 후 식별
                  정보가 삭제됩니다.
                </p>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-slate-600">연 매출</span>
                  <ChipGroup
                    name="revenueBand"
                    label="연 매출"
                    options={[...REVENUE_BANDS]}
                    value={revenueBand}
                    onChange={setRevenueBand}
                    size="sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-slate-600">
                    최근 12개월 매출 변화
                  </span>
                  <ChipGroup
                    name="growthBand"
                    label="최근 12개월 매출 변화"
                    options={[...GROWTH_BANDS]}
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
                  안내를 확인했으며 제출합니다
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
