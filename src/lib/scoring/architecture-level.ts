import type { ArchitectureLevel } from "../types/assessment";

export function classifyArchitectureLevel(totalRaw: number): ArchitectureLevel {
  if (totalRaw < 28 || totalRaw > 140) {
    throw new RangeError(`totalRaw must be between 28 and 140, got ${totalRaw}`);
  }
  if (totalRaw >= 120) return "SYSTEMIZED";
  if (totalRaw >= 95) return "GROWTH_READY";
  if (totalRaw >= 70) return "STRUCTURE_NEEDED";
  if (totalRaw >= 40) return "FOUNDER_DEPENDENT";
  return "IDEA_STAGE";
}
