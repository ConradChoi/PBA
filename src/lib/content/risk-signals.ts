import type { LayerId } from "../types/assessment";
import type { MaturityLevel } from "../scoring/maturity";

export type RiskSignalRule = {
  id: string;
  // Lower runs first; at most two signals are ever shown.
  priority: number;
  // Every condition must hold for the signal to fire.
  when: { layer: LayerId; op: "<=" | ">="; level: MaturityLevel }[];
};

// Data only: id, priority and trigger conditions. The displayed title and
// message live in messages.result.riskSignals.<id> (src/i18n/messages/ko.ts)
// since they're translatable UI copy; the copy itself was drafted by Claude
// (2026-09-19), pending the CEO's review in
// docs/content/2026-09-19-result-content-draft.md.
export const RISK_SIGNALS: RiskSignalRule[] = [
  {
    id: "founder_bottleneck",
    priority: 1,
    when: [
      { layer: "process", op: "<=", level: 2 },
      { layer: "scale", op: "<=", level: 2 },
    ],
  },
  {
    id: "scaling_without_structure",
    priority: 2,
    when: [
      { layer: "value", op: "<=", level: 2 },
      { layer: "scale", op: ">=", level: 4 },
    ],
  },
  {
    id: "automation_before_process",
    priority: 3,
    when: [
      { layer: "data", op: ">=", level: 4 },
      { layer: "process", op: "<=", level: 2 },
    ],
  },
  {
    id: "offer_without_customer",
    priority: 4,
    when: [
      { layer: "customer", op: "<=", level: 2 },
      { layer: "offer", op: ">=", level: 4 },
    ],
  },
  {
    id: "invisible_churn",
    priority: 5,
    when: [
      { layer: "experience", op: "<=", level: 2 },
      { layer: "data", op: "<=", level: 2 },
    ],
  },
];
