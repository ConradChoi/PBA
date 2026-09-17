import type { LayerId } from "../types/assessment";

// VALUE/CUSTOMER/PROCESS are verbatim from the requirements spec section 11.
// OFFER/EXPERIENCE/DATA/SCALE were drafted by the marketer agent (2026-09-17)
// to match that same tone.
export const STRENGTH_COPY: Record<LayerId, string> = {
  value: "사업이 제공하려는 가치가 비교적 명확합니다.",
  customer: "핵심 고객과 구매 상황에 대한 이해가 좋은 편입니다.",
  offer: "핵심 상품과 가격, 반복매출로 이어지는 구조가 비교적 잘 짜여 있습니다.",
  experience: "고객이 유입되고 구매해 다시 찾아오는 여정이 비교적 잘 설계되어 있습니다.",
  process: "업무 흐름과 역할이 비교적 잘 정의되어 있습니다.",
  data: "고객 데이터를 기록하고 활용하는 체계가 비교적 잘 갖춰져 있습니다.",
  scale: "매출이 늘어도 업무 부담이 과도하게 늘지 않도록 구조가 비교적 잘 갖춰져 있습니다.",
};
