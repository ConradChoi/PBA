import { describe, expect, it } from "vitest";
import type { LayerId, LayerScore } from "../types/assessment";
import { findBottlenecks, findStrengths } from "./bottleneck";

function score(layerId: LayerId, score100: number): LayerScore {
  return { layerId, raw: 4 + Math.round((score100 / 100) * 16), score100 };
}

describe("findBottlenecks", () => {
  it("spec section 26 Case 4: lowest 3 of PROCESS/DATA/SCALE are picked", () => {
    const layerScores: LayerScore[] = [
      score("value", 80),
      score("customer", 80),
      score("offer", 80),
      score("experience", 80),
      score("process", 10),
      score("data", 20),
      score("scale", 30),
    ];

    expect(findBottlenecks(layerScores)).toEqual(["process", "data", "scale"]);
  });

  it("breaks ties using the spec section 10 priority order", () => {
    const allTied = [
      score("value", 50),
      score("customer", 50),
      score("offer", 50),
      score("experience", 50),
      score("process", 50),
      score("data", 50),
      score("scale", 50),
    ];

    expect(findBottlenecks(allTied)).toEqual(["process", "customer", "value"]);
  });
});

describe("findStrengths", () => {
  it("picks the top 2 by score100", () => {
    const layerScores: LayerScore[] = [
      score("value", 90),
      score("customer", 40),
      score("offer", 85),
      score("experience", 30),
      score("process", 20),
      score("data", 10),
      score("scale", 5),
    ];

    expect(findStrengths(layerScores)).toEqual(["value", "offer"]);
  });

  it("breaks ties without ever overlapping the bottleneck tie-break winners", () => {
    const allTied = [
      score("value", 50),
      score("customer", 50),
      score("offer", 50),
      score("experience", 50),
      score("process", 50),
      score("data", 50),
      score("scale", 50),
    ];

    const bottlenecks = findBottlenecks(allTied);
    const strengths = findStrengths(allTied);

    expect(strengths).toEqual(["scale", "data"]);
    expect(strengths.some((id) => bottlenecks.includes(id))).toBe(false);
  });
});
