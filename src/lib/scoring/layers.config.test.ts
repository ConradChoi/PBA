import { describe, expect, it } from "vitest";
import { LAYER_IDS } from "../types/assessment";
import { LAYERS } from "./layers.config";

describe("LAYERS", () => {
  it("has exactly the 7 layers defined in the spec, in spec order", () => {
    expect(LAYERS.map((l) => l.id)).toEqual(LAYER_IDS);
  });
});
