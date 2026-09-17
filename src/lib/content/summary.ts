import type { ArchitectureLevel, LayerId } from "../types/assessment";
import { ARCHITECTURE_LEVEL_COPY } from "./architecture-level-copy";
import { BOTTLENECK_COPY } from "./bottleneck-copy";

export function buildSummaryParagraph(
  level: ArchitectureLevel,
  lowestLayerId: LayerId
): string {
  return `${ARCHITECTURE_LEVEL_COPY[level]} ${BOTTLENECK_COPY[lowestLayerId]}`;
}
