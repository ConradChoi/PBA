import type { BusinessStage } from "@/lib/types/assessment";

export const BUSINESS_STAGE_VALUES: BusinessStage[] = [
  "idea",
  "mvp_prep",
  "building",
  "operating",
  "growth",
  "realign",
  "other",
];

// The label comes from messages; the free text the person typed does not.
export function formatBusinessStage(label: string, other: string | null, stage: BusinessStage) {
  return stage === "other" && other ? `${label} (${other})` : label;
}
