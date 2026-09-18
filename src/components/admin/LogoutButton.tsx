"use client";

import { useRouter } from "next/navigation";
import { createAuthBrowserClient } from "@/lib/supabase/auth-browser";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createAuthBrowserClient();
    // "local" ends only this browser's session; the default ("global")
    // would also sign the operator out on every other device.
    await supabase.auth.signOut({ scope: "local" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-500"
    >
      로그아웃
    </button>
  );
}
