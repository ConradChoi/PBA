import type { LayerId } from "../types/assessment";
import type { MaturityLevel } from "../scoring/maturity";

export type RiskSignalRule = {
  id: string;
  // Lower runs first; at most two signals are ever shown.
  priority: number;
  // Every condition must hold for the signal to fire.
  when: { layer: LayerId; op: "<=" | ">="; level: MaturityLevel }[];
  title: string;
  message: string;
};

// Drafted by Claude (2026-09-19); pending the CEO's review in
// docs/content/2026-09-19-result-content-draft.md.
export const RISK_SIGNALS: RiskSignalRule[] = [
  {
    id: "founder_bottleneck",
    priority: 1,
    when: [
      { layer: "process", op: "<=", level: 2 },
      { layer: "scale", op: "<=", level: 2 },
    ],
    title: "대표 의존 병목",
    message: "업무가 대표에게 묶여 있어, 성장이 대표의 시간에 막힐 가능성이 큽니다.",
  },
  {
    id: "scaling_without_structure",
    priority: 2,
    when: [
      { layer: "value", op: "<=", level: 2 },
      { layer: "scale", op: ">=", level: 4 },
    ],
    title: "구조 없는 확장",
    message:
      "가치 정의가 흐린 상태에서 규모를 키우고 있습니다. 확장할수록 고객 이탈과 가격 압박이 커질 수 있습니다.",
  },
  {
    id: "automation_before_process",
    priority: 3,
    when: [
      { layer: "data", op: ">=", level: 4 },
      { layer: "process", op: "<=", level: 2 },
    ],
    title: "정리 전 자동화",
    message:
      "데이터·AI 활용에 비해 업무 흐름이 정리되어 있지 않습니다. 정리되지 않은 프로세스를 자동화하면 비효율도 함께 자동화됩니다.",
  },
  {
    id: "offer_without_customer",
    priority: 4,
    when: [
      { layer: "customer", op: "<=", level: 2 },
      { layer: "offer", op: ">=", level: 4 },
    ],
    title: "고객 없는 상품 설계",
    message:
      "상품 구조는 갖춰졌지만 핵심 고객 정의가 약합니다. 상품이 고객이 아니라 공급자 관점에서 설계되었을 수 있습니다.",
  },
  {
    id: "invisible_churn",
    priority: 5,
    when: [
      { layer: "experience", op: "<=", level: 2 },
      { layer: "data", op: "<=", level: 2 },
    ],
    title: "보이지 않는 이탈",
    message: "고객이 어디서, 왜 떠나는지 보이지 않는 상태입니다. 개선이 감에 의존하게 됩니다.",
  },
];
