import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { outcomeSchema, resultFitSchema } from "./outcome.schema";

// Regression test for a real bundle leak: this module used to import the
// Korean `ko` messages object just to source a Zod `refine` message. Because
// `ResultFeedback.tsx` ("use client") imports other exports from this same
// module (REVENUE_BAND_VALUES, GROWTH_BAND_VALUES, the band types), webpack
// pulls the whole module -- including that static `ko` import and the ~9KB
// `ko.result` namespace it drags in -- into the public client chunk. No
// runtime test can observe webpack's tree-shaking, so this pins the fact
// that would make that leak impossible: the source text of this file must
// never import from the message files at all. See
// .superpowers/sdd/2026-09-22-i18n/final-review.md (I-2) for the bundle
// evidence that first caught this.
describe("outcome.schema module boundary", () => {
  it("does not import message files at runtime", () => {
    const source = readFileSync(fileURLToPath(new URL("./outcome.schema.ts", import.meta.url)), "utf8");

    expect(source).not.toMatch(/@\/i18n\/messages/);
  });
});

describe("outcomeSchema validation (unchanged behaviour)", () => {
  it("rejects a submission with neither band set", () => {
    const result = outcomeSchema.safeParse({ revenueBand: null, growthBand: null });

    expect(result.success).toBe(false);
  });

  it("accepts a submission with only revenueBand set", () => {
    const result = outcomeSchema.safeParse({ revenueBand: "1b_5b", growthBand: null });

    expect(result.success).toBe(true);
  });

  it("accepts a submission with only growthBand set", () => {
    const result = outcomeSchema.safeParse({ revenueBand: null, growthBand: "10_50" });

    expect(result.success).toBe(true);
  });

  it("rejects an unknown band code", () => {
    const result = outcomeSchema.safeParse({ revenueBand: "not-a-band", growthBand: null });

    expect(result.success).toBe(false);
  });
});

describe("resultFitSchema (unaffected sibling export)", () => {
  it("accepts an integer 1-5", () => {
    expect(resultFitSchema.safeParse({ resultFit: 3 }).success).toBe(true);
  });

  it("rejects out-of-range values", () => {
    expect(resultFitSchema.safeParse({ resultFit: 6 }).success).toBe(false);
  });
});
