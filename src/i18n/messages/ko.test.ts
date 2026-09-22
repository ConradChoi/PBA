import { describe, expect, it } from "vitest";
import ko from "./ko";
import { CAUSE_HYPOTHESES } from "@/lib/content/cause-hypotheses";
import { LAYER_IDS } from "@/lib/types/assessment";

// Walks every string leaf in the messages tree, yielding [dotted path, value]
// pairs. `ko` mixes plain objects and arrays (e.g. wizard.questions), so both
// need walking; anything else (string) is a leaf.
function* stringLeaves(value: unknown, path: string): Generator<[string, string]> {
  if (typeof value === "string") {
    yield [path, value];
    return;
  }
  if (Array.isArray(value)) {
    for (const [i, item] of value.entries()) {
      yield* stringLeaves(item, `${path}[${i}]`);
    }
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      yield* stringLeaves(item, path ? `${path}.${key}` : key);
    }
  }
}

// Regression test for a real leak: `messages.result` ships to every public
// page's client bundle via NextIntlClientProvider (see SiteLayout), because
// that provider forwards the whole messages tree except `privacy`/`metadata`.
// An admin-only string (e.g. a "for internal use" label, or -- worse -- one
// of CAUSE_HYPOTHESES[*].internal, the paid consulting content) added to
// `ko.result` (or any other shipped namespace) would therefore reach every
// visitor's page source even if no public component ever renders it. This
// pins the invariant at the data level, independent of whether any
// particular component happens to render the leaked string.
describe("ko messages do not carry admin-only consulting content", () => {
  const internalHypotheses = LAYER_IDS.map((id) => CAUSE_HYPOTHESES[id].internal);

  it("has no message value equal to an internal (admin-only) hypothesis", () => {
    for (const [path, value] of stringLeaves(ko, "")) {
      expect(internalHypotheses, `messages.${path} equals an internal hypothesis`).not.toContain(
        value
      );
    }
  });

  it("has no message value mentioning the admin-only consulting label", () => {
    for (const [path, value] of stringLeaves(ko, "")) {
      expect(value, `messages.${path} contains "상담용"`).not.toContain("상담용");
    }
  });
});
