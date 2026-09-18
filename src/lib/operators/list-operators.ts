import { createServiceRoleSupabaseClient } from "../supabase/server";
import { parseOperatorRole, type OperatorRole } from "./operator-role";

export type OperatorListItem = {
  id: string;
  email: string;
  role: OperatorRole;
  created_at: string;
};

export async function listOperators(): Promise<OperatorListItem[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw new Error(error.message);
  }

  return data.users
    .flatMap((u) => {
      const role = parseOperatorRole(u.app_metadata);
      return role
        ? [{ id: u.id, email: u.email ?? "", role, created_at: u.created_at }]
        : [];
    })
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}
