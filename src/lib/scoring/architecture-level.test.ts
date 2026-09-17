import { describe, expect, it } from "vitest";
import { classifyArchitectureLevel } from "./architecture-level";

describe("classifyArchitectureLevel", () => {
  it.each([
    [28, "IDEA_STAGE"],
    [39, "IDEA_STAGE"],
    [40, "FOUNDER_DEPENDENT"],
    [69, "FOUNDER_DEPENDENT"],
    [70, "STRUCTURE_NEEDED"],
    [94, "STRUCTURE_NEEDED"],
    [95, "GROWTH_READY"],
    [119, "GROWTH_READY"],
    [120, "SYSTEMIZED"],
    [140, "SYSTEMIZED"],
  ] as const)("classifies %i as %s (spec section 9 bands)", (totalRaw, expected) => {
    expect(classifyArchitectureLevel(totalRaw)).toBe(expected);
  });

  it("throws for totals outside the valid 28-140 range", () => {
    expect(() => classifyArchitectureLevel(27)).toThrow(RangeError);
    expect(() => classifyArchitectureLevel(141)).toThrow(RangeError);
  });
});
