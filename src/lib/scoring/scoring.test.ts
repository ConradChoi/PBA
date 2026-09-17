import { describe, expect, it } from "vitest";
import type { LayerAnswers } from "../types/assessment";
import { scoreAllLayers, scoreLayer, totalRawScore } from "./scoring";

describe("scoreLayer", () => {
  it("computes raw and 0-100 score for the minimum (all 1s)", () => {
    expect(scoreLayer([1, 1, 1, 1])).toEqual({ raw: 4, score100: 0 });
  });

  it("computes raw and 0-100 score for the maximum (all 5s)", () => {
    expect(scoreLayer([5, 5, 5, 5])).toEqual({ raw: 20, score100: 100 });
  });

  it("computes raw and 0-100 score for the midpoint (all 3s)", () => {
    expect(scoreLayer([3, 3, 3, 3])).toEqual({ raw: 12, score100: 50 });
  });
});

function allLayers(answers: [number, number, number, number]): LayerAnswers {
  return {
    value: answers,
    customer: answers,
    offer: answers,
    experience: answers,
    process: answers,
    data: answers,
    scale: answers,
  };
}

describe("scoreAllLayers + totalRawScore", () => {
  it("spec section 26 Case 1: all answers 1 -> total 28, every layer 0/100", () => {
    const layerScores = scoreAllLayers(allLayers([1, 1, 1, 1]));
    expect(totalRawScore(layerScores)).toBe(28);
    expect(layerScores.every((l) => l.score100 === 0)).toBe(true);
  });

  it("spec section 26 Case 2: all answers 5 -> total 140, every layer 100/100", () => {
    const layerScores = scoreAllLayers(allLayers([5, 5, 5, 5]));
    expect(totalRawScore(layerScores)).toBe(140);
    expect(layerScores.every((l) => l.score100 === 100)).toBe(true);
  });

  it("spec section 26 Case 3: all answers 3 -> total 84, every layer 50/100", () => {
    const layerScores = scoreAllLayers(allLayers([3, 3, 3, 3]));
    expect(totalRawScore(layerScores)).toBe(84);
    expect(layerScores.every((l) => l.score100 === 50)).toBe(true);
  });
});
