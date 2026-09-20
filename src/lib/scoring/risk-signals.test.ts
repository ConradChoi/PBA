import { describe, expect, it } from "vitest";
import { evaluateRiskSignals } from "./risk-signals";
import { RISK_SIGNALS } from "../content/risk-signals";
import { LAYER_IDS } from "../types/assessment";
import type { MaturityLevel } from "./maturity";
import type { LayerId } from "../types/assessment";

function levels(overrides: Partial<Record<LayerId, MaturityLevel>>) {
  return Object.fromEntries(
    LAYER_IDS.map((id) => [id, overrides[id] ?? 3])
  ) as Record<LayerId, MaturityLevel>;
}

describe("evaluateRiskSignals", () => {
  it("returns nothing when no rule matches", () => {
    expect(evaluateRiskSignals(levels({}))).toEqual([]);
  });

  it("returns the single matching rule", () => {
    const result = evaluateRiskSignals(levels({ value: 2, scale: 4 }));

    expect(result.map((r) => r.id)).toEqual(["scaling_without_structure"]);
  });

  it("returns at most two, in priority order", () => {
    // Three rules match: process 2 + scale 2 (priority 1, founder_bottleneck),
    // data 4 + process 2 (priority 3, automation_before_process), and
    // customer 2 + offer 4 (priority 4, offer_without_customer). The cap of
    // two discards the lowest-priority match (offer_without_customer).
    const result = evaluateRiskSignals(
      levels({ process: 2, scale: 2, data: 4, customer: 2, offer: 4 })
    );

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual([
      "founder_bottleneck",
      "automation_before_process",
    ]);
  });
});

describe("RISK_SIGNALS", () => {
  it("references valid layers and levels and has unique ids and priorities", () => {
    const ids = new Set(RISK_SIGNALS.map((r) => r.id));
    const priorities = new Set(RISK_SIGNALS.map((r) => r.priority));

    expect(ids.size).toBe(RISK_SIGNALS.length);
    expect(priorities.size).toBe(RISK_SIGNALS.length);
    for (const rule of RISK_SIGNALS) {
      expect(rule.when.length).toBeGreaterThan(0);
      for (const condition of rule.when) {
        expect(LAYER_IDS).toContain(condition.layer);
        expect(condition.level).toBeGreaterThanOrEqual(1);
        expect(condition.level).toBeLessThanOrEqual(5);
      }
    }
  });
});
