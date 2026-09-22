import { describe, expect, it } from "vitest";
import { CAUSE_HYPOTHESES } from "./cause-hypotheses";
import { LAYER_IDS } from "../types/assessment";
import ko from "@/i18n/messages/ko";

describe("CAUSE_HYPOTHESES", () => {
  it("has an admin-only internal hypothesis for every layer", () => {
    for (const layerId of LAYER_IDS) {
      expect(CAUSE_HYPOTHESES[layerId].internal.length).toBeGreaterThan(10);
    }
  });
});

describe("messages.result.hypotheses", () => {
  it("has a public hypothesis for every layer", () => {
    for (const layerId of LAYER_IDS) {
      expect(ko.result.hypotheses[layerId].length).toBeGreaterThan(10);
    }
  });
});
