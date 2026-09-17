import { describe, expect, it } from "vitest";
import { LAYER_IDS } from "../types/assessment";
import { ARCHITECTURE_LEVEL_COPY } from "./architecture-level-copy";
import { BOTTLENECK_COPY } from "./bottleneck-copy";
import { ACTION_LIBRARY } from "./action-library";
import { QUESTIONS } from "./questions";

const ARCHITECTURE_LEVELS = [
  "IDEA_STAGE",
  "FOUNDER_DEPENDENT",
  "STRUCTURE_NEEDED",
  "GROWTH_READY",
  "SYSTEMIZED",
] as const;

describe("ARCHITECTURE_LEVEL_COPY", () => {
  it("has non-empty copy for all 5 levels", () => {
    for (const level of ARCHITECTURE_LEVELS) {
      expect(ARCHITECTURE_LEVEL_COPY[level].length).toBeGreaterThan(0);
    }
  });
});

describe("BOTTLENECK_COPY", () => {
  it("has non-empty copy for all 7 layers", () => {
    for (const id of LAYER_IDS) {
      expect(BOTTLENECK_COPY[id].length).toBeGreaterThan(0);
    }
  });
});

describe("ACTION_LIBRARY", () => {
  it("has exactly 3 actions for all 7 layers", () => {
    for (const id of LAYER_IDS) {
      expect(ACTION_LIBRARY[id]).toHaveLength(3);
      ACTION_LIBRARY[id].forEach((action) => expect(action.length).toBeGreaterThan(0));
    }
  });
});

describe("QUESTIONS", () => {
  it("has exactly 4 questions for all 7 layers", () => {
    for (const id of LAYER_IDS) {
      expect(QUESTIONS[id]).toHaveLength(4);
      QUESTIONS[id].forEach((q) => expect(q.length).toBeGreaterThan(0));
    }
  });
});
