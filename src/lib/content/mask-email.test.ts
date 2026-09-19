import { describe, expect, it } from "vitest";
import { maskEmail } from "./mask-email";

describe("maskEmail", () => {
  it("keeps the first two characters of the local part", () => {
    expect(maskEmail("verify@example.com")).toBe("ve****@example.com");
  });

  it("keeps only the first character of a short local part", () => {
    expect(maskEmail("ab@example.com")).toBe("a*@example.com");
    expect(maskEmail("a@example.com")).toBe("a*@example.com");
  });

  it("returns the input unchanged when it has no @", () => {
    expect(maskEmail("not-an-email")).toBe("not-an-email");
  });
});
