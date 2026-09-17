import { describe, expect, it } from "vitest";
import { buildSummaryParagraph } from "./summary";
import { ARCHITECTURE_LEVEL_COPY } from "./architecture-level-copy";
import { BOTTLENECK_COPY } from "./bottleneck-copy";

describe("buildSummaryParagraph", () => {
  it("concatenates the level description and the lowest layer's bottleneck message", () => {
    const result = buildSummaryParagraph("STRUCTURE_NEEDED", "process");
    expect(result).toBe(
      `${ARCHITECTURE_LEVEL_COPY.STRUCTURE_NEEDED} ${BOTTLENECK_COPY.process}`
    );
  });
});
