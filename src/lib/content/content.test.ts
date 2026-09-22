import { describe, expect, it } from "vitest";
import { LAYER_IDS } from "../types/assessment";
import ko from "@/i18n/messages/ko";

const ARCHITECTURE_LEVELS = [
  "IDEA_STAGE",
  "FOUNDER_DEPENDENT",
  "STRUCTURE_NEEDED",
  "GROWTH_READY",
  "SYSTEMIZED",
] as const;

describe("messages.result.levelCopy", () => {
  it("has non-empty copy for all 5 levels", () => {
    for (const level of ARCHITECTURE_LEVELS) {
      expect(ko.result.levelCopy[level].length).toBeGreaterThan(0);
    }
  });
});

describe("messages.result.bottleneck", () => {
  it("has non-empty copy for all 7 layers", () => {
    for (const id of LAYER_IDS) {
      expect(ko.result.bottleneck[id].length).toBeGreaterThan(0);
    }
  });
});

describe("messages.result.actions", () => {
  it("has exactly 3 actions for all 7 layers", () => {
    for (const id of LAYER_IDS) {
      expect(ko.result.actions[id]).toHaveLength(3);
      ko.result.actions[id].forEach((action) => expect(action.length).toBeGreaterThan(0));
    }
  });
});

describe("messages.result.strength", () => {
  it("has non-empty copy for all 7 layers", () => {
    for (const id of LAYER_IDS) {
      expect(ko.result.strength[id].length).toBeGreaterThan(0);
    }
  });
});

describe("messages.result.maturityLevels", () => {
  it("has a non-empty name for all 5 levels", () => {
    for (const level of [1, 2, 3, 4, 5] as const) {
      expect(ko.result.maturityLevels[level].length).toBeGreaterThan(0);
    }
  });
});

describe("messages.result.maturityAnchors", () => {
  it("has a non-empty anchor for all 7 layers at all 5 levels", () => {
    for (const id of LAYER_IDS) {
      for (const level of [1, 2, 3, 4, 5] as const) {
        expect(ko.result.maturityAnchors[id][level].length).toBeGreaterThan(10);
      }
    }
  });
});

describe("wizard.questions", () => {
  it("has exactly 4 questions for all 7 layers", () => {
    for (const id of LAYER_IDS) {
      expect(ko.wizard.questions[id]).toHaveLength(4);
      ko.wizard.questions[id].forEach((q) => expect(q.length).toBeGreaterThan(0));
    }
  });
});

describe("wizard.layerDescriptions", () => {
  it("has non-empty copy for all 7 layers", () => {
    for (const id of LAYER_IDS) {
      expect(ko.wizard.layerDescriptions[id].length).toBeGreaterThan(0);
    }
  });
});
