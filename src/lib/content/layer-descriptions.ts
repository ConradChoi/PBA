import type { LayerId } from "../types/assessment";

// Drafted by the marketer agent from each layer's 4 questions (2026-09-17).
export const LAYER_DESCRIPTIONS: Record<LayerId, string> = {
  value: "우리가 주는 가치와 고객이 원하는 가치가 같은지 점검합니다",
  customer: "우리 고객이 정확히 누구이고 왜 사는지 점검합니다",
  offer: "상품과 가격이 고객 여정에 맞게 짜여 있는지 점검합니다",
  experience: "고객이 우리를 만나 재구매하기까지의 여정을 점검합니다",
  process: "업무가 사람에게만 의존하지 않는 구조를 점검합니다",
  data: "데이터를 어떻게 쌓고 어떻게 쓰는지 점검합니다",
  scale: "다른 사람도 같은 품질을 낼 수 있는 구조인지 점검합니다",
};
