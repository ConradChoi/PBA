"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics/ga4";
import { LAYERS } from "@/lib/scoring/layers.config";
import { QUESTIONS } from "@/lib/content/questions";
import { LAYER_DESCRIPTIONS } from "@/lib/content/layer-descriptions";
import type { LayerAnswerSet } from "@/lib/types/assessment";

export function QuestionWizard({
  draftId,
  initialStep,
}: {
  draftId: string;
  initialStep: number;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null]);
  const [submitting, setSubmitting] = useState(false);

  const layer = LAYERS[stepIndex];
  const questions = QUESTIONS[layer.id];
  const allAnswered = answers.every((a) => a !== null);

  function selectAnswer(questionIndex: number, value: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  }

  async function handleNext() {
    if (!allAnswered || submitting) return;
    setSubmitting(true);

    const patchResponse = await fetch(`/api/assessment-drafts/${draftId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        layerId: layer.id,
        answers: answers as LayerAnswerSet,
      }),
    });

    if (!patchResponse.ok) {
      setSubmitting(false);
      return;
    }

    trackEvent("radar_layer_complete", { layer: layer.id });

    const isLastLayer = stepIndex === LAYERS.length - 1;
    if (!isLastLayer) {
      setStepIndex((i) => i + 1);
      setAnswers([null, null, null, null]);
      setSubmitting(false);
      return;
    }

    const completeResponse = await fetch(`/api/assessment-drafts/${draftId}/complete`, {
      method: "POST",
    });

    if (!completeResponse.ok) {
      setSubmitting(false);
      return;
    }

    const { assessmentId } = await completeResponse.json();
    trackEvent("radar_complete");
    router.push(`/diagnose/result/${assessmentId}`);
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-slate-500">
          {stepIndex + 1} / {LAYERS.length} · {layer.name}
        </p>
        <div className="h-1.5 w-full rounded-full bg-slate-100">
          <div
            className="h-1.5 rounded-full bg-slate-900"
            style={{ width: `${((stepIndex + 1) / LAYERS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold">{layer.name}</h1>
        <p className="text-sm text-slate-500">{LAYER_DESCRIPTIONS[layer.id]}</p>
      </div>

      <div className="flex flex-col gap-8">
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="flex flex-col gap-2.5">
            <p className="text-sm font-medium">
              Q{qIndex + 1}. {question}
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectAnswer(qIndex, value)}
                  className={`h-11 flex-1 rounded-lg border text-sm font-semibold ${
                    answers[qIndex] === value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>전혀 정리되지 않음</span>
              <span>명확하게 정의되고 데이터로 관리됨</span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!allAnswered || submitting}
        className="rounded-full bg-slate-900 py-4 text-sm font-semibold text-white disabled:opacity-40"
      >
        {stepIndex === LAYERS.length - 1 ? "결과 보기" : "다음"}
      </button>
    </main>
  );
}
