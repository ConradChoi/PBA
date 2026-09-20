import type { MaturityLevel } from "../scoring/maturity";

// Names mirror the answer scale (요구사항 6장), so the level a layer reaches
// means the same thing as the answers the person gave.
export const MATURITY_LEVELS: Record<MaturityLevel, string> = {
  1: "미정의",
  2: "인식",
  3: "정리",
  4: "운영",
  5: "체계화",
};
