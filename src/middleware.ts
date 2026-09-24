import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Both halves of the admin panel, deliberately. /admin/* is what an operator
// looks at; /api/admin/* is what an operator *does* — purging a person's
// personal data for good, changing a retention date, creating or deleting an
// operator account, deleting a notice, changing a password. 「개인정보의
// 안전성 확보조치 기준」 제8조 asks for 수행업무, and a matcher covering only
// /admin/* could answer "who looked" but never "who deleted".
//
// src/middleware.guard.test.ts pins both patterns so neither can be dropped
// by an edit that means to touch only the other.
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
