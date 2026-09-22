import type { Locale } from "@/i18n/locales";

// Korean identity on the Korean site; the English block everywhere else.
const KO = {
  name: "주식회사 일리아",
  ceo: "최종훈",
  ceoTitle: "대표",
  businessNumberLabel: "사업자등록번호",
  businessNumber: "832-86-03446",
  address: "경기도 광명시 오리로 362 4층",
  email: "info@ylia.io",
  phone: "010-9025-5093",
};

const EN = {
  name: "YLIA Co., Ltd.",
  ceo: "Choi Jong Hoon",
  ceoTitle: "CEO",
  businessNumberLabel: "Business Registration No.",
  businessNumber: "832-86-03446",
  address: "4F, 362 Ori-ro, Gwangmyeong-si, Gyeonggi-do, Republic of Korea",
  email: "info@ylia.io",
  phone: "+82-10-9025-5093",
};

export const COMPANY_LEGAL_NAME_EN = "YLIA Co., Ltd.";

export function companyFor(locale: Locale) {
  return locale === "ko" ? KO : EN;
}
