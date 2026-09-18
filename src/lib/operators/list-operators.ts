import { createServiceRoleSupabaseClient } from "../supabase/server";
import type { OperatorRole } from "./get-current-operator";

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
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      role: (u.app_metadata?.role as OperatorRole | undefined) ?? "staff",
      created_at: u.created_at,
    }))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}
