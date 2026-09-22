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
  landing: {},
  basicInfo: {},
  wizard: {},
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
