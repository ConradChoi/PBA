import type { LayerId } from "../types/assessment";
import type { MaturityLevel } from "./maturity";
import { RISK_SIGNALS, type RiskSignalRule } from "../content/risk-signals";

const MAX_SIGNALS = 2;

export function evaluateRiskSignals(
  levels: Record<LayerId, MaturityLevel>
): RiskSignalRule[] {
  return RISK_SIGNALS.filter((rule) =>
    rule.when.every(({ layer, op, level }) =>
      op === "<=" ? levels[layer] <= level : levels[layer] >= level
    )
  )
    .sort((a, b) => a.priority - b.priority)
    .slice(0, MAX_SIGNALS);
}
