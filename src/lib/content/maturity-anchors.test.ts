import { describe, expect, it } from "vitest";
import { MATURITY_ANCHORS } from "./maturity-anchors";
import { LAYER_IDS } from "../types/assessment";

describe("MATURITY_ANCHORS", () => {
  it("has a non-empty anchor for all 7 layers at all 5 levels", () => {
    for (const layerId of LAYER_IDS) {
      for (const level of [1, 2, 3, 4, 5] as const) {
        expect(MATURITY_ANCHORS[layerId][level].length).toBeGreaterThan(10);
      }
    }
  });
});
