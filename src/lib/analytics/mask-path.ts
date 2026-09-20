const UUID = "[0-9a-fA-F-]{36}";

// Single source of truth: used directly on the server and serialized into
// the inline gtag snippet so both mask identically.
const MASK_RULES: [RegExp, string][] = [
  [new RegExp(`/diagnose/result/${UUID}`), "/diagnose/result/:id"],
  [new RegExp(`/diagnose/${UUID}`), "/diagnose/:draftId"],
];

export function maskAnalyticsPath(path: string): string {
  return MASK_RULES.reduce(
    (masked, [pattern, replacement]) => masked.replace(pattern, replacement),
    path
  );
}

export const MASK_RULES_JS = JSON.stringify(
  MASK_RULES.map(([pattern, replacement]) => [pattern.source, replacement])
);
