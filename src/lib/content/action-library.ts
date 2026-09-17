import type { LayerId } from "../types/assessment";

export const ACTION_LIBRARY: Record<LayerId, [string, string, string]> = {
  value: ["핵심 고객 문제 1문장 정의", "기존 대안 비교", "구매 이유 인터뷰"],
  customer: [
    "Primary/Secondary/Buyer/User 구분",
    "JTBD 정의",
    "구매 Trigger 정리",
  ],
  offer: ["Product Ladder 작성", "핵심 상품/옵션 정리", "반복매출 가능성 검토"],
  experience: ["Customer Journey Map", "전환/이탈 지점 정의", "핵심 CTA 정리"],
  process: [
    "AS-IS Process Map",
    "반복업무 식별",
    "HUMAN / AI-ASSIST / AUTO 구분",
  ],
  data: ["핵심 데이터 정의", "이벤트/행동 로그 정의", "AI Opportunity Map"],
  scale: [
    "표준 업무 정의",
    "대표 의존 업무 제거",
    "구독/라이선스/파트너 구조 검토",
  ],
};
