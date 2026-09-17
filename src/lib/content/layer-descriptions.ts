import type { LayerId } from "../types/assessment";

// Nothing in the requirements spec to transcribe here -- all 7 are
// placeholders, per design spec section D.
export const LAYER_DESCRIPTIONS: Record<LayerId, string> = {
  value: "[카피 필요: VALUE 설명 1줄]",
  customer: "[카피 필요: CUSTOMER 설명 1줄]",
  offer: "[카피 필요: OFFER 설명 1줄]",
  experience: "[카피 필요: EXPERIENCE 설명 1줄]",
  process: "[카피 필요: PROCESS 설명 1줄]",
  data: "[카피 필요: DATA & INTELLIGENCE 설명 1줄]",
  scale: "[카피 필요: SCALE 설명 1줄]",
};
