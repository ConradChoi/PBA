import type { LayerAnswers, LayerAnswerSet, LayerScore } from "../types/assessment";
import { LAYER_IDS } from "../types/assessment";

export function scoreLayer(answers: LayerAnswerSet): {
  raw: number;
  score100: number;
} {
  const raw = answers.reduce((sum, answer) => sum + answer, 0);
  const score100 = Math.round(((raw - 4) / 16) * 100);
  return { raw, score100 };
}

export function scoreAllLayers(answers: LayerAnswers): LayerScore[] {
  return LAYER_IDS.map((layerId) => {
    const { raw, score100 } = scoreLayer(answers[layerId]);
    return { layerId, raw, score100 };
  });
}

export function totalRawScore(layerScores: LayerScore[]): number {
  return layerScores.reduce((sum, layerScore) => sum + layerScore.raw, 0);
}
