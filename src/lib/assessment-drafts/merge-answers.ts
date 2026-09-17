import type {
  DraftAnswers,
  LayerAnswers,
  LayerAnswerSet,
  LayerId,
} from "../types/assessment";
import { LAYER_IDS } from "../types/assessment";

export function mergeLayerAnswers(
  existing: DraftAnswers,
  layerId: LayerId,
  answers: LayerAnswerSet
): DraftAnswers {
  return { ...existing, [layerId]: answers };
}

export function countCompletedLayers(answers: DraftAnswers): number {
  return LAYER_IDS.filter((id) => answers[id] !== undefined).length;
}

export function isDraftComplete(answers: DraftAnswers): answers is LayerAnswers {
  return countCompletedLayers(answers) === LAYER_IDS.length;
}
