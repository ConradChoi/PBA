import { describe, expect, it } from "vitest";
import { subjectParticle } from "./korean-particle";
import { LAYERS } from "../scoring/layers.config";

describe("subjectParticle", () => {
  // Expected particle for every actual layer display name, keyed by the
  // name's final English letter per the rule documented in
  // korean-particle.ts (vowel letters and "y" take 가, anything else 이).
  const expected: Record<string, "이" | "가"> = {
    VALUE: "가", // ends "E"
    CUSTOMER: "이", // ends "R"
    OFFER: "이", // ends "R"
    EXPERIENCE: "가", // ends "E"
    PROCESS: "이", // ends "S"
    "DATA & INTELLIGENCE": "가", // ends "E"
    SCALE: "가", // ends "E"
  };

  it("covers every layer name in layers.config.ts", () => {
    expect(new Set(LAYERS.map((l) => l.name))).toEqual(new Set(Object.keys(expected)));
  });

  for (const layer of LAYERS) {
    it(`picks ${expected[layer.name]} for ${layer.name}`, () => {
      expect(subjectParticle(layer.name)).toBe(expected[layer.name]);
    });
  }
});
