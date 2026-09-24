import type { Messages } from "./ko";

// Traditional Chinese copy, translated from ko.ts (the source of truth) --
// not converted character-by-character from zh-CN.ts, because Taiwan/Hong
// Kong business vocabulary differs (個人資料 not 个人信息, 營收 not 营业额,
// 行銷 not 营销, 建置/營運, 轉換率, 回購, 產業, 電子郵件, 負責人/承辦人員).
// It mirrors ko.ts key for key -- `satisfies Messages` fails the build if a
// key is missing, misspelled or extra. The Korean register is plain and
// direct and never claims the method is validated; this keeps that.
const zhTW = {
  common: {
    brand: "PBA 7-Layer Business Radar",
    notice: "公告",
    privacy: "個人資料處理方針",
    languageLabel: "語言",
    copyright: "© 2026 YLIA Co., Ltd. All rights reserved.",
    contact: "聯絡我們",
    noticeClose: "關閉公告",
    noticeEmpty: "目前沒有公告。",
    noticeBackToList: "← 公告列表",
    notFound: {
      draft: {
        title: "找不到這份診斷",
        description: "連結可能有誤，或這份診斷已經完成。",
        cta: "重新開始",
      },
      result: {
        title: "找不到這份結果",
        description: "連結可能有誤，或已經過期。",
        cta: "重新進行診斷",
      },
      notice: {
        title: "找不到這則公告",
        cta: "回到公告列表",
      },
      global: {
        title: "找不到頁面",
        description: "您造訪的頁面不存在，或網址可能已經變更。",
        cta: "回到首頁",
      },
    },
  },
  landing: {
    headline: "事業卡關時，先看結構，再談功能。",
    subhead: "5 分鐘就能確認目前事業的結構性瓶頸。",
    cta: "開始免費的 Business Radar",
    stats: {
      questionCount: "28 題",
      duration: "約 5 分鐘",
      layerCount: "7 個結構領域",
      instantResult: "結果立即查看",
    },
  },
  basicInfo: {
    title: "請先告訴我們基本資料",
    businessStage: "事業階段 *",
    businessStageOther: "自行填寫事業階段 *",
    businessStageOtherPlaceholder: "請填寫目前的事業階段",
    industry: "產業（選填）",
    teamSize: "團隊規模（選填）",
    consentIntro:
      "同意之後，我們可以把結果 PDF 與諮詢說明寄到您的信箱。不同意也不影響您完成診斷並查看結果。",
    name: "姓名 *",
    namePlaceholder: "王小明",
    email: "電子郵件 *",
    emailPlaceholder: "you@example.com",
    companyName: "公司／品牌名稱（選填）",
    role: "職務（選填）",
    marketingConsent: "我同意接收行銷資訊（選填）",
    submit: "下一步：開始作答",
    submitting: "正在開始...",
    error: "無法開始診斷，請再試一次。",
    stages: {
      idea: "構想",
      mvp_prep: "MVP 準備",
      building: "建置中",
      operating: "營運中",
      growth: "成長",
      realign: "重新調整",
      other: "其他",
    },
    teamSizes: {
      solo: "1 人",
      "2_5": "2~5 人",
      "6_20": "6~20 人",
      "21_50": "21~50 人",
      "51_200": "51~199 人",
      gt_200: "200 人以上",
    },
    consent: {
      checkboxRequired: "我同意蒐集與利用個人資料 *",
      checkboxOptional: "我同意蒐集與利用個人資料（選填）",
      details: "查看詳細內容",
      fullPolicy: "查看個人資料處理方針全文",
      purposeTitle: "1. 個人資料蒐集目的",
      itemsTitle: "2. 蒐集項目",
      retentionTitle: "3. 保存期間",
      refusalTitle: "4. 不同意時的說明",
      summary:
        "目的：寄送結果 PDF、諮詢說明、提升診斷準確度 / 必填：姓名、電子郵件 / 選填：公司名稱、職務 / 保存：自蒐集日起 1 年",
      purpose:
        "我們蒐集與利用個人資料，用於將診斷結果報告（PDF）寄到您的信箱，以及就依診斷結果進行的諮詢（顧問服務）提供說明與聯絡。此外，您填寫的診斷資訊與績效區間，會用於提升診斷準確度與統計分析。",
      itemsCollected:
        "必填項目：姓名、電子郵件\n選填項目：公司／品牌名稱、職務\n選填項目（於結果頁面填寫時）：年營收、近 12 個月的成長區間",
      retentionPeriod: "自蒐集日起保存 1 年後銷毀。",
      refusalNotice:
        "您有權不同意蒐集與利用個人資料；即使不同意，28 題的診斷以及結果（雷達圖、分數、瓶頸分析）的查看也不受限制。只是因為沒有聯絡方式，無法以電子郵件寄送結果 PDF；諮詢方面，您可以在申請諮詢時同意並留下聯絡方式後使用。",
    },
  },
  wizard: {
    scaleLow: "完全沒有整理",
    scaleHigh: "已明確定義並以數據管理",
    next: "下一步",
    finish: "查看結果",
    layerDescriptions: {
      value: "檢視我們提供的價值與顧客想要的價值是否一致",
      customer: "檢視我們的顧客究竟是誰、為什麼購買",
      offer: "檢視產品與定價是否依顧客旅程安排",
      experience: "檢視顧客從認識我們到再次購買的整段旅程",
      process: "檢視業務是否具備不只依賴個人的結構",
      data: "檢視數據如何累積、又如何運用",
      scale: "檢視是否形成別人也能做出相同品質的結構",
    },
    questions: {
      value: [
        "顧客想解決的核心問題，是否用一句話定義清楚？",
        "相較於既有的替代方案，選擇我們服務的理由是否明確？",
        "我們提供的價值與顧客實際想要的價值是否一致？",
        "能否說明顧客為什麼應該為此付費？",
      ],
      customer: [
        "是否具體定義了核心顧客？",
        "當服務使用者與實際購買者不同時，是否分別做了定義？",
        "是否掌握促使顧客決定購買的 Trigger？",
        "是否區分不同顧客的不同要求與需求？",
      ],
      offer: [
        "核心產品或服務是否有明確定義？",
        "是否有從免費 → 入門 → 核心 → 高價產品串接起來的結構？",
        "定價的依據與顧客實際感受到的價值是否連結在一起？",
        "除了一次性的營收之外，是否存在重複性營收的結構？",
      ],
      experience: [
        "是否掌握顧客最初認識我們的管道？",
        "關注 → 購買 → 使用 → 回購的過程是否有設計？",
        "是否掌握顧客流失的主要環節？",
        "顧客體驗是否不會過度依賴承辦人員的能力？",
      ],
      process: [
        "能否說明從顧客提出需求到工作完成的整段流程？",
        "是否清楚哪些是重複性的人工作業？",
        "人該做的事與系統該做的事是否已經分開？",
        "即使負責人或某位員工不在，業務是否也能運作？",
      ],
      data: [
        "顧客行為與服務使用數據是否有被記錄？",
        "是否定義了要蒐集哪些數據、又為什麼蒐集？",
        "是否運用數據改善顧客體驗或業務？",
        "是否具體定義可以導入 AI 或自動化的環節？",
      ],
      scale: [
        "是否形成營收成長時，負責人的工作時間不會以相同比例增加的結構？",
        "是否有業務標準與營運手冊？",
        "是否有重複性營收，或訂閱、授權的結構？",
        "別人是否能以相同的品質提供服務？",
      ],
    },
  },
  result: {
    anonymousLabel: "匿名診斷",
    scoreHeading: "Architecture Score {score} / 140",
    maturityHeading: "各層成熟度",
    bottleneckHeading: "Business Bottleneck Top 3",
    riskSignalsHeading: "風險訊號",
    hypothesisHeading: "可能性較高的原因假設",
    // {layer} arrives as the bare layer name (the Korean particle is added
    // only for `ko`), so the sentence reads correctly with e.g.
    // "DATA & INTELLIGENCE" substituted as-is.
    hypothesisIntro: "{layer} 分數偏低時，最常見的原因如下。",
    hypothesisOutro:
      "這個假設是不是真正的原因，我們會在諮詢時與您一起檢視流程與數據。",
    strengthHeading: "Strength Top 2",
    actionsHeading: "90-Day Architecture Priority",
    periods: {
      p1: "1~30 天",
      p2: "31~60 天",
      p3: "61~90 天",
    },
    consultingCta: "申請諮詢，驗證原因假設",
    printButton: "儲存結果 PDF · 列印",
    backHome: "回到首頁",
    printFooter: "PBA 7-Layer Business Radar · pba.ylia.io · YLIA Co., Ltd.",
    levelCopy: {
      SYSTEMIZED:
        "事業結構已經相當系統化。下一個課題是提升數據、AI、自動化與擴展效率。",
      GROWTH_READY:
        "基本結構已經具備，但特定 Layer 有可能成為成長的瓶頸。",
      STRUCTURE_NEEDED:
        "服務已經存在，但顧客、產品、流程、數據之間還沒有充分連結。",
      FOUNDER_DEPENDENT:
        "事業在很大程度上依賴負責人或特定人員的經驗與判斷。",
      IDEA_STAGE:
        "在這個階段，比起開發與行銷，更需要先定義 Value · Customer · Offer。",
    },
    bottleneck: {
      value:
        "顧客的問題與購買理由還不夠清楚。比起增加功能，先重新定義價值主張更為優先。",
      customer:
        "服務對象的範圍可能太廣，或是購買者與使用者沒有分開。",
      offer: "產品結構、定價與重複性營收的結構之間連結得還不夠。",
      experience:
        "在顧客從進入到再次使用的旅程中，需要管理流失環節。",
      process:
        "業務依賴個人的記憶與人工作業。先定義流程、分工角色更為優先。",
      data: "服務中產生的數據，還沒有充分運用在決策與 AI／自動化上。",
      scale:
        "營收越成長，負責人與團隊的工作時間就越可能等比例增加。",
    },
    strength: {
      value: "事業想提供的價值相對明確。",
      customer: "對核心顧客與購買情境的理解相當到位。",
      offer: "核心產品、定價以及通往重複性營收的結構安排得相當完整。",
      experience: "顧客進入、購買、再次回來的旅程設計得相當完整。",
      process: "業務流程與角色分工定義得相當清楚。",
      data: "記錄與運用顧客數據的制度建立得相當完整。",
      scale:
        "結構安排得相當完整，營收成長時工作負擔不會過度增加。",
    },
    actions: {
      value: ["用一句話定義核心顧客問題", "比較既有替代方案", "訪談購買理由"],
      customer: [
        "區分 Primary/Secondary/Buyer/User",
        "定義 JTBD",
        "整理購買 Trigger",
      ],
      offer: [
        "撰寫 Product Ladder",
        "整理核心產品／選項",
        "評估重複性營收的可能性",
      ],
      experience: [
        "Customer Journey Map",
        "定義轉換／流失環節",
        "整理核心 CTA",
      ],
      process: [
        "AS-IS Process Map",
        "找出重複性作業",
        "區分 HUMAN / AI-ASSIST / AUTO",
      ],
      data: ["定義核心數據", "定義事件／行為記錄", "AI Opportunity Map"],
      scale: [
        "定義標準作業",
        "移除依賴負責人的工作",
        "評估訂閱／授權／合作夥伴結構",
      ],
    },
    maturityLevels: {
      1: "未定義",
      2: "認知",
      3: "整理",
      4: "營運",
      5: "系統化",
    },
    maturityAnchors: {
      value: {
        1: "顧客想解決的問題與我們提供的價值，都還沒有整理出來。",
        2: "想得到要解決的問題，但還無法用一句話定義，也無法與既有替代方案對照說明。",
        3: "核心問題與差異點已經整理清楚，但是否與真實顧客想要的價值一致還沒有確認。",
        4: "整理好的價值主張已經實際用在業務與行銷上，也能說明顧客為什麼付費。",
        5: "價值主張透過顧客訪談以及購買、流失數據得到確認，並定期更新。",
      },
      customer: {
        1: "誰是我們的顧客，還沒有具體定義。",
        2: "有大致的客群，但沒有區分使用者與購買者，也沒有區分不同顧客的需求。",
        3: "核心顧客以及購買者、使用者已有定義，但促成購買決定的契機還停留在推測。",
        4: "顧客定義與購買契機已經實際用於決定行銷與業務的對象。",
        5: "透過各客群的轉換、留存數據確認並更新顧客定義。",
      },
      offer: {
        1: "賣什麼、賣多少錢，會因顧客與情況而不同。",
        2: "有核心產品，但沒有定價依據，也沒有通往下一個產品的結構。",
        3: "核心產品與定價依據已經整理清楚，但入門→核心→高價的結構與重複性營收還在設計階段。",
        4: "產品階梯與價格制度已經用在實際銷售上，也產生了部分重複性營收。",
        5: "依各產品的轉換率、客單價、回購數據調整產品組合與定價。",
      },
      experience: {
        1: "顧客如何認識我們、又在哪裡離開，都還沒有掌握。",
        2: "猜得到主要的進入管道，但購買之後的旅程與流失環節沒有管理。",
        3: "從關注到回購的旅程已經畫出來，但體驗的品質會因承辦人員而不同。",
        4: "設計好的顧客旅程已經實際運作，也能掌握並處理主要的流失環節。",
        5: "追蹤旅程各階段的轉換、流失數據，持續改善體驗。",
      },
      process: {
        1: "業務沒有固定流程，每次都靠個人判斷處理。",
        2: "業務流程在腦袋裡，但沒有寫成文件，重複性的人工作業很多。",
        3: "主要流程已經整理，但人與系統的角色只分開了一部分。",
        4: "業務依照定義好的流程運作，即使負責人或某位員工不在，大部分也能處理。",
        5: "衡量流程的成效，將重複性作業自動化，並持續改善。",
      },
      data: {
        1: "顧客行為與服務使用數據幾乎沒有被記錄。",
        2: "有一部分數據在累積，但沒有定義要蒐集什麼、為什麼蒐集。",
        3: "要蒐集的數據與目的已有定義，但只是偶爾用在決策上。",
        4: "已經依據數據實際改善顧客體驗或業務。",
        5: "數據是決策的基礎，導入 AI／自動化的環節也在具體運作。",
      },
      scale: {
        1: "營收增加時，負責人的工作時間也會隨之等量增加。",
        2: "感覺需要擴展，但沒有業務標準或手冊。",
        3: "一部分業務已經標準化，但別人要做出相同品質還有困難。",
        4: "透過標準與手冊，別人也能做出相同品質，重複性營收的結構正在運作。",
        5: "營收成長時營運負擔不會等比例增加，並透過訂閱、授權、合作夥伴結構擴展。",
      },
    },
    riskSignals: {
      founder_bottleneck: {
        title: "依賴負責人的瓶頸",
        message:
          "業務綁在負責人身上，成長很可能卡在負責人的時間上。",
      },
      scaling_without_structure: {
        title: "沒有結構的擴展",
        message:
          "在價值定義還模糊的狀態下擴大規模。越擴展，顧客流失與價格壓力可能越大。",
      },
      automation_before_process: {
        title: "整理之前的自動化",
        message:
          "相較於數據與 AI 的運用，業務流程還沒有整理好。把沒有整理的流程自動化，沒有效率的部分也會一起被自動化。",
      },
      offer_without_customer: {
        title: "沒有顧客的產品設計",
        message:
          "產品結構已經具備，但核心顧客的定義偏弱。產品可能是從供給方而不是顧客的角度設計的。",
      },
      invisible_churn: {
        title: "看不見的流失",
        message: "看不到顧客在哪裡、又為什麼離開，改善只能靠感覺。",
      },
    },
    hypotheses: {
      value: "有可能是在沒有做顧客訪談的情況下，從供給方的角度定義了價值。",
      customer:
        "有可能是從「誰都是顧客」這種寬鬆的定義出發，一直沒能把核心顧客收斂下來。",
      offer:
        "有可能是每次都依顧客要求客製處理，產品因此沒有標準化。",
      experience:
        "有可能是把心力放在導流與首次購買上，購買之後的體驗沒有設計。",
      process:
        "有可能是負責人親自做大部分判斷，沒有機會把業務流程寫成文件。",
      data: "有可能是把數據當成「之後再看」的事，沒有決定要記錄什麼、為什麼記錄。",
      scale:
        "有可能是抱著「負責人親自做才有品質」的前提在經營，標準化因此一再延後。",
    },
    feedback: {
      question: "這份診斷結果與實際情況相符嗎？",
      fitLabel: "結果符合度",
      fitScale: "1 完全不符 · 5 非常準確",
      fitThanks: "謝謝您的意見，我們會用來改善下一次的診斷。",
      fitError: "無法儲存您的意見。",
      outcomeToggle: "為了更準確的分析，請告訴我們（選填）",
      outcomeThanks: "謝謝您告訴我們。",
      outcomeNotice:
        "這是選填內容，不填寫也不會有任何不利。這些內容會用於提升診斷準確度與統計；若您已同意蒐集個人資料，會與姓名、電子郵件一起保存，1 年後刪除可識別的資訊。",
      revenueLabel: "年營收",
      growthLabel: "近 12 個月的營收變化",
      outcomeSubmit: "我已閱讀說明並送出",
      selectAtLeastOne: "請至少選擇一項。",
      alreadySubmitted: "已經送出過了。",
      saveError: "無法儲存，請再試一次。",
      revenueBands: {
        pre_revenue: "尚無營收",
        lt_100m: "未滿 1 億韓元",
        "100m_1b": "1 億 ~ 10 億韓元",
        "1b_5b": "10 億 ~ 50 億韓元",
        "5b_10b": "50 億 ~ 100 億韓元",
        gte_10b: "100 億韓元以上",
      },
      growthBands: {
        decline: "衰退",
        flat: "持平（±10%）",
        "10_50": "成長 10~50%",
        "50_100": "成長 50~100%",
        gte_100: "2 倍以上",
        lt_1y: "經營未滿 1 年",
      },
    },
  },
  consult: {
    backToResult: "← 回到診斷結果",
    title: "申請諮詢",
    // Same ICU `select` as ko: "yes" when assessment.name is set, "other"
    // for an anonymous diagnosis. Chinese has no honorific, but the branch
    // still distinguishes a named diagnosis from an anonymous one.
    subtitle:
      "我們會依照{hasName, select, yes {{name}的診斷} other {診斷}}結果提供諮詢協助。",
    anonymous: {
      name: "姓名 *",
      namePlaceholder: "王小明",
      email: "接收聯絡的電子郵件 *",
      emailPlaceholder: "you@example.com",
    },
    namedEmail: {
      label: "接收聯絡的電子郵件",
      notice: "我們會透過您開始診斷時填寫的電子郵件與您聯絡。",
    },
    message: "想告訴我們的內容（選填）",
    submit: "送出諮詢申請",
    submitting: "正在送出...",
    error: "無法送出申請，請再試一次。",
    success: {
      title: "已經收到您的申請",
      description: "確認之後，我們會透過 {email} 與您聯絡。",
      home: "回到首頁",
      viewResult: "再次查看診斷結果",
    },
  },
  // Translation of the reviewed Korean policy. It is provided for
  // convenience only -- `translationNotice` says so on the page, and the
  // Korean version prevails. Company details come from companyFor(locale).
  privacy: {
    title: "個人資料處理方針",
    intro:
      "{company}（以下稱「本公司」）在營運 PBA 7-Layer Business Radar（以下稱「本服務」）時，依韓國《個人資料保護法》保護資料主體的個人資料，並為迅速、順暢地處理相關申訴，訂定並公開如下個人資料處理方針。",
    effectiveDate: "2026年9月20日",
    effectiveDateLabel: "施行日：{date}",
    translationNotice:
      "本譯文僅為便利閱讀而提供，以韓文版本為準。",
    section1: {
      title: "1. 個人資料的處理目的",
      intro:
        "本公司為下列目的處理個人資料；目的變更時，將事先取得同意。",
      items: [
        "以電子郵件寄送診斷結果報告（PDF）",
        "受理依診斷結果提出的諮詢（顧問服務）申請，並進行說明與聯絡",
        "提供行銷資訊（另行同意時）：電子報與洞察信、研討會與課程通知、新服務與活動通知",
        "服務使用狀況的統計分析與改善（以無法識別個人的資訊為準）",
        "診斷方法論的研究與改善（僅限已加工為無法識別個人之形式的資訊）",
      ],
    },
    section2: {
      title: "2. 處理的個人資料項目",
      intro:
        "即使不同意蒐集與利用個人資料，也可以使用診斷（匿名診斷）。此時不會蒐集姓名、電子郵件等可識別個人的資訊。",
      table: {
        head: ["區分", "項目", "蒐集時點"],
        rows: [
          [
            "必填（同意時）",
            "姓名、電子郵件",
            "在開始診斷時同意蒐集與利用個人資料的情形",
          ],
          [
            "選填（同意時）",
            "公司／品牌名稱、職務",
            "在開始診斷時同意蒐集與利用個人資料的情形",
          ],
          [
            "必填（申請諮詢時）",
            "姓名、電子郵件、諮詢需求留言（選填）",
            "於匿名診斷後申請諮詢的情形，在申請畫面取得同意後蒐集",
          ],
          [
            "診斷資訊",
            "事業階段、產業、團隊規模、題目作答與診斷結果、結果符合度評分、年營收與近 12 個月的成長區間（選填）",
            "診斷時（包含匿名診斷）。匿名診斷時，僅憑這些資訊無法識別個人。若同意蒐集個人資料或申請了諮詢，則會與姓名、電子郵件一併作為個人資料處理。",
          ],
          [
            "自動蒐集",
            "Cookie 識別碼、造訪頁面與使用事件、裝置與瀏覽器資訊、來源管道（UTM）",
            "使用服務時（參見第 6 項）",
          ],
        ],
      },
      note: "本公司不蒐集未滿 14 歲兒童的個人資料。",
    },
    section3: {
      title: "3. 個人資料的處理及保存期間",
      items: [
        "診斷、申請諮詢時蒐集的個人資料：自蒐集日起 1 年。但資料主體撤回同意或請求刪除時，將不遲延銷毀。",
        "行銷資訊接收同意：自蒐集日起 1 年，或撤回接收同意之時，以先到者為準",
        "未完成整份診斷的暫存資訊：自最後填寫日起 30 天",
        "無法識別個人的診斷資訊：得為服務改善與統計目的保存。",
        "已簽訂諮詢、顧問服務契約的情形，為履行契約與再次診斷，得在契約所定期間內保存。",
        "銷毀個人資料時，產業等自由填寫的資訊與來源管道（UTM）資訊也會一併刪除，使剩下的診斷資訊無法識別個人。",
      ],
    },
    section4: {
      title: "4. 個人資料的銷毀程序及方法",
      body: "保存期間已過或處理目的已達成的個人資料，將不遲延銷毀。電子檔形式的資訊，會以無法復原的方法永久刪除。",
    },
    section5: {
      title: "5. 個人資料的第三方提供及處理委外",
      intro:
        "本公司不會將資料主體的個人資料提供給第三方。為營運服務，依下列方式委外處理。",
      table: {
        head: ["受託方", "委外業務", "存放位置"],
        rows: [
          [
            "Supabase, Inc.",
            "資料庫及管理者驗證系統的運作",
            "大韓民國（AWS 首爾區域）",
          ],
          ["Amazon Web Services, Inc.", "網站服務代管", "大韓民國（首爾區域）"],
        ],
      },
      note: "簽訂委外契約時，會訂定相關事項並加以監督，以確保個人資料受到安全管理。",
    },
    section6: {
      title: "6. 個人資料自動蒐集裝置（Cookie）的安裝、運作及拒絕",
      paragraphs: [
        "本公司使用 Google Analytics 4 分析使用統計，過程中會安裝 Cookie。Cookie 中不包含姓名、電子郵件等可直接識別的資訊。",
        "若不希望儲存 Cookie，可以在瀏覽器設定中封鎖 Cookie，或安裝 Google Analytics 停用瀏覽器外掛程式（tools.google.com/dlpage/gaoptout）。即使封鎖 Cookie，使用診斷也不受限制。",
      ],
    },
    section7: {
      title: "7. 個人資料的國外傳輸",
      intro: "因使用 Google Analytics 4，下列資訊會傳輸至國外。",
      table: {
        head: ["項目", "內容"],
        rows: [
          ["接收方", "Google LLC（聯絡方式：privacy.google.com/contact）"],
          ["傳輸國家", "美國"],
          [
            "傳輸項目",
            "Cookie 識別碼、造訪頁面與使用事件、裝置與瀏覽器資訊",
          ],
          ["傳輸時間及方法", "使用服務時透過網路傳送"],
          ["利用目的", "服務使用狀況的統計分析"],
          ["保存期間", "Google Analytics 資料保留設定期間（最長 14 個月）"],
          [
            "拒絕方法及效果",
            "可依第 6 項的方法拒絕；即使拒絕，使用服務也不受限制。",
          ],
        ],
      },
    },
    section8: {
      title: "8. 資料主體的權利、義務及行使方法",
      body: "資料主體可以隨時要求本公司查閱、更正、刪除個人資料，停止處理以及撤回同意。若以電子郵件向下列個人資料保護負責人提出請求，我們會不遲延（10 天內）處理。也可以透過法定代理人或受委任人行使權利。",
    },
    section9: {
      title: "9. 個人資料的安全維護措施",
      items: [
        "盡量減少可接觸個人資料的管理者，並分離管理帳號與權限",
        "資料庫存取控制（列層級安全政策）以及伺服器專用驗證金鑰的管理",
        "傳輸過程加密（HTTPS）",
        "管理者變更密碼時使既有的登入工作階段失效",
        "個人資料處理系統（管理者介面）的存取紀錄（帳號、存取時間、來源IP位址、所執行的操作）保存一年以上，並每月至少檢查一次",
      ],
    },
    section10: {
      title: "10. 個人資料保護負責人",
      table: {
        head: ["區分", "內容"],
        rowLabels: ["姓名", "電子郵件", "聯絡方式"],
      },
    },
    section11: {
      title: "11. 權益受侵害時的救濟方法",
      intro:
        "為就個人資料受侵害取得救濟，可以向下列機關申請爭議解決或諮詢。",
      items: [
        "個人資料爭議調解委員會（개인정보분쟁조정위원회）：1833-6972 (www.kopico.go.kr)",
        "個人資料侵害申訴中心（개인정보침해신고센터）：118 (privacy.kisa.or.kr)",
        "大檢察廳（대검찰청）：1301 (www.spo.go.kr)",
        "警察廳（경찰청）：182 (ecrm.police.go.kr)",
      ],
    },
    section12: {
      title: "12. 個人資料處理方針的變更",
      body: "本個人資料處理方針自 {date} 起適用。內容變更時，會在施行 7 天前透過本服務公告。",
    },
  },
  metadata: {
    siteTitle: "PBA 7-Layer Business Radar",
    siteDescription: "5 分鐘就能確認目前事業的結構性瓶頸。",
    privacyTitle: "個人資料處理方針",
    noticeTitle: "公告",
  },
} satisfies Messages;

export default zhTW;
