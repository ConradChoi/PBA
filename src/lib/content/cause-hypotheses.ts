import type { LayerId } from "../types/assessment";

// Drafted by Claude (2026-09-19); pending the CEO's review in
// docs/content/2026-09-19-result-content-draft.md.
export const CAUSE_HYPOTHESES: Record<
  LayerId,
  { public: string; internal: string }
> = {
  value: {
    public: "고객 인터뷰 없이 공급자 관점에서 가치를 정의했을 가능성이 있습니다.",
    internal:
      "여러 고객군의 요구를 하나의 가치 제안에 담으려다 메시지가 흐려졌을 가능성. CUSTOMER 정의와 함께 확인.",
  },
  customer: {
    public:
      "'누구나 고객'이라는 넓은 정의로 시작해, 핵심 고객을 좁히지 못했을 가능성이 있습니다.",
    internal:
      "구매자와 사용자가 다른데 사용자만 보고 설계했을 가능성. B2B·교육·헬스케어에서 흔함. 실제 결제 결정자를 확인.",
  },
  offer: {
    public:
      "고객 요청마다 맞춤으로 대응하다 상품이 표준화되지 않았을 가능성이 있습니다.",
    internal:
      "가격을 원가나 경쟁사 기준으로 정해, 고객이 체감하는 가치와 연결되지 않았을 가능성. 가격 결정 근거를 확인.",
  },
  experience: {
    public:
      "유입과 첫 구매에 집중하느라 구매 이후의 경험이 설계되지 않았을 가능성이 있습니다.",
    internal:
      "고객 응대가 특정 담당자 역량에 의존해 담당자마다 경험 품질이 달라질 가능성. 응대 기록과 담당자별 재구매율을 확인.",
  },
  process: {
    public:
      "대표가 대부분의 판단을 직접 하면서, 업무 흐름을 문서로 만들 기회가 없었을 가능성이 있습니다.",
    internal:
      "프로세스 정의 없이 도구를 먼저 도입해 업무가 도구마다 흩어졌을 가능성. 사용 중인 도구 목록과 업무 연결을 확인.",
  },
  data: {
    public:
      "데이터를 '나중에 볼 것'으로 미뤄, 무엇을 왜 기록할지 정하지 않았을 가능성이 있습니다.",
    internal:
      "데이터는 쌓이지만 여러 도구에 흩어져 한곳에서 볼 수 없을 가능성. 데이터 위치와 담당자를 확인.",
  },
  scale: {
    public:
      "'대표가 직접 해야 품질이 나온다'는 전제로 운영해, 표준화가 계속 미뤄졌을 가능성이 있습니다.",
    internal:
      "반복 매출 없이 프로젝트성 매출에 의존해, 매출이 투입 인력에 비례할 가능성. 매출 구성을 확인.",
  },
};
