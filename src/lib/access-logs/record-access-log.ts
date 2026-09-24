import { createClient } from "@supabase/supabase-js";
import type { AccessLogEntry } from "./build-access-log-entry";

// The write half of admin access logging. Called from src/middleware.ts,
// which is the one place that sees every admin request — /admin/* pages and
// /api/admin/* writes alike — before anything else decides what to do with it.
//
// Three rules govern everything here:
//
//  1. Logging must never break admin access. A compliance record is not
//     worth locking the operator out of their own panel, so every failure
//     (unreachable database, missing key, revoked grant) is swallowed. The
//     console.error is what shows up in the Amplify/CloudWatch logs if the
//     table ever stops recording.
//  2. Logging must never *stall* admin access either. Swallowing failures
//     only covers a database that is down; a database that is merely slow
//     would hold every admin request open until the platform timeout,
//     because this write is awaited. The write is therefore abandoned after
//     LOG_WRITE_TIMEOUT_MS and the request carries on without a row — a
//     missing row is a smaller harm than an unusable panel, and the
//     console.error says which one happened.
//  3. The insert is awaited rather than fired and forgotten. An un-awaited
//     promise in a serverless/edge function can be killed the moment the
//     response is returned, which loses exactly the rows an investigation
//     would want. At this traffic level one bounded round trip per admin
//     request is cheaper than an unreliable log.
//
// The service-role client is built here rather than reused from
// lib/supabase/server.ts: that module opens with `import "server-only"`,
// which throws anywhere outside a Server Component module graph. Middleware
// is not one, so importing it breaks both the middleware bundle and
// src/middleware.guard.test.ts (which imports the middleware to check its
// matcher). The service role is required either way, because
// admin_access_logs grants nothing to anon or authenticated.

// Two seconds: long enough that an ordinary Supabase round trip from the edge
// never reaches it, short enough that an operator whose write is being
// dropped notices a pause rather than a hang.
export const LOG_WRITE_TIMEOUT_MS = 2000;

const TIMED_OUT = Symbol("access-log-timeout");

function createLogClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    global: {
      // The race below stops us *waiting*; this stops the request itself from
      // staying open on the runtime after we have given up on it.
      fetch: (input, init) =>
        fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(LOG_WRITE_TIMEOUT_MS) }),
    },
  });
}

export async function recordAccessLog(entry: AccessLogEntry): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    const write = createLogClient().from("admin_access_logs").insert(entry);

    // Both outcomes are handled on the write's own promise, so abandoning it
    // below cannot surface later as an unhandled rejection.
    const settled = Promise.resolve(write).then(
      ({ error }) => (error ? `insert failed: ${error.message}` : null),
      (error: unknown) => `insert threw: ${error}`
    );

    const result = await Promise.race([
      settled,
      new Promise<typeof TIMED_OUT>((resolve) => {
        timer = setTimeout(() => resolve(TIMED_OUT), LOG_WRITE_TIMEOUT_MS);
      }),
    ]);

    if (result === TIMED_OUT) {
      console.error(
        `[access-log] insert did not finish within ${LOG_WRITE_TIMEOUT_MS}ms; ` +
          "abandoned so the admin request could continue"
      );
    } else if (result) {
      // supabase-js returns errors instead of throwing them, so the first
      // branch of `settled` is the one that actually fires when the table or
      // grant is missing.
      console.error(`[access-log] ${result}`);
    }
  } catch (error) {
    console.error("[access-log] insert threw:", error);
  } finally {
    // Otherwise the pending timer keeps the runtime (and, in tests, the
    // event loop) alive for two seconds after every logged request.
    clearTimeout(timer);
  }
}
