// Stored in the existing assessments.team_size column. Rows created before
// this change hold free text, so formatting falls back to the raw value.
export const TEAM_SIZE_BANDS = [
  { value: "solo", label: "1명" },
  { value: "2_5", label: "2~5명" },
  { value: "6_20", label: "6~20명" },
  { value: "21_50", label: "21~50명" },
  { value: "51_200", label: "51~200명" },
  { value: "gt_200", label: "200명 이상" },
] as const;

export type TeamSizeBand = (typeof TEAM_SIZE_BANDS)[number]["value"];

export function formatTeamSize(value: string | null): string {
  if (!value) {
    return "-";
  }

  return TEAM_SIZE_BANDS.find((band) => band.value === value)?.label ?? value;
}
