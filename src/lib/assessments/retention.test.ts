import { describe, expect, it } from "vitest";
import { retentionUntil } from "./retention";

const from = new Date("2026-09-20T00:00:00Z");

describe("retentionUntil", () => {
  it("adds days", () => {
    expect(retentionUntil(10, "days", from)).toBe("2026-09-30T00:00:00.000Z");
  });

  it("adds months", () => {
    expect(retentionUntil(6, "months", from)).toBe("2027-03-20T00:00:00.000Z");
  });

  it("adds years", () => {
    expect(retentionUntil(2, "years", from)).toBe("2028-09-20T00:00:00.000Z");
  });

  it("clamps a month-end that the target month doesn't have", () => {
    // 2026-08-31 + 6 months would overflow into March; stay in February.
    expect(retentionUntil(6, "months", new Date("2026-08-31T00:00:00Z"))).toBe(
      "2027-02-28T00:00:00.000Z"
    );
  });
});
