import type { Messages } from "./ko";

// Simplified Chinese copy, translated from ko.ts (the source of truth), not
// from en.ts. It mirrors ko.ts key for key -- `satisfies Messages` fails the
// build if a key is missing, misspelled or extra. The Korean register is
// plain and direct and never claims the method is validated; this keeps
// that, in plain business Chinese rather than ad copy.
const zhCN = {
  common: {
    brand: "PBA 7-Layer Business Radar",
    notice: "公告",
    privacy: "个人信息处理方针",
    languageLabel: "语言",
    copyright: "© 2026 YLIA Co., Ltd. All rights reserved.",
    contact: "联系我们",
    noticeClose: "关闭公告",
    noticeEmpty: "暂时没有公告。",
    noticeBackToList: "← 公告列表",
    notFound: {
      draft: {
        title: "找不到该诊断",
        description: "链接可能有误，或者该诊断已经完成。",
        cta: "重新开始",
      },
      result: {
        title: "找不到该结果",
        description: "链接可能有误，或者已经过期。",
        cta: "重新开始诊断",
      },
      notice: {
        title: "找不到该公告",
        cta: "返回公告列表",
      },
    },
  },
  landing: {
    headline: "生意受阻时，先看结构，再看功能。",
    subhead: "5 分钟就能确认当前业务的结构性瓶颈。",
    cta: "开始免费的 Business Radar",
    stats: {
      questionCount: "28 道题",
      duration: "约 5 分钟",
      layerCount: "7 个结构领域",
      instantResult: "结果即时查看",
    },
  },
  basicInfo: {
    title: "请告诉我们基本信息",
    businessStage: "业务阶段 *",
    businessStageOther: "自行填写业务阶段 *",
    businessStageOtherPlaceholder: "请输入当前的业务阶段",
    industry: "行业（选填）",
    teamSize: "团队规模（选填）",
    consentIntro:
      "同意后，我们可以把结果 PDF 和咨询说明发送到您的邮箱。不同意也不影响您完成诊断并查看结果。",
    name: "姓名 *",
    namePlaceholder: "张三",
    email: "邮箱 *",
    emailPlaceholder: "you@example.com",
    companyName: "公司／品牌名称（选填）",
    role: "职务（选填）",
    marketingConsent: "我同意接收营销信息（选填）",
    submit: "下一步：开始答题",
    submitting: "正在开始...",
    error: "未能开始诊断，请重试。",
    stages: {
      idea: "构想",
      mvp_prep: "MVP 准备",
      building: "搭建中",
      operating: "运营中",
      growth: "成长",
      realign: "重新调整",
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
      checkboxRequired: "我同意收集和使用个人信息 *",
      checkboxOptional: "我同意收集和使用个人信息（选填）",
      details: "查看详情",
      fullPolicy: "查看个人信息处理方针全文",
      purposeTitle: "1. 个人信息收集目的",
      itemsTitle: "2. 收集项目",
      retentionTitle: "3. 保存期限",
      refusalTitle: "4. 不同意时的说明",
      summary:
        "目的：发送结果 PDF、咨询说明、提升诊断准确度 / 必填：姓名、邮箱 / 选填：公司名称、职务 / 保存：自收集之日起 1 年",
      purpose:
        "我们收集和使用个人信息，用于把诊断结果报告（PDF）发送到您的邮箱，以及就基于诊断结果的咨询（顾问服务）进行说明和联系。此外，您填写的诊断信息和业绩区间将用于提升诊断准确度和统计分析。",
      itemsCollected:
        "必填项：姓名、邮箱地址\n选填项：公司／品牌名称、职务\n选填项（在结果页面填写时）：年营业额、最近 12 个月的增长区间",
      retentionPeriod: "自收集之日起保存 1 年后销毁。",
      refusalNotice:
        "您有权不同意收集和使用个人信息；即使不同意，28 道题的诊断以及结果（雷达图、分数、瓶颈分析）的查看也不受限制。只是由于没有联系方式，无法通过邮件发送结果 PDF；咨询方面，您可以在申请咨询时同意并留下联系方式后使用。",
    },
  },
  wizard: {
    scaleLow: "完全没有梳理",
    scaleHigh: "已明确定义并用数据管理",
    next: "下一步",
    finish: "查看结果",
    layerDescriptions: {
      value: "检查我们提供的价值与客户想要的价值是否一致",
      customer: "检查我们的客户到底是谁、为什么购买",
      offer: "检查产品和价格是否按照客户旅程来安排",
      experience: "检查客户从接触我们到再次购买的整个旅程",
      process: "检查业务是否具备不只依赖个人的结构",
      data: "检查数据如何积累、如何使用",
      scale: "检查是否形成了别人也能做出同样品质的结构",
    },
    questions: {
      value: [
        "客户想要解决的核心问题，是否用一句话定义清楚？",
        "相比现有的替代方案，选择我们服务的理由是否明确？",
        "我们提供的价值与客户实际想要的价值是否一致？",
        "能否说明客户为什么应该为此付费？",
      ],
      customer: [
        "是否具体定义了核心客户？",
        "当服务使用者与实际购买者不同时，是否分别做了定义？",
        "是否了解促使客户决定购买的 Trigger？",
        "是否区分了不同客户的不同要求和需求？",
      ],
      offer: [
        "核心产品或服务是否有明确定义？",
        "是否有从免费 → 入门 → 核心 → 高价产品串联起来的结构？",
        "定价的依据与客户感受到的价值是否连接在一起？",
        "除一次性收入之外，是否存在重复性收入的结构？",
      ],
      experience: [
        "是否了解客户最初发现我们的渠道？",
        "关注 → 购买 → 使用 → 复购的过程是否有设计？",
        "是否掌握了客户流失的主要节点？",
        "客户体验是否不会过度依赖经办人的能力？",
      ],
      process: [
        "能否说明从客户提出需求到工作完成的整个流程？",
        "是否清楚哪些是重复性的手工作业？",
        "人该做的事和系统该做的事是否已经分开？",
        "即使经营者或某位员工不在，业务是否也能运转？",
      ],
      data: [
        "客户行为和服务使用数据是否在被记录？",
        "是否定义了收集哪些数据、为什么收集？",
        "是否在利用数据改善客户体验或业务？",
        "是否具体定义了可以应用 AI 或自动化的环节？",
      ],
      scale: [
        "是否形成了营业额增长时，经营者的工作时间不会按同等比例增加的结构？",
        "是否存在业务标准和运营手册？",
        "是否存在重复性收入，或者订阅、授权的结构？",
        "别人是否能以同样的品质提供服务？",
      ],
    },
  },
  result: {
    anonymousLabel: "匿名诊断",
    scoreHeading: "Architecture Score {score} / 140",
    maturityHeading: "各层成熟度",
    bottleneckHeading: "Business Bottleneck Top 3",
    riskSignalsHeading: "风险信号",
    hypothesisHeading: "可能性较高的原因假设",
    // {layer} arrives as the bare layer name (the Korean particle is added
    // only for `ko`), so the sentence reads correctly with e.g.
    // "DATA & INTELLIGENCE" substituted as-is.
    hypothesisIntro: "{layer} 得分偏低，最常见的原因如下。",
    hypothesisOutro:
      "这个假设是否是真正的原因，我们会在咨询中与您一起查看流程和数据。",
    strengthHeading: "Strength Top 2",
    actionsHeading: "90-Day Architecture Priority",
    periods: {
      p1: "1~30 天",
      p2: "31~60 天",
      p3: "61~90 天",
    },
    consultingCta: "申请咨询，验证原因假设",
    printButton: "保存结果 PDF · 打印",
    backHome: "返回首页",
    printFooter: "PBA 7-Layer Business Radar · pba.ylia.io · YLIA Co., Ltd.",
    levelCopy: {
      SYSTEMIZED:
        "业务结构已经相当体系化。下一个课题是提升数据、AI、自动化和扩张效率。",
      GROWTH_READY:
        "基本结构已经具备，但某个 Layer 有可能成为增长的瓶颈。",
      STRUCTURE_NEEDED:
        "服务已经存在，但客户、产品、流程、数据之间还没有充分连接。",
      FOUNDER_DEPENDENT:
        "业务在很大程度上依赖经营者或特定人员的经验和判断。",
      IDEA_STAGE:
        "在这个阶段，比起开发和营销，更需要先定义 Value · Customer · Offer。",
    },
    bottleneck: {
      value:
        "客户的问题和购买理由还不够清晰。相比增加功能，先重新定义价值主张更为优先。",
      customer:
        "服务面向谁的范围可能过宽，或者购买者与使用者没有区分开。",
      offer: "产品结构、价格与重复性收入的结构之间连接得还不够。",
      experience:
        "在客户从进入到再次使用的旅程中，需要管理流失节点。",
      process:
        "业务依赖个人的记忆和手工作业。先定义流程、分离角色更为优先。",
      data: "服务中产生的数据，还没有被充分用于决策和 AI／自动化。",
      scale:
        "营业额越增长，经营者和团队的工作时间就越可能成比例增加。",
    },
    strength: {
      value: "业务想要提供的价值相对明确。",
      customer: "对核心客户和购买场景的理解比较到位。",
      offer: "核心产品、价格以及通向重复性收入的结构安排得比较好。",
      experience: "客户进入、购买、再次回来的旅程设计得比较好。",
      process: "业务流程和角色定义得比较清楚。",
      data: "记录和利用客户数据的体系搭建得比较完整。",
      scale:
        "结构安排得比较好，营业额增长时工作负担不会过度增加。",
    },
    actions: {
      value: ["用一句话定义核心客户问题", "比较现有替代方案", "访谈购买理由"],
      customer: [
        "区分 Primary/Secondary/Buyer/User",
        "定义 JTBD",
        "梳理购买 Trigger",
      ],
      offer: [
        "编制 Product Ladder",
        "梳理核心产品／选项",
        "评估重复性收入的可能性",
      ],
      experience: [
        "Customer Journey Map",
        "定义转化／流失节点",
        "梳理核心 CTA",
      ],
      process: [
        "AS-IS Process Map",
        "识别重复性工作",
        "区分 HUMAN / AI-ASSIST / AUTO",
      ],
      data: ["定义核心数据", "定义事件／行为日志", "AI Opportunity Map"],
      scale: [
        "定义标准作业",
        "去掉依赖经营者的工作",
        "评估订阅／授权／合作伙伴结构",
      ],
    },
    maturityLevels: {
      1: "未定义",
      2: "认知",
      3: "梳理",
      4: "运营",
      5: "体系化",
    },
    maturityAnchors: {
      value: {
        1: "客户想要解决的问题和我们提供的价值，还没有梳理出来。",
        2: "能想到要解决的问题，但还无法用一句话定义，也无法与现有替代方案对比说明。",
        3: "核心问题和差异点已经梳理清楚，但是否与真实客户想要的价值一致还没有得到确认。",
        4: "梳理好的价值主张已经实际用于销售和营销，并且能说明客户为什么付费。",
        5: "价值主张通过客户访谈以及购买、流失数据得到确认，并定期更新。",
      },
      customer: {
        1: "谁是我们的客户，还没有具体定义。",
        2: "有大致的客户群，但没有区分使用者与购买者，也没有区分不同客户的需求。",
        3: "核心客户以及购买者、使用者已有定义，但促成购买决定的契机还停留在推测层面。",
        4: "客户定义和购买契机已经实际用于确定营销和销售的对象。",
        5: "通过各客户群的转化、留存数据来确认和更新客户定义。",
      },
      offer: {
        1: "卖什么、卖多少钱，会因客户和情况而不同。",
        2: "有核心产品，但没有定价依据，也没有通向下一个产品的结构。",
        3: "核心产品和定价依据已经梳理清楚，但入门→核心→高价的结构和重复性收入还处于设计阶段。",
        4: "产品阶梯和价格体系已经用于实际销售，并产生了部分重复性收入。",
        5: "依据各产品的转化率、客单价、复购数据来调整产品组合和价格。",
      },
      experience: {
        1: "客户如何认识我们、在哪里离开，都还没有掌握。",
        2: "能猜到主要的进入渠道，但购买之后的旅程和流失节点没有管理。",
        3: "从关注到复购的旅程已经画出来，但体验的质量会因经办人而不同。",
        4: "设计好的客户旅程已经在实际运行，并能掌握和应对主要流失节点。",
        5: "追踪旅程各阶段的转化、流失数据，持续改善体验。",
      },
      process: {
        1: "业务没有固定的流程，每次都靠个人判断处理。",
        2: "业务流程在脑子里，但没有形成文档，重复性手工作业很多。",
        3: "主要流程已经梳理，但人与系统的角色只分开了一部分。",
        4: "业务按照定义好的流程运转，即使经营者或某位员工不在，大部分也能处理。",
        5: "测量流程的成效，把重复性工作自动化，并持续改善。",
      },
      data: {
        1: "客户行为和服务使用数据几乎没有被记录。",
        2: "有一部分数据在积累，但没有定义收集什么、为什么收集。",
        3: "要收集的数据和目的已有定义，但只是偶尔用于决策。",
        4: "已经在依据数据实际改善客户体验或业务。",
        5: "数据是决策的基础，应用 AI／自动化的环节也在具体运行。",
      },
      scale: {
        1: "营业额增加时，经营者的工作时间也会随之同等增加。",
        2: "感到需要扩张，但没有业务标准或手册。",
        3: "一部分业务已经标准化，但别人要做出同样的品质还有难度。",
        4: "通过标准和手册，别人也能做出同样的品质，重复性收入结构在发挥作用。",
        5: "营业额增长时运营负担不会成比例增加，并通过订阅、授权、合作伙伴结构扩张。",
      },
    },
    riskSignals: {
      founder_bottleneck: {
        title: "依赖经营者的瓶颈",
        message:
          "业务绑在经营者身上，增长很可能被经营者的时间卡住。",
      },
      scaling_without_structure: {
        title: "没有结构的扩张",
        message:
          "在价值定义还模糊的状态下扩大规模。越扩张，客户流失和价格压力可能越大。",
      },
      automation_before_process: {
        title: "梳理之前的自动化",
        message:
          "相比数据和 AI 的使用，业务流程还没有梳理好。把没有梳理的流程自动化，低效也会一起被自动化。",
      },
      offer_without_customer: {
        title: "没有客户的产品设计",
        message:
          "产品结构已经具备，但核心客户的定义偏弱。产品可能是从供给方而不是客户的角度设计的。",
      },
      invisible_churn: {
        title: "看不见的流失",
        message: "看不到客户在哪里、为什么离开，改善只能靠感觉。",
      },
    },
    hypotheses: {
      value: "有可能是在没有做客户访谈的情况下，从供给方的角度定义了价值。",
      customer:
        "有可能是从“谁都是客户”这样宽泛的定义出发，一直没能把核心客户收窄。",
      offer:
        "有可能是每次都按客户要求定制应对，产品因此没有标准化。",
      experience:
        "有可能是把精力放在获客和首次购买上，购买之后的体验没有设计。",
      process:
        "有可能是经营者亲自做大部分判断，没有机会把业务流程写成文档。",
      data: "有可能是把数据当作“以后再看”的事情，没有确定记录什么、为什么记录。",
      scale:
        "有可能是按照“必须经营者亲自做才有品质”的前提经营，标准化被一再推后。",
    },
    feedback: {
      question: "这份诊断结果与实际情况相符吗？",
      fitLabel: "结果契合度",
      fitScale: "1 完全不符 · 5 非常准确",
      fitThanks: "感谢您的反馈，它会用于改进下一次诊断。",
      fitError: "未能保存您的反馈。",
      outcomeToggle: "为了更准确的分析，请告诉我们（选填）",
      outcomeThanks: "感谢您的告知。",
      outcomeNotice:
        "这是选填内容，不填写也不会有任何不利。它用于提升诊断准确度和统计；如果您已同意个人信息的收集，将与姓名、邮箱一起保存，1 年后删除可识别信息。",
      revenueLabel: "年营业额",
      growthLabel: "最近 12 个月的营业额变化",
      outcomeSubmit: "我已阅读说明并提交",
      selectAtLeastOne: "请至少选择一项。",
      alreadySubmitted: "已经提交过了。",
      saveError: "未能保存，请重试。",
      revenueBands: {
        pre_revenue: "尚无营收",
        lt_100m: "不足 1 亿韩元",
        "100m_1b": "1 亿 ~ 10 亿韩元",
        "1b_5b": "10 亿 ~ 50 亿韩元",
        "5b_10b": "50 亿 ~ 100 亿韩元",
        gte_10b: "100 亿韩元以上",
      },
      growthBands: {
        decline: "下降",
        flat: "持平（±10%）",
        "10_50": "增长 10~50%",
        "50_100": "增长 50~100%",
        gte_100: "2 倍以上",
        lt_1y: "经营不足 1 年",
      },
    },
  },
  consult: {
    backToResult: "← 返回诊断结果",
    title: "申请咨询",
    // Same ICU `select` as ko: "yes" when assessment.name is set, "other"
    // for an anonymous diagnosis. Chinese has no honorific, but the branch
    // still distinguishes a named diagnosis from an anonymous one.
    subtitle:
      "我们会根据{hasName, select, yes {{name}的诊断} other {诊断}}结果为您提供咨询。",
    anonymous: {
      name: "姓名 *",
      namePlaceholder: "张三",
      email: "接收联系的邮箱 *",
      emailPlaceholder: "you@example.com",
    },
    namedEmail: {
      label: "接收联系的邮箱",
      notice: "我们会通过您开始诊断时填写的邮箱与您联系。",
    },
    message: "想告诉我们的内容（选填）",
    submit: "提交咨询申请",
    submitting: "正在提交...",
    error: "未能提交申请，请重试。",
    success: {
      title: "申请已经提交",
      description: "确认之后，我们会通过 {email} 与您联系。",
      home: "回到首页",
      viewResult: "再次查看诊断结果",
    },
  },
  // Translation of the reviewed Korean policy. It is provided for
  // convenience only -- `translationNotice` says so on the page, and the
  // Korean version prevails. Company details come from companyFor(locale).
  privacy: {
    title: "个人信息处理方针",
    intro:
      "{company}（以下称“公司”）在运营 PBA 7-Layer Business Radar（以下称“本服务”）的过程中，依据韩国《个人信息保护法》保护信息主体的个人信息，并为迅速、顺畅地处理与此相关的投诉，制定并公开如下个人信息处理方针。",
    effectiveDate: "2026年9月20日",
    effectiveDateLabel: "施行日期：{date}",
    translationNotice:
      "本译文仅为方便阅读而提供，以韩语版本为准。",
    section1: {
      title: "1. 个人信息的处理目的",
      intro:
        "公司为下列目的处理个人信息；目的发生变更时，将事先取得同意。",
      items: [
        "以邮件发送诊断结果报告（PDF）",
        "接受基于诊断结果的咨询（顾问服务）申请，并进行说明和联系",
        "提供营销信息（另行同意时）：新闻邮件与洞察邮件、研讨会与项目通知、新服务与活动通知",
        "服务使用情况的统计分析与改进（以不识别个人的信息为准）",
        "诊断方法论的研究与改进（仅限加工为无法识别个人的形式的信息）",
      ],
    },
    section2: {
      title: "2. 处理的个人信息项目",
      intro:
        "即使不同意收集和使用个人信息，也可以使用诊断（匿名诊断）。此时不收集姓名、邮箱等可以识别个人的信息。",
      table: {
        head: ["区分", "项目", "收集时点"],
        rows: [
          [
            "必填（同意时）",
            "姓名、邮箱地址",
            "在开始诊断时同意收集和使用个人信息的情况",
          ],
          [
            "选填（同意时）",
            "公司／品牌名称、职务",
            "在开始诊断时同意收集和使用个人信息的情况",
          ],
          [
            "必填（申请咨询时）",
            "姓名、邮箱地址、咨询请求留言（选填）",
            "在匿名诊断后申请咨询的情况，在申请页面取得同意后收集",
          ],
          [
            "诊断信息",
            "业务阶段、行业、团队规模、题目回答与诊断结果、结果契合度评价、年营业额与最近 12 个月的增长区间（选填）",
            "诊断时（包括匿名诊断）。匿名诊断时，仅凭这些信息无法识别个人。如果同意收集个人信息或者申请了咨询，则与姓名、邮箱一起作为个人信息处理。",
          ],
          [
            "自动收集",
            "Cookie 标识符、访问页面与使用事件、设备与浏览器信息、来源渠道（UTM）",
            "使用服务时（参见第 6 项）",
          ],
        ],
      },
      note: "公司不收集未满 14 周岁儿童的个人信息。",
    },
    section3: {
      title: "3. 个人信息的处理及保有期限",
      items: [
        "诊断、申请咨询时收集的个人信息：自收集之日起 1 年。但信息主体撤回同意或者请求删除时，不迟延地销毁。",
        "营销信息接收同意：自收集之日起 1 年，或者撤回接收同意之时，以先到者为准",
        "未完成全部诊断的临时保存信息：自最后填写之日起 30 天",
        "无法识别个人的诊断信息：可以出于服务改进和统计目的保存。",
        "签订咨询、顾问服务合同的情况，为履行合同和进行再次诊断，可以在合同约定的期限内保存。",
        "销毁个人信息时，行业等自由填写的信息和来源渠道（UTM）信息也一并删除，使剩余的诊断信息无法识别个人。",
      ],
    },
    section4: {
      title: "4. 个人信息的销毁程序及方法",
      body: "保有期限已过或者处理目的已达成的个人信息，不迟延地销毁。电子文件形式的信息，以无法恢复的方法永久删除。",
    },
    section5: {
      title: "5. 个人信息的第三方提供及处理委托",
      intro:
        "公司不向第三方提供信息主体的个人信息。为运营服务，按如下方式委托处理。",
      table: {
        head: ["受托方", "委托业务", "存放位置"],
        rows: [
          [
            "Supabase, Inc.",
            "数据库及运营者认证系统的运行",
            "大韩民国（AWS 首尔区域）",
          ],
          ["Amazon Web Services, Inc.", "网站服务托管", "大韩民国（首尔区域）"],
        ],
      },
      note: "签订委托合同时，规定相关事项并进行监督，以保证个人信息得到安全管理。",
    },
    section6: {
      title: "6. 个人信息自动收集装置（Cookie）的安装、运行及拒绝",
      paragraphs: [
        "公司使用 Google Analytics 4 分析使用统计，该过程中会安装 Cookie。Cookie 中不包含姓名、邮箱等直接的识别信息。",
        "如果不希望保存 Cookie，可以在浏览器设置中阻止 Cookie，或者安装 Google Analytics 停用浏览器插件（tools.google.com/dlpage/gaoptout）。即使阻止 Cookie，使用诊断也不受限制。",
      ],
    },
    section7: {
      title: "7. 个人信息的境外转移",
      intro: "由于使用 Google Analytics 4，下列信息会转移至境外。",
      table: {
        head: ["项目", "内容"],
        rows: [
          ["接收方", "Google LLC（联系方式：privacy.google.com/contact）"],
          ["转移国家", "美国"],
          [
            "转移项目",
            "Cookie 标识符、访问页面与使用事件、设备与浏览器信息",
          ],
          ["转移时间及方法", "使用服务时通过网络传输"],
          ["使用目的", "服务使用情况的统计分析"],
          ["保有期限", "Google Analytics 数据保留设置期限（最长 14 个月）"],
          [
            "拒绝方法及效果",
            "可以按第 6 项的方法拒绝；即使拒绝，使用服务也不受限制。",
          ],
        ],
      },
    },
    section8: {
      title: "8. 信息主体的权利、义务及行使方法",
      body: "信息主体可以随时要求公司查阅、更正、删除个人信息，停止处理以及撤回同意。通过邮件向下述个人信息保护负责人提出请求的，我们将不迟延地（10 天以内）采取措施。也可以通过法定代理人或者受委托人行使权利。",
    },
    section9: {
      title: "9. 个人信息的安全性保障措施",
      items: [
        "尽量减少可以接触个人信息的运营者，并分离管理账号与权限",
        "数据库访问控制（行级安全策略）以及服务器专用认证密钥的管理",
        "传输环节加密（HTTPS）",
        "运营者更改密码时使原有登录会话失效",
      ],
    },
    section10: {
      title: "10. 个人信息保护负责人",
      table: {
        head: ["区分", "内容"],
        rowLabels: ["姓名", "邮箱", "联系方式"],
      },
    },
    section11: {
      title: "11. 权益受侵害时的救济方法",
      intro:
        "为就个人信息受到侵害获得救济，可以向下列机构申请纠纷解决或者咨询。",
      items: [
        "个人信息纠纷调解委员会（개인정보분쟁조정위원회）：1833-6972 (www.kopico.go.kr)",
        "个人信息侵害举报中心（개인정보침해신고센터）：118 (privacy.kisa.or.kr)",
        "大检察厅（대검찰청）：1301 (www.spo.go.kr)",
        "警察厅（경찰청）：182 (ecrm.police.go.kr)",
      ],
    },
    section12: {
      title: "12. 个人信息处理方针的变更",
      body: "本个人信息处理方针自 {date} 起适用。内容发生变更时，将在施行 7 天前通过本服务公告。",
    },
  },
  metadata: {
    siteTitle: "PBA 7-Layer Business Radar",
    siteDescription: "5 分钟就能确认当前业务的结构性瓶颈。",
    privacyTitle: "个人信息处理方针",
    noticeTitle: "公告",
  },
} satisfies Messages;

export default zhCN;
