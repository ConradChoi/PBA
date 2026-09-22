import { z } from "zod";
import ko from "@/i18n/messages/ko";

// Coarse bands only: they describe the business, not the person. Codes are
// stored values (order matters for display); labels live in
// messages.result.feedback.{revenueBands,growthBands} since ResultFeedback
// and the admin detail page both need them, in whatever locale each reads.
export const REVENUE_BAND_VALUES = [
  "pre_revenue",
  "lt_100m",
  "100m_1b",
  "1b_5b",
  "5b_10b",
  "gte_10b",
] as const;

export const GROWTH_BAND_VALUES = [
  "decline",
  "flat",
  "10_50",
  "50_100",
  "gte_100",
  "lt_1y",
] as const;

export type RevenueBand = (typeof REVENUE_BAND_VALUES)[number];
export type GrowthBand = (typeof GROWTH_BAND_VALUES)[number];

export const resultFitSchema = z.object({
  resultFit: z.number().int().min(1).max(5),
});

export const outcomeSchema = z
  .object({
    revenueBand: z.enum(REVENUE_BAND_VALUES).nullable(),
    growthBand: z.enum(GROWTH_BAND_VALUES).nullable(),
  })
  .refine((data) => data.revenueBand !== null || data.growthBand !== null, {
    // Not shown to a real user today: ResultFeedback validates this
    // client-side before ever calling the API (see saveOutcome), so this
    // refinement only fires for a direct/malformed API call, and the
    // client ignores this field on non-409 failures in favor of its own
    // translated message. Kept as a defensive backend guard; reusing the
    // same Korean copy here instead of a second hardcoded literal.
    message: ko.result.feedback.selectAtLeastOne,
  });
