export type MaturityLevel = 1 | 2 | 3 | 4 | 5;

// The layer raw score is the sum of its four 1-5 answers, so the level is
// the rounded average: a layer reaches the level its answers describe.
export function maturityLevel(raw: number): MaturityLevel {
  if (raw < 4 || raw > 20) {
    throw new RangeError(`layer raw score must be between 4 and 20, got ${raw}`);
  }
  if (raw >= 18) return 5;
  if (raw >= 14) return 4;
  if (raw >= 10) return 3;
  if (raw >= 6) return 2;
  return 1;
}
