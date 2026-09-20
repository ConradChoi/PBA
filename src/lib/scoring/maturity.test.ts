import { describe, expect, it } from "vitest";
import { maturityLevel } from "./maturity";

describe("maturityLevel", () => {
  it("maps each band of the layer raw score (4-20) to a level", () => {
    expect(maturityLevel(4)).toBe(1);
    expect(maturityLevel(5)).toBe(1);
    expect(maturityLevel(6)).toBe(2);
    expect(maturityLevel(9)).toBe(2);
    expect(maturityLevel(10)).toBe(3);
    expect(maturityLevel(13)).toBe(3);
    expect(maturityLevel(14)).toBe(4);
    expect(maturityLevel(17)).toBe(4);
    expect(maturityLevel(18)).toBe(5);
    expect(maturityLevel(20)).toBe(5);
  });

  it("rejects a raw score outside the 4-20 range", () => {
    expect(() => maturityLevel(3)).toThrow(RangeError);
    expect(() => maturityLevel(21)).toThrow(RangeError);
  });
});
