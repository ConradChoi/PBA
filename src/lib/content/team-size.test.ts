import { describe, expect, it } from "vitest";
import { formatTeamSize, TEAM_SIZE_BANDS } from "./team-size";

describe("formatTeamSize", () => {
  it("labels a band code", () => {
    expect(formatTeamSize("6_20")).toBe("6~20명");
  });

  it("shows legacy free text as it was entered", () => {
    expect(formatTeamSize("대표 포함 4명")).toBe("대표 포함 4명");
  });

  it("falls back to a dash when nothing was entered", () => {
    expect(formatTeamSize(null)).toBe("-");
  });

  it("offers six bands", () => {
    expect(TEAM_SIZE_BANDS).toHaveLength(6);
  });
});
