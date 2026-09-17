import type { ArchitectureLevel } from "../types/assessment";

export const ARCHITECTURE_LEVEL_COPY: Record<ArchitectureLevel, string> = {
  SYSTEMIZED:
    "사업 구조가 상당히 체계화되어 있습니다. 다음 과제는 데이터, AI, 자동화, 확장 효율을 높이는 것입니다.",
  GROWTH_READY:
    "기본 구조는 갖춰져 있으나 특정 Layer가 성장의 병목이 될 가능성이 있습니다.",
  STRUCTURE_NEEDED:
    "서비스는 존재하지만 고객·상품·프로세스·데이터가 충분히 연결되지 않은 상태입니다.",
  FOUNDER_DEPENDENT:
    "사업이 대표자 또는 특정 인력의 경험과 판단에 크게 의존하고 있습니다.",
  IDEA_STAGE:
    "개발과 마케팅보다 Value · Customer · Offer 정의가 먼저 필요한 단계입니다.",
};
