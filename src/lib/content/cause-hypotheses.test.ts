import { describe, expect, it } from "vitest";
import { CAUSE_HYPOTHESES } from "./cause-hypotheses";
import { LAYER_IDS } from "../types/assessment";

describe("CAUSE_HYPOTHESES", () => {
  it("has a public and an internal hypothesis for every layer", () => {
    for (const layerId of LAYER_IDS) {
      expect(CAUSE_HYPOTHESES[layerId].public.length).toBeGreaterThan(10);
      expect(CAUSE_HYPOTHESES[layerId].internal.length).toBeGreaterThan(10);
    }
  });
});
