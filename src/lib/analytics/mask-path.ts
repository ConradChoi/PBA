const UUID = "[0-9a-fA-F-]{36}";

// Single source of truth: used directly on the server and serialized into
// the inline gtag snippet so both mask identically.
//
// Ordering note: each rule runs against the output of the previous one, so a
// rule that already replaced an id must not be re-matched by a later rule.
// The `/diagnose/...` and `/admin/...` rules below never overlap (disjoint
// path prefixes), so their relative order is safe either way.
const MASK_RULES: [RegExp, string][] = [
  [new RegExp(`/diagnose/result/${UUID}`), "/diagnose/result/:id"],
  [new RegExp(`/diagnose/${UUID}`), "/diagnose/:draftId"],
  [new RegExp(`/admin/assessments/${UUID}`), "/admin/assessments/:id"],
  [new RegExp(`/admin/consulting-requests/${UUID}`), "/admin/consulting-requests/:id"],
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
