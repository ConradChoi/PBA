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
    noticeEmpty: "등록된 공지사항이 없습니다.",
    noticeBackToList: "← 공지사항 목록",
    // The result and consult not-found pages share identical copy; the
    // draft one (mid-diagnosis) reads differently. The notice one has no
    // description line, only a title and a back-to-list link.
    notFound: {
      draft: {
        title: "진단을 찾을 수 없습니다",
        description: "링크가 잘못되었거나 이미 완료된 진단일 수 있습니다.",
        cta: "새로 시작하기",
      },
      result: {
        title: "결과를 찾을 수 없습니다",
        description: "링크가 잘못되었거나 만료되었을 수 있습니다.",
        cta: "새로 진단 시작하기",
      },
      notice: {
        title: "공지를 찾을 수 없습니다",
        cta: "공지사항 목록으로",
      },
      // The app-wide 404 (no matching route at all), rendered by
      // (site)/not-found.tsx so it still gets the site chrome, `lang` and
      // analytics instead of Next's bare framework default.
      global: {
        title: "페이지를 찾을 수 없습니다",
        description: "요청하신 페이지가 존재하지 않거나 주소가 변경되었을 수 있습니다.",
        cta: "홈으로 돌아가기",
      },
    },
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
      "51_200": "51~199명",
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
  result: {
    anonymousLabel: "익명 진단",
    scoreHeading: "Architecture Score {score} / 140",
    maturityHeading: "레이어별 성숙도",
    bottleneckHeading: "Business Bottleneck Top 3",
    riskSignalsHeading: "위험 신호",
    hypothesisHeading: "가능성 높은 원인 가설",
    // {layer} arrives pre-formatted: the caller appends the Korean subject
    // particle (이/가) itself for `ko` and passes the bare layer name for
    // every other locale, since that grammar rule doesn't apply to them.
    hypothesisIntro: "{layer} 낮은 원인으로 가장 흔한 경우는 다음과 같습니다.",
    hypothesisOutro:
      "위 가설이 실제 원인인지, 상담에서 프로세스와 데이터를 함께 확인해 드립니다.",
    strengthHeading: "Strength Top 2",
    actionsHeading: "90-Day Architecture Priority",
    periods: {
      p1: "1~30일",
      p2: "31~60일",
      p3: "61~90일",
    },
    consultingCta: "원인 가설 검증 상담받기",
    printButton: "결과 PDF 저장 · 인쇄",
    backHome: "홈으로 돌아가기",
    printFooter: "PBA 7-Layer Business Radar · pba.ylia.io · 주식회사 일리아",
    levelCopy: {
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
    },
    bottleneck: {
      value:
        "고객 문제와 구매 이유가 충분히 선명하지 않습니다. 기능 추가보다 가치 제안을 다시 정의하는 것이 우선입니다.",
      customer:
        "누구를 위한 서비스인지 범위가 넓거나 구매자와 사용자가 분리되어 있지 않을 가능성이 있습니다.",
      offer: "상품 구조와 가격, 반복매출 구조가 충분히 연결되어 있지 않습니다.",
      experience:
        "고객 유입부터 재사용까지의 여정 중 이탈 지점을 관리할 필요가 있습니다.",
      process:
        "업무가 사람의 기억과 수작업에 의존하고 있습니다. 프로세스 정의와 역할 분리가 우선입니다.",
      data: "서비스에서 발생하는 데이터가 의사결정과 AI/자동화에 충분히 활용되지 않고 있습니다.",
      scale:
        "매출이 늘수록 대표나 팀의 업무시간도 비례해 증가할 가능성이 있습니다.",
    },
    strength: {
      value: "사업이 제공하려는 가치가 비교적 명확합니다.",
      customer: "핵심 고객과 구매 상황에 대한 이해가 좋은 편입니다.",
      offer: "핵심 상품과 가격, 반복매출로 이어지는 구조가 비교적 잘 짜여 있습니다.",
      experience: "고객이 유입되고 구매해 다시 찾아오는 여정이 비교적 잘 설계되어 있습니다.",
      process: "업무 흐름과 역할이 비교적 잘 정의되어 있습니다.",
      data: "고객 데이터를 기록하고 활용하는 체계가 비교적 잘 갖춰져 있습니다.",
      scale: "매출이 늘어도 업무 부담이 과도하게 늘지 않도록 구조가 비교적 잘 갖춰져 있습니다.",
    },
    actions: {
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
    },
    maturityLevels: {
      1: "미정의",
      2: "인식",
      3: "정리",
      4: "운영",
      5: "체계화",
    },
    maturityAnchors: {
      value: {
        1: "고객이 해결하려는 문제와 우리가 주는 가치가 아직 정리되지 않은 상태입니다.",
        2: "해결하려는 문제는 떠올릴 수 있지만, 한 문장으로 정의하거나 기존 대안과 비교해 설명하지는 못하는 상태입니다.",
        3: "핵심 문제와 차별점은 정리되어 있지만, 실제 고객이 원하는 가치와 일치하는지는 확인되지 않았습니다.",
        4: "정리된 가치 제안이 영업·마케팅에 실제로 쓰이고, 고객이 비용을 지불하는 이유를 설명할 수 있습니다.",
        5: "가치 제안이 고객 인터뷰와 구매·이탈 데이터로 확인되고 주기적으로 갱신됩니다.",
      },
      customer: {
        1: "누가 우리 고객인지 구체적으로 정의되어 있지 않습니다.",
        2: "대략적인 고객층은 있지만, 사용자와 구매자, 고객별 니즈를 구분하지 않습니다.",
        3: "핵심 고객과 구매자·사용자는 정의되어 있지만, 구매를 결정하게 만드는 계기는 추정 수준입니다.",
        4: "고객 정의와 구매 계기가 마케팅·영업 대상을 정하는 데 실제로 쓰이고 있습니다.",
        5: "고객군별 전환·유지 데이터로 고객 정의를 확인하고 갱신합니다.",
      },
      offer: {
        1: "무엇을 얼마에 파는지가 고객이나 상황마다 달라지는 상태입니다.",
        2: "핵심 상품은 있지만, 가격 기준과 다음 상품으로 이어지는 구조가 없습니다.",
        3: "핵심 상품과 가격 기준은 정리되어 있지만, 입문→핵심→고가로 이어지는 구조와 반복 매출은 아직 설계 단계입니다.",
        4: "상품 사다리와 가격 체계가 실제 판매에 적용되고, 반복 매출이 일부 발생합니다.",
        5: "상품별 전환율·객단가·재구매 데이터로 상품 구성과 가격을 조정합니다.",
      },
      experience: {
        1: "고객이 어떻게 우리를 알게 되고 어디서 떠나는지 파악되지 않았습니다.",
        2: "주요 유입 경로는 짐작하지만, 구매 이후의 여정과 이탈 지점은 관리하지 않습니다.",
        3: "관심부터 재구매까지의 여정은 그려져 있지만, 경험의 질이 담당자에 따라 달라집니다.",
        4: "설계된 고객 여정이 실제로 운영되고, 주요 이탈 지점을 파악해 대응합니다.",
        5: "여정 단계별 전환·이탈 데이터를 추적하며 경험을 계속 개선합니다.",
      },
      process: {
        1: "업무가 정해진 흐름 없이 그때그때 사람의 판단으로 처리됩니다.",
        2: "업무 흐름은 머릿속에 있지만 문서로 정리되지 않았고, 반복 수작업이 많습니다.",
        3: "주요 프로세스는 정리되어 있지만, 사람과 시스템의 역할은 일부만 나뉘어 있습니다.",
        4: "정의된 프로세스대로 업무가 돌아가며, 대표나 특정 직원이 빠져도 대부분 처리됩니다.",
        5: "프로세스 성과를 측정하고, 반복 업무를 자동화하며 계속 개선합니다.",
      },
      data: {
        1: "고객 행동이나 서비스 이용 데이터가 거의 기록되지 않습니다.",
        2: "일부 데이터는 쌓이지만, 무엇을 왜 수집하는지 정의되어 있지 않습니다.",
        3: "수집할 데이터와 목적은 정의되어 있지만, 의사결정에는 가끔만 쓰입니다.",
        4: "데이터를 근거로 고객 경험이나 업무를 실제로 개선하고 있습니다.",
        5: "데이터가 의사결정의 기본이며, AI·자동화 적용 지점이 구체적으로 운영됩니다.",
      },
      scale: {
        1: "매출이 늘면 대표의 업무시간도 그만큼 늘어나는 구조입니다.",
        2: "확장이 필요하다고 느끼지만, 업무 표준이나 매뉴얼이 없습니다.",
        3: "일부 업무는 표준화되어 있지만, 다른 사람이 같은 품질을 내기는 아직 어렵습니다.",
        4: "표준과 매뉴얼로 다른 사람도 같은 품질을 내며, 반복 매출 구조가 작동합니다.",
        5: "매출이 늘어도 운영 부담이 비례해 늘지 않고, 구독·라이선스·파트너 구조로 확장합니다.",
      },
    },
    riskSignals: {
      founder_bottleneck: {
        title: "대표 의존 병목",
        message: "업무가 대표에게 묶여 있어, 성장이 대표의 시간에 막힐 가능성이 큽니다.",
      },
      scaling_without_structure: {
        title: "구조 없는 확장",
        message:
          "가치 정의가 흐린 상태에서 규모를 키우고 있습니다. 확장할수록 고객 이탈과 가격 압박이 커질 수 있습니다.",
      },
      automation_before_process: {
        title: "정리 전 자동화",
        message:
          "데이터·AI 활용에 비해 업무 흐름이 정리되어 있지 않습니다. 정리되지 않은 프로세스를 자동화하면 비효율도 함께 자동화됩니다.",
      },
      offer_without_customer: {
        title: "고객 없는 상품 설계",
        message:
          "상품 구조는 갖춰졌지만 핵심 고객 정의가 약합니다. 상품이 고객이 아니라 공급자 관점에서 설계되었을 수 있습니다.",
      },
      invisible_churn: {
        title: "보이지 않는 이탈",
        message: "고객이 어디서, 왜 떠나는지 보이지 않는 상태입니다. 개선이 감에 의존하게 됩니다.",
      },
    },
    // Public-facing hypotheses only; the admin-only `internal` counterpart
    // stays Korean-only in src/lib/content/cause-hypotheses.ts and must
    // never be duplicated here (see ResultReport.test.tsx's privacy test).
    hypotheses: {
      value: "고객 인터뷰 없이 공급자 관점에서 가치를 정의했을 가능성이 있습니다.",
      customer:
        "'누구나 고객'이라는 넓은 정의로 시작해, 핵심 고객을 좁히지 못했을 가능성이 있습니다.",
      offer:
        "고객 요청마다 맞춤으로 대응하다 상품이 표준화되지 않았을 가능성이 있습니다.",
      experience:
        "유입과 첫 구매에 집중하느라 구매 이후의 경험이 설계되지 않았을 가능성이 있습니다.",
      process:
        "대표가 대부분의 판단을 직접 하면서, 업무 흐름을 문서로 만들 기회가 없었을 가능성이 있습니다.",
      data: "데이터를 '나중에 볼 것'으로 미뤄, 무엇을 왜 기록할지 정하지 않았을 가능성이 있습니다.",
      scale:
        "'대표가 직접 해야 품질이 나온다'는 전제로 운영해, 표준화가 계속 미뤄졌을 가능성이 있습니다.",
    },
    feedback: {
      question: "이 진단 결과가 실제 상황과 맞나요?",
      fitLabel: "결과 적합도",
      fitScale: "1 전혀 다르다 · 5 매우 정확하다",
      fitThanks: "의견 감사합니다. 다음 진단을 개선하는 데 쓰입니다.",
      fitError: "의견을 저장하지 못했습니다.",
      outcomeToggle: "더 정확한 분석을 위해 알려주세요 (선택)",
      outcomeThanks: "알려주셔서 감사합니다.",
      outcomeNotice:
        "선택 입력이며 입력하지 않아도 불이익은 없습니다. 진단 정확도 향상과 통계에 쓰이며, 개인정보에 동의하신 경우 이름·이메일과 함께 보관되다가 1년 후 식별 정보가 삭제됩니다.",
      revenueLabel: "연 매출",
      growthLabel: "최근 12개월 매출 변화",
      outcomeSubmit: "안내를 확인했으며 제출합니다",
      selectAtLeastOne: "한 가지 이상 선택해주세요.",
      alreadySubmitted: "이미 제출되었습니다.",
      saveError: "저장하지 못했습니다. 다시 시도해주세요.",
      // Codes/order are the stored values (src/lib/assessments/outcome.schema.ts);
      // only the labels live here.
      revenueBands: {
        pre_revenue: "매출 전",
        lt_100m: "1억 미만",
        "100m_1b": "1~10억",
        "1b_5b": "10~50억",
        "5b_10b": "50~100억",
        gte_10b: "100억 이상",
      },
      growthBands: {
        decline: "감소",
        flat: "정체(±10%)",
        "10_50": "10~50% 성장",
        "50_100": "50~100% 성장",
        gte_100: "2배 이상",
        lt_1y: "1년 미만 사업",
      },
    },
  },
  consult: {
    backToResult: "← 진단 결과로 돌아가기",
    title: "상담 신청",
    // hasName mirrors whether assessment.name is set: "yes" keeps the
    // Korean honorific phrasing ("{name}님의 진단"), "other" falls back to
    // the bare "진단" used for an anonymous diagnosis.
    subtitle:
      "{hasName, select, yes {{name}님의 진단} other {진단}} 결과를 바탕으로 상담을 도와드리겠습니다.",
    anonymous: {
      name: "이름 *",
      namePlaceholder: "홍길동",
      email: "연락받을 이메일 *",
      emailPlaceholder: "you@example.com",
    },
    namedEmail: {
      label: "연락받을 이메일",
      notice: "진단을 시작할 때 입력하신 이메일로 연락드립니다.",
    },
    message: "전달하고 싶은 말 (선택)",
    submit: "상담 신청하기",
    submitting: "접수하는 중...",
    error: "신청을 접수하지 못했습니다. 다시 시도해주세요.",
    success: {
      title: "신청이 접수되었습니다",
      description: "확인 후 {email}(으)로 연락드리겠습니다.",
      home: "처음으로",
      viewResult: "진단 결과 다시 보기",
    },
  },
  // The legal policy at /privacy. Copied byte-for-byte from the reviewed
  // Korean document; section titles, table cells and every punctuation mark
  // (·, ~, parentheses) must match the source exactly. Company details are
  // never hardcoded here -- they come from companyFor(locale) at render time.
  privacy: {
    title: "개인정보처리방침",
    intro:
      "{company}(이하 ‘회사’)는 PBA 7-Layer Business Radar(이하 ‘서비스’)를 운영하면서 「개인정보 보호법」에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.",
    effectiveDate: "2026년 9월 20일",
    effectiveDateLabel: "시행일: {date}",
    // Later locale files put a convenience-translation disclaimer here
    // ("this translation is for convenience; the Korean version prevails").
    // Empty in ko so nothing renders on the Korean page.
    translationNotice: "",
    section1: {
      title: "1. 개인정보의 처리 목적",
      intro: "회사는 다음 목적을 위해 개인정보를 처리하며, 목적이 변경되는 경우 사전에 동의를 받습니다.",
      items: [
        "진단 결과 리포트(PDF) 이메일 발송",
        "진단 결과에 기반한 상담(컨설팅) 신청 접수, 안내 및 연락",
        "마케팅 정보 제공(별도 동의 시): 뉴스레터·인사이트 이메일, 세미나·프로그램 안내, 신규 서비스·이벤트 안내",
        "서비스 이용 통계 분석 및 개선(개인을 식별하지 않는 정보 기준)",
        "진단 방법론 연구·개선(개인을 식별할 수 없는 형태로 가공한 정보에 한함)",
      ],
    },
    section2: {
      title: "2. 처리하는 개인정보 항목",
      intro:
        "진단은 개인정보 수집·이용에 동의하지 않아도 이용할 수 있습니다(익명 진단). 이 경우 이름, 이메일 등 개인을 식별할 수 있는 정보는 수집하지 않습니다.",
      table: {
        head: ["구분", "항목", "수집 시점"],
        rows: [
          ["필수 (동의 시)", "이름, 이메일 주소", "진단 시작 시 개인정보 수집·이용에 동의한 경우"],
          ["선택 (동의 시)", "회사/브랜드명, 역할", "진단 시작 시 개인정보 수집·이용에 동의한 경우"],
          [
            "필수 (상담 신청 시)",
            "이름, 이메일 주소, 상담 요청 메시지(선택)",
            "익명 진단 후 상담을 신청하는 경우, 신청 화면에서 동의를 받아 수집",
          ],
          [
            "진단 정보",
            "사업 단계, 업종, 팀 규모, 문항 응답과 진단 결과, 결과 적합도 평가, 연 매출·최근 12개월 성장 구간(선택 입력)",
            "진단 시 (익명 진단 포함). 익명 진단 시에는 이 정보만으로 개인을 식별할 수 없습니다. 개인정보 수집에 동의하거나 상담을 신청한 경우에는 이름·이메일과 함께 개인정보로 처리됩니다.",
          ],
          [
            "자동 수집",
            "쿠키 식별자, 방문 페이지·이용 이벤트, 기기·브라우저 정보, 유입 경로(UTM)",
            "서비스 이용 시 (6항 참조)",
          ],
        ],
      },
      note: "회사는 만 14세 미만 아동의 개인정보를 수집하지 않습니다.",
    },
    section3: {
      title: "3. 개인정보의 처리 및 보유 기간",
      items: [
        "진단·상담 신청 시 수집한 개인정보: 수집일로부터 1년. 단, 정보주체가 동의를 철회하거나 삭제를 요청하면 지체 없이 파기합니다.",
        "마케팅 정보 수신 동의: 수집일로부터 1년 또는 수신 동의를 철회할 때까지 중 먼저 도래하는 시점",
        "진단을 끝까지 완료하지 않은 임시 저장 정보: 마지막 입력일로부터 30일",
        "개인을 식별할 수 없는 진단 정보: 서비스 개선 및 통계 목적으로 보관할 수 있습니다.",
        "상담·컨설팅 계약을 맺은 경우, 계약 이행과 재진단을 위해 계약에서 정한 기간 동안 보관할 수 있습니다.",
        "개인정보를 파기할 때 업종 등 자유 입력 정보와 유입 경로(UTM) 정보도 함께 삭제하여, 남는 진단 정보로는 개인을 알아볼 수 없도록 합니다.",
      ],
    },
    section4: {
      title: "4. 개인정보의 파기 절차 및 방법",
      body: "보유 기간이 지나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일 형태의 정보는 복구할 수 없는 방법으로 영구 삭제합니다.",
    },
    section5: {
      title: "5. 개인정보의 제3자 제공 및 처리 위탁",
      intro: "회사는 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 서비스 운영을 위해 다음과 같이 처리를 위탁합니다.",
      table: {
        head: ["수탁자", "위탁 업무", "보관 위치"],
        rows: [
          ["Supabase, Inc.", "데이터베이스 및 운영자 인증 시스템 운영", "대한민국 (AWS 서울 리전)"],
          ["Amazon Web Services, Inc.", "웹 서비스 호스팅", "대한민국 (서울 리전)"],
        ],
      },
      note: "위탁 계약 시 개인정보가 안전하게 관리될 수 있도록 관련 사항을 규정하고 감독합니다.",
    },
    section6: {
      title: "6. 개인정보 자동 수집 장치(쿠키)의 설치·운영 및 거부",
      paragraphs: [
        "회사는 이용 통계를 분석하기 위해 Google Analytics 4를 사용하며, 이 과정에서 쿠키가 설치됩니다. 쿠키에는 이름·이메일 등 직접적인 식별 정보가 포함되지 않습니다.",
        "쿠키 저장을 원하지 않으면 브라우저 설정에서 쿠키를 차단하거나, Google 애널리틱스 차단 브라우저 부가기능(tools.google.com/dlpage/gaoptout)을 설치할 수 있습니다. 쿠키를 차단해도 진단 이용에는 제한이 없습니다.",
      ],
    },
    section7: {
      title: "7. 개인정보의 국외 이전",
      intro: "Google Analytics 4 이용에 따라 다음 정보가 국외로 이전됩니다.",
      table: {
        head: ["항목", "내용"],
        rows: [
          ["이전받는 자", "Google LLC (문의: privacy.google.com/contact)"],
          ["이전 국가", "미국"],
          ["이전 항목", "쿠키 식별자, 방문 페이지·이용 이벤트, 기기·브라우저 정보"],
          ["이전 일시 및 방법", "서비스 이용 시 네트워크를 통해 전송"],
          ["이용 목적", "서비스 이용 통계 분석"],
          ["보유 기간", "Google Analytics 데이터 보존 설정 기간(최대 14개월)"],
          ["거부 방법 및 효과", "6항의 방법으로 거부할 수 있으며, 거부해도 서비스 이용에 제한이 없습니다."],
        ],
      },
    },
    section8: {
      title: "8. 정보주체의 권리·의무 및 행사 방법",
      body: "정보주체는 회사에 대해 언제든지 개인정보 열람, 정정, 삭제, 처리정지 및 동의 철회를 요구할 수 있습니다. 아래 개인정보 보호책임자에게 이메일로 요청하시면 지체 없이(10일 이내) 조치하겠습니다. 법정대리인이나 위임을 받은 자를 통해서도 권리를 행사할 수 있습니다.",
    },
    section9: {
      title: "9. 개인정보의 안전성 확보 조치",
      items: [
        "개인정보에 접근할 수 있는 운영자를 최소화하고 계정·권한을 분리하여 관리",
        "데이터베이스 접근 통제(행 단위 보안 정책) 및 서버 전용 인증키 관리",
        "전송 구간 암호화(HTTPS)",
        "운영자 비밀번호 변경 시 기존 로그인 세션 무효화",
      ],
    },
    section10: {
      title: "10. 개인정보 보호책임자",
      table: {
        head: ["구분", "내용"],
        // Values (name, email, phone) come from companyFor(locale) at
        // render time; only the row labels are translatable copy.
        rowLabels: ["성명", "이메일", "연락처"],
      },
    },
    section11: {
      title: "11. 권익침해 구제 방법",
      intro: "개인정보 침해로 인한 구제를 받기 위해 아래 기관에 분쟁 해결이나 상담을 신청할 수 있습니다.",
      items: [
        "개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)",
        "개인정보침해신고센터: 118 (privacy.kisa.or.kr)",
        "대검찰청: 1301 (www.spo.go.kr)",
        "경찰청: 182 (ecrm.police.go.kr)",
      ],
    },
    section12: {
      title: "12. 개인정보처리방침의 변경",
      body: "이 개인정보처리방침은 {date}부터 적용됩니다. 내용이 변경되는 경우 시행 7일 전부터 서비스를 통해 공지합니다.",
    },
  },
  metadata: {
    siteTitle: "PBA 7-Layer Business Radar",
    siteDescription: "5분이면 현재 사업의 구조적 병목을 확인할 수 있습니다.",
    privacyTitle: "개인정보처리방침",
    noticeTitle: "공지사항",
  },
} as const;

// `as const` is what makes the key set exact (and keeps array shapes fixed),
// but it also gives every value a string *literal* type -- so a plain
// `typeof ko` would demand that every other locale repeat the Korean text
// verbatim. Widening each leaf back to `string` keeps the structure (which is
// what a locale file has to match) without pinning the content.
type Widen<T> = T extends string
  ? string
  : { readonly [K in keyof T]: Widen<T[K]> };

export type Messages = Widen<typeof ko>;

export default ko;
