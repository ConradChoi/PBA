import { describe, expect, it } from "vitest";
import { TEAM_SIZE_VALUES } from "./team-size";
import ko from "@/i18n/messages/ko";

describe("TEAM_SIZE_VALUES", () => {
  it("offers six bands", () => {
    expect(TEAM_SIZE_VALUES).toHaveLength(6);
  });

  it("has a label in the ko messages for every code", () => {
    for (const band of TEAM_SIZE_VALUES) {
      expect(ko.basicInfo.teamSizes[band].length).toBeGreaterThan(0);
    }
  });
});
