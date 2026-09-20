import { z } from "zod";

// Coarse bands only: they describe the business, not the person.
export const REVENUE_BANDS = [
  { value: "pre_revenue", label: "매출 전" },
  { value: "lt_100m", label: "1억 미만" },
  { value: "100m_1b", label: "1~10억" },
  { value: "1b_5b", label: "10~50억" },
  { value: "5b_10b", label: "50~100억" },
  { value: "gte_10b", label: "100억 이상" },
] as const;

export const GROWTH_BANDS = [
  { value: "decline", label: "감소" },
  { value: "flat", label: "정체(±10%)" },
  { value: "10_50", label: "10~50% 성장" },
  { value: "50_100", label: "50~100% 성장" },
  { value: "gte_100", label: "2배 이상" },
  { value: "lt_1y", label: "1년 미만 사업" },
] as const;

export type RevenueBand = (typeof REVENUE_BANDS)[number]["value"];
export type GrowthBand = (typeof GROWTH_BANDS)[number]["value"];

const revenueBandValues = REVENUE_BANDS.map((band) => band.value) as [
  RevenueBand,
  ...RevenueBand[],
];
const growthBandValues = GROWTH_BANDS.map((band) => band.value) as [
  GrowthBand,
  ...GrowthBand[],
];

export const resultFitSchema = z.object({
  resultFit: z.number().int().min(1).max(5),
});

export const outcomeSchema = z
  .object({
    revenueBand: z.enum(revenueBandValues).nullable(),
    growthBand: z.enum(growthBandValues).nullable(),
  })
  .refine((data) => data.revenueBand !== null || data.growthBand !== null, {
    message: "한 가지 이상 선택해주세요.",
  });

export function revenueBandLabel(value: string | null): string {
  return REVENUE_BANDS.find((band) => band.value === value)?.label ?? "-";
}

export function growthBandLabel(value: string | null): string {
  return GROWTH_BANDS.find((band) => band.value === value)?.label ?? "-";
}
