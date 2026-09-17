import { describe, expect, it } from "vitest";
import type { DraftAnswers } from "../types/assessment";
import {
  countCompletedLayers,
  isDraftComplete,
  mergeLayerAnswers,
} from "./merge-answers";

describe("mergeLayerAnswers", () => {
  it("adds a new layer's answers without touching existing ones", () => {
    const existing: DraftAnswers = { value: [1, 2, 3, 4] };
    const result = mergeLayerAnswers(existing, "customer", [5, 5, 5, 5]);

    expect(result).toEqual({ value: [1, 2, 3, 4], customer: [5, 5, 5, 5] });
    expect(existing).toEqual({ value: [1, 2, 3, 4] }); // original untouched
  });

  it("overwrites a layer's answers if it's revisited", () => {
    const existing: DraftAnswers = { value: [1, 1, 1, 1] };
    const result = mergeLayerAnswers(existing, "value", [5, 5, 5, 5]);

    expect(result).toEqual({ value: [5, 5, 5, 5] });
  });
});

describe("countCompletedLayers", () => {
  it("counts 0 for an empty draft", () => {
    expect(countCompletedLayers({})).toBe(0);
  });

  it("counts each present layer once", () => {
    expect(
      countCompletedLayers({ value: [1, 1, 1, 1], customer: [2, 2, 2, 2] })
    ).toBe(2);
  });
});

describe("isDraftComplete", () => {
  it("is false when fewer than 7 layers are present", () => {
    expect(isDraftComplete({ value: [1, 1, 1, 1] })).toBe(false);
  });

  it("is true when all 7 layers are present", () => {
    const full: DraftAnswers = {
      value: [1, 1, 1, 1],
      customer: [1, 1, 1, 1],
      offer: [1, 1, 1, 1],
      experience: [1, 1, 1, 1],
      process: [1, 1, 1, 1],
      data: [1, 1, 1, 1],
      scale: [1, 1, 1, 1],
    };
    expect(isDraftComplete(full)).toBe(true);
  });
});
