import { createAuthServerClient } from "../supabase/auth-server";
import { parseOperatorRole, type OperatorRole } from "./operator-role";

export type { OperatorRole };

export type CurrentOperator = {
  id: string;
  email: string;
  role: OperatorRole;
};

export async function getCurrentOperator(): Promise<CurrentOperator | null> {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  const role = parseOperatorRole(user.app_metadata);

  if (!role) {
    return null;
  }

  return { id: user.id, email: user.email, role };
}
