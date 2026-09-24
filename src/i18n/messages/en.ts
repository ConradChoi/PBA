import type { Messages } from "./ko";

// English copy for overseas visitors reading the same service. It mirrors
// ko.ts key for key -- `satisfies Messages` fails the build if a key is
// missing, misspelled or extra. The Korean register is plain and direct and
// makes no claim that the method is validated; the English keeps that.
const en = {
  common: {
    brand: "PBA 7-Layer Business Radar",
    notice: "Notices",
    privacy: "Privacy Policy",
    languageLabel: "Language",
    copyright: "© 2026 YLIA Co., Ltd. All rights reserved.",
    contact: "Contact",
    noticeClose: "Close notice",
    noticeEmpty: "There are no notices yet.",
    noticeBackToList: "← Back to notices",
    notFound: {
      draft: {
        title: "We could not find that diagnostic",
        description:
          "The link may be incorrect, or the diagnostic may already be complete.",
        cta: "Start over",
      },
      result: {
        title: "We could not find that result",
        description: "The link may be incorrect, or it may have expired.",
        cta: "Start a new diagnostic",
      },
      notice: {
        title: "We could not find that notice",
        cta: "Back to notices",
      },
      global: {
        title: "Page not found",
        description: "The page you requested doesn't exist, or its address may have changed.",
        cta: "Back to home",
      },
    },
  },
  landing: {
    headline: "When a business stalls, we look at structure before features.",
    subhead:
      "In five minutes you can see where your business is structurally blocked.",
    cta: "Start the free Business Radar",
    stats: {
      questionCount: "28 questions",
      duration: "About 5 minutes",
      layerCount: "7 structural layers",
      instantResult: "Results shown immediately",
    },
  },
  basicInfo: {
    title: "Tell us a few basics",
    businessStage: "Business stage *",
    businessStageOther: "Business stage, in your own words *",
    businessStageOtherPlaceholder: "Enter your current business stage",
    industry: "Industry (optional)",
    teamSize: "Team size (optional)",
    consentIntro:
      "If you consent, we can email you the result PDF and information about consulting. If you do not consent, you can still take the diagnostic and see your results just the same.",
    name: "Name *",
    namePlaceholder: "Jane Doe",
    email: "Email *",
    emailPlaceholder: "you@example.com",
    companyName: "Company / brand name (optional)",
    role: "Role (optional)",
    marketingConsent: "I agree to receive marketing information (optional)",
    submit: "Next: start the questions",
    submitting: "Starting...",
    error: "We could not start the diagnostic. Please try again.",
    stages: {
      idea: "Idea",
      mvp_prep: "Preparing an MVP",
      building: "Building",
      operating: "Operating",
      growth: "Growth",
      realign: "Realigning",
      other: "Other",
    },
    teamSizes: {
      solo: "1 person",
      "2_5": "2–5 people",
      "6_20": "6–20 people",
      "21_50": "21–50 people",
      "51_200": "51–199 people",
      gt_200: "200+ people",
    },
    consent: {
      checkboxRequired:
        "I consent to the collection and use of my personal information *",
      checkboxOptional:
        "I consent to the collection and use of my personal information (optional)",
      details: "View details",
      fullPolicy: "Read the full Privacy Policy",
      purposeTitle: "1. Purpose of collection",
      itemsTitle: "2. Items collected",
      retentionTitle: "3. Retention period",
      refusalTitle: "4. If you do not consent",
      summary:
        "Purpose: sending the result PDF, providing consulting information, improving diagnostic accuracy / Required: name, email / Optional: company name, role / Retention: 1 year from collection",
      purpose:
        "We collect and use your personal information to email you the diagnostic result report (PDF) and to provide information about, and contact you regarding, consulting based on your results. The diagnostic information and performance bands you enter are also used to improve the accuracy of the diagnostic and for statistical analysis.",
      itemsCollected:
        "Required: name, email address\nOptional: company / brand name, role\nOptional (if entered on the result page): annual revenue band, revenue growth band over the last 12 months",
      retentionPeriod:
        "Retained for one year from the date of collection, then destroyed.",
      refusalNotice:
        "You have the right to refuse consent to the collection and use of your personal information. If you refuse, there is no restriction on taking the 28-question diagnostic or on viewing your results (radar chart, scores, bottleneck analysis). However, since we would have no way to reach you, we cannot email you the result PDF. You can still use consulting by giving consent and leaving your contact details when you request a consultation.",
    },
  },
  wizard: {
    scaleLow: "Not organized at all",
    scaleHigh: "Clearly defined and managed with data",
    next: "Next",
    finish: "See results",
    layerDescriptions: {
      value:
        "Checks whether the value you deliver matches the value customers want",
      customer: "Checks exactly who your customers are and why they buy",
      offer:
        "Checks whether your products and prices are arranged to fit the customer journey",
      experience:
        "Checks the journey from a customer meeting you to buying again",
      process: "Checks whether work is structured so it does not rest on people alone",
      data: "Checks how you collect data and how you use it",
      scale: "Checks whether someone else could deliver the same quality",
    },
    questions: {
      value: [
        "Is the core problem your customers want solved defined in one sentence?",
        "Is it clear why someone should choose your service over the existing alternatives?",
        "Does the value you provide match the value customers actually want?",
        "Can you explain why a customer should pay for it?",
      ],
      customer: [
        "Have you defined your core customer specifically?",
        "Where the user of the service and the actual buyer differ, are both defined?",
        "Do you know the trigger that makes a customer decide to buy?",
        "Do you distinguish the different requirements and needs of different customers?",
      ],
      offer: [
        "Is your core product or service clearly defined?",
        "Is there a structure that connects free → entry → core → premium offers?",
        "Is the basis for your pricing connected to the value customers actually feel?",
        "Beyond one-off sales, is there a recurring revenue structure?",
      ],
      experience: [
        "Do you know how customers first discover you?",
        "Is the path from interest → purchase → use → repurchase designed?",
        "Do you know the main points where customers drop off?",
        "Is the customer experience consistent, rather than depending on whoever handles it?",
      ],
      process: [
        "Can you describe the whole process from a customer request to the work being finished?",
        "Do you know which manual tasks are repeated?",
        "Is the work people must do separated from the work a system should do?",
        "Does the work keep running when the owner or a particular employee is away?",
      ],
      data: [
        "Are customer behavior and service usage data being recorded?",
        "Is it defined which data you collect and why?",
        "Are you using data to improve the customer experience or your operations?",
        "Are the specific points where AI or automation could be applied defined?",
      ],
      scale: [
        "When revenue grows, do the owner's working hours grow more slowly than revenue?",
        "Do work standards and an operations manual exist?",
        "Is there recurring revenue, or a subscription or licensing structure?",
        "Can someone else deliver the service at the same quality?",
      ],
    },
  },
  result: {
    anonymousLabel: "Anonymous diagnostic",
    scoreHeading: "Architecture Score {score} / 140",
    maturityHeading: "Maturity by layer",
    bottleneckHeading: "Business Bottleneck Top 3",
    riskSignalsHeading: "Risk signals",
    hypothesisHeading: "Most likely cause hypothesis",
    // {layer} arrives as the bare layer name for every locale but `ko`, so
    // the sentence has to read correctly with it substituted as-is.
    hypothesisIntro: "The most common reason {layer} scores low is this:",
    hypothesisOutro:
      "In a consultation we go through your process and data together to check whether this hypothesis is the actual cause.",
    strengthHeading: "Strength Top 2",
    actionsHeading: "90-Day Architecture Priority",
    periods: {
      p1: "Days 1–30",
      p2: "Days 31–60",
      p3: "Days 61–90",
    },
    // The price is written out with the ₩ symbol, the same way the revenue
    // bands above spell amounts, rather than transliterating the Korean
    // "만원". <b> in `body` / `includes.roadmap` is rendered by t.rich.
    sessionOffer: {
      heading: "Next step",
      priceLine: "Structure Diagnostic Session · ₩390,000",
      vatNote: "(excl. VAT)",
      format: "2–3 hours online · on-site available in the Seoul metropolitan area",
      body: "The bottlenecks this diagnostic found are still <b>hypotheses</b>. In the session we go through your actual operations and numbers together, confirm whether that really is the cause, and settle what to fix first.",
      includes: {
        cause: "Trace one or two bottlenecks down to their root cause",
        roadmap: "<b>A 90-day execution roadmap document</b> — delivered within 3 days of the session",
        scope: "A build scope and quote, if you need one",
      },
      cta: "Apply for a Structure Diagnostic Session",
      ctaNote: "Once you apply, we will email you about scheduling and payment.",
    },
    printButton: "Save as PDF · Print",
    backHome: "Back to home",
    printFooter: "PBA 7-Layer Business Radar · pba.ylia.io · YLIA Co., Ltd.",
    levelCopy: {
      SYSTEMIZED:
        "Your business structure is largely systemized. The next task is to raise the efficiency of data, AI, automation and scaling.",
      GROWTH_READY:
        "The basic structure is in place, but a particular layer may become a bottleneck for growth.",
      STRUCTURE_NEEDED:
        "The service exists, but customers, offers, processes and data are not yet sufficiently connected.",
      FOUNDER_DEPENDENT:
        "The business depends heavily on the experience and judgment of the owner or a few specific people.",
      IDEA_STAGE:
        "At this stage, defining Value · Customer · Offer comes before development and marketing.",
    },
    bottleneck: {
      value:
        "The customer problem and the reason to buy are not sharp enough. Redefining the value proposition comes before adding features.",
      customer:
        "The service may be aimed too broadly, or the buyer and the user may not be separated.",
      offer:
        "The product structure, pricing and recurring revenue are not sufficiently connected.",
      experience:
        "The drop-off points along the journey from acquisition to repeat use need to be managed.",
      process:
        "Work depends on people's memory and manual effort. Defining the process and separating roles comes first.",
      data: "The data your service generates is not being used enough for decisions or for AI and automation.",
      scale:
        "As revenue grows, the working hours of the owner and the team are likely to grow in proportion.",
    },
    strength: {
      value: "The value the business sets out to deliver is relatively clear.",
      customer:
        "You have a good understanding of your core customers and the situations in which they buy.",
      offer:
        "Core products, pricing and the path to recurring revenue are relatively well put together.",
      experience:
        "The journey from acquisition to purchase to coming back is relatively well designed.",
      process: "Workflows and roles are relatively well defined.",
      data: "You have a relatively solid system for recording and using customer data.",
      scale:
        "The structure is relatively well set up so that the workload does not grow excessively as revenue grows.",
    },
    actions: {
      value: [
        "Define the core customer problem in one sentence",
        "Compare the existing alternatives",
        "Interview customers on why they buy",
      ],
      customer: [
        "Separate Primary / Secondary / Buyer / User",
        "Define the JTBD",
        "Map the buying triggers",
      ],
      offer: [
        "Draft a Product Ladder",
        "Organize core products and options",
        "Assess the potential for recurring revenue",
      ],
      experience: [
        "Customer Journey Map",
        "Define conversion and drop-off points",
        "Organize the core CTAs",
      ],
      process: [
        "AS-IS Process Map",
        "Identify repetitive work",
        "Split work into HUMAN / AI-ASSIST / AUTO",
      ],
      data: [
        "Define the core data",
        "Define event and behavior logging",
        "AI Opportunity Map",
      ],
      scale: [
        "Define standard ways of working",
        "Remove owner-dependent work",
        "Review subscription / licensing / partner structures",
      ],
    },
    maturityLevels: {
      1: "Undefined",
      2: "Aware",
      3: "Organized",
      4: "Operating",
      5: "Systemized",
    },
    maturityAnchors: {
      value: {
        1: "The problem customers are trying to solve and the value you provide have not been worked out yet.",
        2: "You can name the problem you are solving, but you cannot yet define it in one sentence or explain it against the existing alternatives.",
        3: "The core problem and the differentiator are written down, but it has not been confirmed that they match the value real customers want.",
        4: "The value proposition is actually used in sales and marketing, and you can explain why customers pay.",
        5: "The value proposition is confirmed against customer interviews and purchase and churn data, and is updated regularly.",
      },
      customer: {
        1: "Who your customers are has not been defined specifically.",
        2: "You have a rough sense of your customer base, but you do not separate users from buyers or distinguish needs by customer.",
        3: "Core customers, buyers and users are defined, but what triggers a purchase decision is still an assumption.",
        4: "The customer definition and the buying triggers are actually used to decide who to market and sell to.",
        5: "You confirm and update the customer definition using conversion and retention data by customer segment.",
      },
      offer: {
        1: "What you sell and at what price changes from customer to customer and case to case.",
        2: "You have a core product, but no basis for pricing and no structure leading to a next offer.",
        3: "The core product and the basis for pricing are settled, but the entry → core → premium ladder and recurring revenue are still at the design stage.",
        4: "The product ladder and the pricing structure are applied in actual sales, and some recurring revenue is coming in.",
        5: "You adjust your product lineup and prices using conversion rate, average order value and repurchase data for each product.",
      },
      experience: {
        1: "It is not clear how customers come to know you or where they leave.",
        2: "You can guess the main acquisition channels, but the journey after purchase and the drop-off points are not managed.",
        3: "The journey from interest to repurchase is mapped, but the quality of the experience varies with whoever handles it.",
        4: "The customer journey you designed is actually in operation, and you identify and act on the main drop-off points.",
        5: "You track conversion and drop-off data at each stage of the journey and keep improving the experience.",
      },
      process: {
        1: "Work is handled case by case on someone's judgment, with no set flow.",
        2: "The workflow exists in people's heads but is not written down, and there is a lot of repetitive manual work.",
        3: "The main processes are written down, but the roles of people and systems are only partly separated.",
        4: "Work runs according to the defined process, and most of it continues even when the owner or a particular employee is away.",
        5: "You measure how the process performs, automate repetitive work and keep improving it.",
      },
      data: {
        1: "Almost no customer behavior or service usage data is recorded.",
        2: "Some data accumulates, but what you collect and why is not defined.",
        3: "The data to collect and the purpose are defined, but it is only occasionally used for decisions.",
        4: "You actually improve the customer experience or your operations on the basis of data.",
        5: "Data is the basis for decisions, and specific points for AI and automation are running in practice.",
      },
      scale: {
        1: "As revenue grows, the owner's working hours grow by just as much.",
        2: "You feel the need to scale, but there are no work standards or manuals.",
        3: "Some work is standardized, but it is still hard for someone else to deliver the same quality.",
        4: "Standards and manuals let other people deliver the same quality, and a recurring revenue structure is working.",
        5: "The operating load does not grow in proportion to revenue, and you scale through subscription, licensing and partner structures.",
      },
    },
    riskSignals: {
      founder_bottleneck: {
        title: "Owner-dependency bottleneck",
        message:
          "Work is tied to the owner, so growth is likely to be capped by the owner's time.",
      },
      scaling_without_structure: {
        title: "Scaling without structure",
        message:
          "You are growing in scale while the definition of value is still blurry. The further you expand, the more customer churn and price pressure can grow.",
      },
      automation_before_process: {
        title: "Automating before organizing",
        message:
          "Your workflows are less organized than your use of data and AI. Automating a process that has not been organized automates the inefficiency along with it.",
      },
      offer_without_customer: {
        title: "Offers designed without a customer",
        message:
          "The product structure is in place, but the definition of the core customer is weak. The offer may have been designed from the provider's point of view rather than the customer's.",
      },
      invisible_churn: {
        title: "Invisible churn",
        message:
          "You cannot see where or why customers leave, so improvement ends up relying on instinct.",
      },
    },
    hypotheses: {
      value:
        "Value may have been defined from the provider's point of view, without customer interviews.",
      customer:
        "You may have started from a definition as broad as “anyone is a customer” and never narrowed it down to a core customer.",
      offer:
        "Handling every customer request as a custom job may have kept the offer from ever being standardized.",
      experience:
        "Focusing on acquisition and the first purchase may have left the experience after purchase undesigned.",
      process:
        "With the owner making most of the calls personally, there may never have been an occasion to write the workflow down.",
      data: "Treating data as something to look at later may have left it undecided what to record and why.",
      scale:
        "Operating on the assumption that “only the owner can deliver the quality” may have kept pushing standardization back.",
    },
    feedback: {
      question: "Does this result match your actual situation?",
      fitLabel: "How well the result fits",
      fitScale: "1 not at all · 5 very accurate",
      fitThanks: "Thank you. Your feedback is used to improve the next diagnostic.",
      fitError: "We could not save your feedback.",
      outcomeToggle: "Tell us more for a more accurate analysis (optional)",
      outcomeThanks: "Thank you for letting us know.",
      outcomeNotice:
        "This is optional, and there is no disadvantage if you leave it blank. It is used to improve diagnostic accuracy and for statistics. If you consented to the collection of personal information, it is stored together with your name and email, and the identifying information is deleted after one year.",
      revenueLabel: "Annual revenue",
      growthLabel: "Revenue change over the last 12 months",
      outcomeSubmit: "I have read the notice and submit",
      selectAtLeastOne: "Please select at least one.",
      alreadySubmitted: "This has already been submitted.",
      saveError: "We could not save it. Please try again.",
      revenueBands: {
        pre_revenue: "Pre-revenue",
        lt_100m: "Under ₩100M",
        "100m_1b": "₩100M–1B",
        "1b_5b": "₩1B–5B",
        "5b_10b": "₩5B–10B",
        gte_10b: "₩10B or more",
      },
      growthBands: {
        decline: "Declining",
        flat: "Flat (±10%)",
        "10_50": "10–50% growth",
        "50_100": "50–100% growth",
        gte_100: "2x or more",
        lt_1y: "Less than a year in business",
      },
    },
  },
  consult: {
    backToResult: "← Back to your results",
    title: "Apply for a Structure Diagnostic Session",
    // Same ICU `select` as ko: "yes" when assessment.name is set, "other"
    // for an anonymous diagnosis. English needs no honorific, only the
    // difference between a named and an unnamed diagnosis.
    subtitle:
      "We will build the session around {hasName, select, yes {the diagnostic results for {name}} other {your diagnostic results}}.",
    // Label above the recap card. The price and format themselves live only
    // in result.sessionOffer; this screen reads them back from there.
    offerLabel: "What you are applying for",
    anonymous: {
      name: "Name *",
      namePlaceholder: "Jane Doe",
      email: "Email to contact you at *",
      emailPlaceholder: "you@example.com",
    },
    namedEmail: {
      label: "Email to contact you at",
      notice:
        "We will contact you at the email you entered when you started the diagnostic.",
    },
    message: "Anything you would like to tell us (optional)",
    submit: "Apply for the session",
    submitting: "Submitting...",
    error: "We could not submit your request. Please try again.",
    success: {
      title: "Your request has been received",
      // No payment is taken in this form, so say what actually happens next.
      description: "We will email {email} about scheduling and payment.",
      home: "Back to the start",
      viewResult: "View your results again",
    },
  },
  // Translation of the reviewed Korean policy. It is provided for
  // convenience only -- `translationNotice` says so on the page, and the
  // Korean version prevails. Company details come from companyFor(locale).
  privacy: {
    title: "Privacy Policy",
    intro:
      "In operating the PBA 7-Layer Business Radar (the “Service”), {company} (the “Company”) establishes and discloses the following privacy policy in accordance with the Personal Information Protection Act of Korea, so that it can protect the personal information of data subjects and handle related grievances promptly and smoothly.",
    effectiveDate: "September 20, 2026",
    effectiveDateLabel: "Effective date: {date}",
    translationNotice:
      "This is a translation provided for convenience. The Korean version prevails.",
    section1: {
      title: "1. Purposes of Processing Personal Information",
      intro:
        "The Company processes personal information for the purposes below, and will obtain consent in advance if those purposes change.",
      items: [
        "Sending the diagnostic result report (PDF) by email",
        "Receiving requests for a consultation (consulting) based on diagnostic results, and providing guidance and contact",
        "Providing marketing information (with separate consent): newsletter and insight emails, seminar and program announcements, announcements of new services and events",
        "Statistical analysis and improvement of service usage (on the basis of information that does not identify individuals)",
        "Research on and improvement of the diagnostic methodology (limited to information processed into a form in which individuals cannot be identified)",
      ],
    },
    section2: {
      title: "2. Personal Information Items Processed",
      intro:
        "You can use the diagnostic without consenting to the collection and use of personal information (an anonymous diagnostic). In that case we do not collect information that can identify an individual, such as a name or email.",
      table: {
        head: ["Category", "Items", "When collected"],
        rows: [
          [
            "Required (with consent)",
            "Name, email address",
            "When you consent to the collection and use of personal information at the start of the diagnostic",
          ],
          [
            "Optional (with consent)",
            "Company / brand name, role",
            "When you consent to the collection and use of personal information at the start of the diagnostic",
          ],
          [
            "Required (when requesting a consultation)",
            "Name, email address, consultation request message (optional)",
            "When you request a consultation after an anonymous diagnostic, collected with consent obtained on the request screen",
          ],
          [
            "Diagnostic information",
            "Business stage, industry, team size, question responses and diagnostic results, result-fit rating, annual revenue and last-12-month growth band (optional entry)",
            "During the diagnostic (including anonymous diagnostics). In an anonymous diagnostic this information alone cannot identify an individual. If you consent to the collection of personal information or request a consultation, it is processed as personal information together with your name and email.",
          ],
          [
            "Automatically collected",
            "Cookie identifiers, pages visited and usage events, device and browser information, referral source (UTM)",
            "While using the service (see section 6)",
          ],
        ],
      },
      note: "The Company does not collect personal information from children under the age of 14.",
    },
    section3: {
      title: "3. Processing and Retention Periods",
      items: [
        "Personal information collected for a diagnostic or a consultation request: one year from the date of collection. However, if the data subject withdraws consent or requests deletion, it is destroyed without delay.",
        "Consent to receive marketing information: one year from the date of collection, or until that consent is withdrawn, whichever comes first",
        "Temporarily saved information from a diagnostic that was not completed: 30 days from the date of the last entry",
        "Diagnostic information that cannot identify an individual: may be retained for service improvement and statistical purposes.",
        "Where a consulting contract has been concluded, information may be retained for the period set out in the contract in order to perform the contract and to run a follow-up diagnostic.",
        "When personal information is destroyed, freely entered information such as industry and the referral source (UTM) information are deleted along with it, so that the remaining diagnostic information cannot identify an individual.",
      ],
    },
    section4: {
      title: "4. Procedure and Method for Destroying Personal Information",
      body: "Personal information whose retention period has passed or whose processing purpose has been achieved is destroyed without delay. Information held in the form of electronic files is permanently deleted by a method that makes it unrecoverable.",
    },
    section5: {
      title: "5. Provision to Third Parties and Outsourcing of Processing",
      intro:
        "The Company does not provide the personal information of data subjects to third parties. It outsources processing as follows in order to operate the service.",
      table: {
        head: ["Processor", "Outsourced work", "Storage location"],
        rows: [
          [
            "Supabase, Inc.",
            "Operation of the database and the operator authentication system",
            "Republic of Korea (AWS Seoul region)",
          ],
          [
            "Amazon Web Services, Inc.",
            "Web service hosting",
            "Republic of Korea (Seoul region)",
          ],
        ],
      },
      note: "In outsourcing contracts, the Company sets out the relevant requirements and supervises the processor so that personal information is managed safely.",
    },
    section6: {
      title:
        "6. Installation and Operation of Automatic Collection Devices (Cookies), and How to Refuse Them",
      paragraphs: [
        "The Company uses Google Analytics 4 to analyze usage statistics, and cookies are installed in the process. Cookies do not contain directly identifying information such as a name or email address.",
        "If you do not want cookies stored, you can block cookies in your browser settings or install the Google Analytics Opt-out Browser Add-on (tools.google.com/dlpage/gaoptout). Blocking cookies places no restriction on using the diagnostic.",
      ],
    },
    section7: {
      title: "7. Transfer of Personal Information Abroad",
      intro:
        "The following information is transferred abroad as a result of using Google Analytics 4.",
      table: {
        head: ["Item", "Details"],
        rows: [
          ["Recipient", "Google LLC (contact: privacy.google.com/contact)"],
          ["Country of transfer", "United States"],
          [
            "Items transferred",
            "Cookie identifiers, pages visited and usage events, device and browser information",
          ],
          [
            "Date and method of transfer",
            "Transmitted over the network while the service is used",
          ],
          ["Purpose of use", "Statistical analysis of service usage"],
          [
            "Retention period",
            "The data retention period set in Google Analytics (up to 14 months)",
          ],
          [
            "How to refuse, and the effect of refusing",
            "You can refuse by the method in section 6, and refusing places no restriction on your use of the service.",
          ],
        ],
      },
    },
    section8: {
      title: "8. Rights and Obligations of Data Subjects and How to Exercise Them",
      body: "Data subjects may at any time ask the Company to give access to, correct or delete their personal information, to suspend its processing, or to withdraw their consent. If you send a request by email to the privacy officer below, we will act on it without delay (within 10 days). You may also exercise these rights through a legal representative or an authorized agent.",
    },
    section9: {
      title: "9. Measures to Secure Personal Information",
      items: [
        "Keeping the number of operators who can access personal information to a minimum, and managing accounts and permissions separately",
        "Database access control (row-level security policies) and management of server-only authentication keys",
        "Encryption in transit (HTTPS)",
        "Invalidating existing login sessions when an operator changes their password",
        "Retaining access records for the operator-facing system that handles personal information — the account used, the time of access, the source IP address, and the action performed — for at least one year, and reviewing them at least once a month",
      ],
    },
    section10: {
      title: "10. Privacy Officer",
      table: {
        head: ["Category", "Details"],
        rowLabels: ["Name", "Email", "Contact"],
      },
    },
    section11: {
      title: "11. Remedies for Infringement of Rights",
      intro:
        "To obtain relief for an infringement of your personal information, you may apply to the bodies below for dispute resolution or advice.",
      items: [
        "Personal Information Dispute Mediation Committee (개인정보분쟁조정위원회): 1833-6972 (www.kopico.go.kr)",
        "Personal Information Infringement Report Center (개인정보침해신고센터): 118 (privacy.kisa.or.kr)",
        "Supreme Prosecutors' Office (대검찰청): 1301 (www.spo.go.kr)",
        "National Police Agency (경찰청): 182 (ecrm.police.go.kr)",
      ],
    },
    section12: {
      title: "12. Changes to This Privacy Policy",
      body: "This privacy policy applies from {date}. If its contents change, we will give notice through the service from 7 days before the change takes effect.",
    },
  },
  metadata: {
    siteTitle: "PBA 7-Layer Business Radar",
    siteDescription:
      "In five minutes you can see where your business is structurally blocked.",
    privacyTitle: "Privacy Policy",
    noticeTitle: "Notices",
  },
} satisfies Messages;

export default en;
