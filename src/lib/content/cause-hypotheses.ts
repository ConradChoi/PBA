import type { LayerId } from "../types/assessment";

// Drafted by Claude (2026-09-19); pending the CEO's review in
// docs/content/2026-09-19-result-content-draft.md.
//
// Admin-only consulting content. This must never reach a public page --
// ResultReport.test.tsx pins that invariant. The customer-facing public
// hypothesis lives in messages.result.hypotheses (src/i18n/messages/ko.ts)
// instead, since it's translatable UI copy.
export const CAUSE_HYPOTHESES: Record<LayerId, { internal: string }> = {
  value: {
    internal:
      "여러 고객군의 요구를 하나의 가치 제안에 담으려다 메시지가 흐려졌을 가능성. CUSTOMER 정의와 함께 확인.",
  },
  customer: {
    internal:
      "구매자와 사용자가 다른데 사용자만 보고 설계했을 가능성. B2B·교육·헬스케어에서 흔함. 실제 결제 결정자를 확인.",
  },
  offer: {
    internal:
      "가격을 원가나 경쟁사 기준으로 정해, 고객이 체감하는 가치와 연결되지 않았을 가능성. 가격 결정 근거를 확인.",
  },
  experience: {
    internal:
      "고객 응대가 특정 담당자 역량에 의존해 담당자마다 경험 품질이 달라질 가능성. 응대 기록과 담당자별 재구매율을 확인.",
  },
  process: {
    internal:
      "프로세스 정의 없이 도구를 먼저 도입해 업무가 도구마다 흩어졌을 가능성. 사용 중인 도구 목록과 업무 연결을 확인.",
  },
  data: {
    internal:
      "데이터는 쌓이지만 여러 도구에 흩어져 한곳에서 볼 수 없을 가능성. 데이터 위치와 담당자를 확인.",
  },
  scale: {
    internal:
      "반복 매출 없이 프로젝트성 매출에 의존해, 매출이 투입 인력에 비례할 가능성. 매출 구성을 확인.",
  },
};
