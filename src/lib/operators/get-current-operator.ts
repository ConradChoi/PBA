import { createAuthServerClient } from "../supabase/auth-server";

export type OperatorRole = "owner" | "staff";

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

  const role = (user.app_metadata?.role as OperatorRole | undefined) ?? "staff";

  return { id: user.id, email: user.email, role };
}
