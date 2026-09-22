// Stored in the existing assessments.team_size column. Rows created before
// this change hold free text, so a legacy value that isn't one of these
// codes is shown as-is by the caller.
export const TEAM_SIZE_VALUES = [
  "solo",
  "2_5",
  "6_20",
  "21_50",
  "51_200",
  "gt_200",
] as const;

export type TeamSizeBand = (typeof TEAM_SIZE_VALUES)[number];
