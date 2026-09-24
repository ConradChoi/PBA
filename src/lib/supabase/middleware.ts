import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { buildAccessLogEntry } from "@/lib/access-logs/build-access-log-entry";
import { recordAccessLog } from "@/lib/access-logs/record-access-log";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";
  const isApiRoute = pathname.startsWith("/api/");

  // 접속기록 (「개인정보의 안전성 확보조치 기준」 제8조). This is the single
  // choke point for admin access: src/middleware.ts matches /admin/:path*
  // and /api/admin/:path*, and the user has just been resolved, so reads,
  // writes, refusals and unauthenticated attempts are all visible here and
  // nowhere else. recordAccessLog never throws and gives up after a couple of
  // seconds, so a log that cannot be written costs the operator neither their
  // panel nor a stalled request.
  //
  // One thing this choke point cannot see: logins. src/app/admin/login/page.tsx
  // calls supabase.auth.signInWithPassword() from the browser, which goes
  // straight to Supabase Auth and never reaches this application, so a failed
  // login — password guessing against an operator account — leaves nothing
  // here. A successful one is covered indirectly: the operator's next admin
  // request lands on this line and is recorded as `granted`. Brute-force
  // attempts have to be inspected in Supabase Auth Logs instead, which is
  // what the access-log screen tells the owner.
  const entry = buildAccessLogEntry({
    path: pathname,
    method: request.method,
    headers: request.headers,
    user,
  });

  if (entry) {
    await recordAccessLog(entry);
  }

  if (!user && !isLoginRoute) {
    // An /api/admin caller is fetch() inside the admin UI, not a browser
    // navigating. Handing it a 307 to the login page would arrive as the
    // login HTML and fail as a JSON parse error, hiding the real cause; a 401
    // says "your session is gone" in the shape the caller already handles.
    // The route handlers keep their own auth checks either way — this is the
    // outer layer, not a replacement for them.
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return response;
}
