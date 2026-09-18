import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentOperator } from "@/lib/operators/get-current-operator";
import { changePasswordSchema } from "@/lib/operators/change-password.schema";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const operator = await getCurrentOperator();

  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verify the current password on a throwaway client so the operator's own
  // cookie session is untouched.
  const verifier = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data: verified, error: verifyError } = await verifier.auth.signInWithPassword({
    email: operator.email,
    password: parsed.data.currentPassword,
  });

  if (verifyError || !verified.session) {
    return NextResponse.json({ error: "현재 비밀번호가 올바르지 않습니다." }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.auth.admin.updateUserById(operator.id, {
    password: parsed.data.newPassword,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Supabase revokes every session of the user on a password change (other
  // devices included, which is intended). Sign this browser back in so the
  // operator isn't bounced to the login page right after changing it.
  const authClient = await createAuthServerClient();
  await authClient.auth.signInWithPassword({
    email: operator.email,
    password: parsed.data.newPassword,
  });

  return NextResponse.json({ ok: true });
}
