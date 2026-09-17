import type { LayerId, LayerScore } from "../types/assessment";

// Worst-first tie-break priority per spec section 10.
export const BOTTLENECK_TIE_BREAK_ORDER: LayerId[] = [
  "process",
  "customer",
  "value",
  "offer",
  "experience",
  "data",
  "scale",
];

// Spec section 11 does not define a strength tie-break order. We use the
// reverse of the bottleneck order (best-first) so a fully-tied assessment
// never reports the same layer as both a bottleneck and a strength.
export const STRENGTH_TIE_BREAK_ORDER: LayerId[] = [
  ...BOTTLENECK_TIE_BREAK_ORDER,
].reverse();

function sortWithPriority(
  layerScores: LayerScore[],
  direction: "asc" | "desc",
  tieBreakOrder: LayerId[]
): LayerScore[] {
  const priorityIndex = new Map(tieBreakOrder.map((id, index) => [id, index]));
  return [...layerScores].sort((a, b) => {
    const diff =
      direction === "asc" ? a.score100 - b.score100 : b.score100 - a.score100;
    if (diff !== 0) return diff;
    return priorityIndex.get(a.layerId)! - priorityIndex.get(b.layerId)!;
  });
}

export function findBottlenecks(layerScores: LayerScore[], count = 3): LayerId[] {
  return sortWithPriority(layerScores, "asc", BOTTLENECK_TIE_BREAK_ORDER)
    .slice(0, count)
    .map((l) => l.layerId);
}

export function findStrengths(layerScores: LayerScore[], count = 2): LayerId[] {
  return sortWithPriority(layerScores, "desc", STRENGTH_TIE_BREAK_ORDER)
    .slice(0, count)
    .map((l) => l.layerId);
}
