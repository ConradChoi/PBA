// The admin routes only an `owner` may reach. The authoritative check still
// lives inside each page/route handler (`operator.role !== "owner"`), because
// that is what actually stops the render; this list exists so the access log
// can name the same boundary one layer earlier, in middleware, where the
// request is first seen.
//
// Middleware can tell owner from staff without a database read: Supabase puts
// the operator role in `app_metadata`, which `supabase.auth.getUser()` already
// returns (see src/lib/operators/operator-role.ts). Without this list the log
// would record a staff account probing /admin/operators as `granted`, which is
// precisely the insider behaviour a monthly inspection exists to catch.
//
// Keeping the two in step is not left to memory:
// src/lib/operators/owner-only-paths.guard.test.ts fails if a page or route
// handler gains an owner check whose path is missing here.
export const OWNER_ONLY_ADMIN_PATHS = [
  "/admin/operators",
  "/admin/access-logs",
  "/api/admin/operators",
] as const;

export function isOwnerOnlyAdminPath(path: string): boolean {
  return OWNER_ONLY_ADMIN_PATHS.some(
    (ownerPath) => path === ownerPath || path.startsWith(`${ownerPath}/`)
  );
}
