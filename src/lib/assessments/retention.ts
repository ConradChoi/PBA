import { z } from "zod";

export const RETENTION_UNITS = [
  { value: "days", label: "일" },
  { value: "months", label: "개월" },
  { value: "years", label: "년" },
] as const;

export type RetentionUnit = (typeof RETENTION_UNITS)[number]["value"];

export const retentionSchema = z.union([
  z.object({ reset: z.literal(true) }),
  z.object({
    amount: z.number().int().min(1).max(120),
    unit: z.enum(["days", "months", "years"]),
    // Required: keeping personal data past the published retention needs a
    // reason someone can audit later.
    reason: z.string().min(1).max(500),
  }),
]);

export function retentionUntil(
  amount: number,
  unit: RetentionUnit,
  from: Date = new Date()
): string {
  const until = new Date(from.getTime());

  if (unit === "days") {
    until.setUTCDate(until.getUTCDate() + amount);
    return until.toISOString();
  }

  const months = unit === "months" ? amount : amount * 12;
  const day = until.getUTCDate();
  until.setUTCDate(1);
  until.setUTCMonth(until.getUTCMonth() + months);
  // setUTCMonth would roll 31 Aug + 6 months into March; clamp to the last
  // day the target month actually has.
  const lastDay = new Date(
    Date.UTC(until.getUTCFullYear(), until.getUTCMonth() + 1, 0)
  ).getUTCDate();
  until.setUTCDate(Math.min(day, lastDay));

  return until.toISOString();
}
