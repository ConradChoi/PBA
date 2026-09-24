import { describe, expect, it } from "vitest";
import { formatAccessTime } from "./format-access-time";

describe("formatAccessTime", () => {
  // The server runs in UTC; the operator reads in KST. Without the pinned
  // zone the same row would read 09-23 in the build output and 09-24 on the
  // operator's screen.
  it("renders a UTC timestamp in KST", () => {
    const formatted = formatAccessTime("2026-09-23T16:23:45Z");

    expect(formatted).toContain("2026");
    expect(formatted).toContain("24");
    expect(formatted).toContain("01:23:45");
  });

  it("keeps seconds, so two requests in the same minute stay distinguishable", () => {
    expect(formatAccessTime("2026-09-23T16:23:05Z")).toContain("01:23:05");
  });
});
