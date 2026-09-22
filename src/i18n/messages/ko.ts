// Source of truth for every string on the public site. Its shape is the
// `Messages` type each other locale must satisfy, so a missing or misspelled
// key fails the build rather than showing a key on screen.
const ko = {
  common: {
    brand: "PBA 7-Layer Business Radar",
    notice: "공지사항",
    privacy: "개인정보처리방침",
    languageLabel: "언어",
    copyright: "© 2026 YLIA Co., Ltd. All rights reserved.",
    contact: "문의",
    noticeClose: "공지 닫기",
  },
  landing: {
    headline: "사업이 막힐 때, 기능보다 구조부터 봅니다.",
    subhead: "5분이면 현재 사업의 구조적 병목을 확인할 수 있습니다.",
    cta: "무료 Business Radar 시작하기",
    stats: {
      questionCount: "28문항",
      duration: "약 5분",
      layerCount: "7개 구조 영역",
      instantResult: "결과 즉시 확인",
    },
  },
  basicInfo: {
    title: "기본 정보를 알려주세요",
    businessStage: "사업 단계 *",
    businessStageOther: "사업 단계 직접 입력 *",
    businessStageOtherPlaceholder: "현재 사업 단계를 입력해주세요",
    industry: "업종 (선택)",
    teamSize: "팀 규모 (선택)",
    consentIntro:
      "동의하시면 결과 PDF와 상담 안내를 이메일로 받으실 수 있습니다. 동의하지 않으셔도 진단과 결과 확인은 그대로 이용하실 수 있습니다.",
    name: "이름 *",
    namePlaceholder: "홍길동",
    email: "이메일 *",
    emailPlaceholder: "you@example.com",
    companyName: "회사/브랜드명 (선택)",
    role: "역할 (선택)",
    marketingConsent: "마케팅 정보 수신에 동의합니다 (선택)",
    submit: "다음: 문항 시작하기",
    submitting: "시작하는 중...",
    error: "진단을 시작하지 못했습니다. 다시 시도해주세요.",
    stages: {
      idea: "아이디어",
      mvp_prep: "MVP 준비",
      building: "구축 중",
      operating: "운영 중",
      growth: "성장",
      realign: "재정비",
      other: "기타",
    },
    teamSizes: {
      solo: "1명",
      "2_5": "2~5명",
      "6_20": "6~20명",
      "21_50": "21~50명",
      "51_200": "51~200명",
      gt_200: "200명 이상",
    },
    consent: {
      checkboxRequired: "개인정보 수집·이용에 동의합니다 *",
      checkboxOptional: "개인정보 수집·이용에 동의합니다 (선택)",
      details: "자세히 보기",
      fullPolicy: "개인정보처리방침 전문 보기",
      purposeTitle: "1. 개인정보 수집 목적",
      itemsTitle: "2. 수집항목",
      retentionTitle: "3. 보유기간",
      refusalTitle: "4. 동의 거부 시 안내",
      summary:
        "목적: 결과 PDF 발송·상담 안내·진단 정확도 향상 / 필수: 이름·이메일 / 선택: 회사명·역할 / 보유: 수집일로부터 1년",
      purpose:
        "진단 결과 리포트(PDF)를 이메일로 보내드리고, 진단 결과에 기반한 상담(컨설팅) 안내 및 연락을 위해 개인정보를 수집·이용합니다. 또한 입력하신 진단 정보와 성과 구간은 진단 정확도 향상 및 통계 분석에 이용합니다.",
      itemsCollected:
        "필수항목: 이름, 이메일 주소\n선택항목: 회사/브랜드명, 역할\n선택항목(결과 화면에서 입력 시): 연 매출·최근 12개월 성장 구간",
      retentionPeriod: "수집일로부터 1년간 보관한 후 파기합니다.",
      refusalNotice:
        "귀하는 개인정보 수집·이용에 동의하지 않을 권리가 있으며, 동의하지 않으셔도 28문항 진단과 결과(레이더 차트·점수·병목 분석) 확인에는 제한이 없습니다. 다만 연락 수단이 없어 결과 PDF 이메일 발송은 이용하실 수 없으며, 상담은 상담 신청 시 동의 후 연락처를 남기시면 이용하실 수 있습니다.",
    },
  },
  wizard: {
    scaleLow: "전혀 정리되지 않음",
    scaleHigh: "명확하게 정의되고 데이터로 관리됨",
    next: "다음",
    finish: "결과 보기",
    layerDescriptions: {
      value: "우리가 주는 가치와 고객이 원하는 가치가 같은지 점검합니다",
      customer: "우리 고객이 정확히 누구이고 왜 사는지 점검합니다",
      offer: "상품과 가격이 고객 여정에 맞게 짜여 있는지 점검합니다",
      experience: "고객이 우리를 만나 재구매하기까지의 여정을 점검합니다",
      process: "업무가 사람에게만 의존하지 않는 구조를 점검합니다",
      data: "데이터를 어떻게 쌓고 어떻게 쓰는지 점검합니다",
      scale: "다른 사람도 같은 품질을 낼 수 있는 구조인지 점검합니다",
    },
    questions: {
      value: [
        "고객이 해결하고 싶은 핵심 문제가 한 문장으로 정의되어 있는가?",
        "기존 대안보다 우리 서비스를 선택해야 하는 이유가 명확한가?",
        "우리가 제공하는 가치와 고객이 실제로 원하는 가치가 일치하는가?",
        "고객이 비용을 지불해야 할 이유를 설명할 수 있는가?",
      ],
      customer: [
        "핵심 고객을 구체적으로 정의했는가?",
        "서비스 사용자와 실제 구매자가 다를 경우 각각 정의되어 있는가?",
        "고객이 구매를 결정하게 만드는 Trigger를 알고 있는가?",
        "고객별로 다른 요구와 니즈를 구분하고 있는가?",
      ],
      offer: [
        "핵심 상품 또는 서비스가 명확하게 정의되어 있는가?",
        "무료 → 입문 → 핵심 → 고가 상품으로 연결되는 구조가 있는가?",
        "가격의 기준과 고객이 체감하는 가치가 연결되어 있는가?",
        "일회성 매출 외 반복 매출 구조가 존재하는가?",
      ],
      experience: [
        "고객이 우리를 처음 발견하는 경로를 알고 있는가?",
        "관심 → 구매 → 사용 → 재구매 과정이 설계되어 있는가?",
        "고객이 이탈하는 주요 지점을 파악하고 있는가?",
        "고객 경험이 담당자의 역량에 지나치게 의존하지 않는가?",
      ],
      process: [
        "고객 요청부터 업무 완료까지 전체 프로세스를 설명할 수 있는가?",
        "반복적인 수작업이 무엇인지 알고 있는가?",
        "사람이 해야 할 일과 시스템이 해야 할 일이 분리되어 있는가?",
        "대표 또는 특정 직원이 빠져도 업무가 돌아가는가?",
      ],
      data: [
        "고객 행동과 서비스 이용 데이터가 기록되고 있는가?",
        "어떤 데이터를 왜 수집하는지 정의되어 있는가?",
        "데이터를 이용해 고객 경험이나 업무를 개선하고 있는가?",
        "AI 또는 자동화를 적용할 지점이 구체적으로 정의되어 있는가?",
      ],
      scale: [
        "매출이 증가해도 대표의 업무시간이 같은 비율로 증가하지 않는가?",
        "업무 표준과 운영 매뉴얼이 존재하는가?",
        "반복 매출 또는 구독·라이선스 구조가 존재하는가?",
        "다른 사람이 동일한 품질로 서비스를 제공할 수 있는가?",
      ],
    },
  },
  result: {},
  consult: {},
  privacy: {},
  metadata: {
    siteTitle: "PBA 7-Layer Business Radar",
    siteDescription: "5분이면 현재 사업의 구조적 병목을 확인할 수 있습니다.",
  },
} as const;

export type Messages = typeof ko;

export default ko;
