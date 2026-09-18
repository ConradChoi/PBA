export type OperatorRole = "owner" | "staff";

// Only accounts explicitly given a role in app_metadata are operators.
// app_metadata can only be written with the service role key, so a user
// who somehow gets a Supabase Auth account can't grant themselves access.
export function parseOperatorRole(appMetadata: unknown): OperatorRole | null {
  const role = (appMetadata as { role?: unknown } | null | undefined)?.role;
  return role === "owner" || role === "staff" ? role : null;
}
