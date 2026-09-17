import type { LayerId } from "../types/assessment";

// VALUE/CUSTOMER/PROCESS are verbatim from the requirements spec section 11.
// The other 4 layers have no example copy in the spec -- placeholders, per
// design spec section D (do not invent copy here).
export const STRENGTH_COPY: Record<LayerId, string> = {
  value: "사업이 제공하려는 가치가 비교적 명확합니다.",
  customer: "핵심 고객과 구매 상황에 대한 이해가 좋은 편입니다.",
  offer: "[카피 필요: OFFER 강점 메시지]",
  experience: "[카피 필요: EXPERIENCE 강점 메시지]",
  process: "업무 흐름과 역할이 비교적 잘 정의되어 있습니다.",
  data: "[카피 필요: DATA & INTELLIGENCE 강점 메시지]",
  scale: "[카피 필요: SCALE 강점 메시지]",
};
