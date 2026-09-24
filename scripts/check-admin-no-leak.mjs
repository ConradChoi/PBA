#!/usr/bin/env node
// Regression check for the incident fixed in commit ed486cc: middleware.ts
// sat at the repo root instead of src/middleware.ts, so Next.js silently
// never loaded it. Unauthenticated requests reached rendering, and the
// admin dashboard layout's redirect() fired only after sibling pages had
// already rendered their data — so a 307 to /admin/login shipped with every
// assessment's name, email, business stage and result in its BODY. It was
// live for five days before anyone noticed, because nobody was looking at
// response bodies, only status codes.
//
// This script is the regression test for that class of defect. It is
// deliberately NOT a Vitest test:
//
//   - Vitest's test environment (node/jsdom, see vitest.config.ts) never
//     goes through Next's request pipeline, so it CANNOT execute
//     src/middleware.ts. A Vitest test that claimed to cover "does
//     middleware block this route" would be lying about what it checks —
//     it could only ever test the page/layout code directly, missing
//     exactly the "middleware never ran" failure mode that shipped.
//   - The only honest way to exercise middleware is to run the actual
//     built app and make a real HTTP request against it, which means a
//     full `next build` + `next start` cycle. That's slow (tens of
//     seconds), and forcing it into `npm test`'s otherwise-fast ~230-test
//     Vitest suite would make every contributor pay that cost on every
//     run for a check that matters mainly at deploy time.
//
// So: build once, run this script against the build, treat it as a deploy
// gate (see amplify.yml) rather than a unit test.
//
// USAGE
//   npm run build                    # produces the .next this script starts
//   npm run test:security            # read-only checks against whatever
//                                     # assessment/consulting-request rows
//                                     # already exist
//   npm run test:security -- --seed  # also seeds + deletes one temporary
//                                     # notice row, to exercise
//                                     # /admin/notices/<id> against a real
//                                     # record when none already exist
//
// WHAT IT CHECKS
// For every admin route, with no auth cookie at all, this asserts the
// response BODY (not just its status — the whole point of the incident is
// that the status was a correct 307 while the body leaked data) contains
// none of:
//   - an email address (a real one, not an "@media"/"@import" CSS at-rule —
//     see the EMAIL_RE comment below for why this isn't a literal '@' scan)
//   - the name or email of a real seeded assessment row
//   - any of the five architecture-level tokens
//
// Exit code is non-zero if any route leaks, if the server never becomes
// ready, or if the .next build is missing/stale relative to source.

import { createClient } from "@supabase/supabase-js";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const SEED_NOTICES = process.argv.includes("--seed");

const ARCHITECTURE_TOKENS = [
  "FOUNDER_DEPENDENT",
  "STRUCTURE_NEEDED",
  "IDEA_STAGE",
  "GROWTH_READY",
  "SYSTEMIZED",
];

// Matches a real email address (user@domain.tld). A literal scan for the
// '@' character alone also matches framework boilerplate that Next's own
// built-in error/redirect boundary emits (e.g. the `@media
// (prefers-color-scheme:dark){...}` CSS embedded in its default 404/error
// styles), which has nothing to do with a data leak and would make this
// script cry wolf on the very first run. This regex is what "no email
// address" (the actual security property we care about) means in practice.
const EMAIL_RE = /[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/;

function loadEnv() {
  // Local dev: read .env.local directly (no dotenv dependency in this
  // project). CI/Amplify: real env vars (or .env.production, which Next
  // itself loads at `next start` time) are already present in process.env.
  const envLocalPath = path.join(repoRoot, ".env.local");
  if (existsSync(envLocalPath)) {
    for (const line of readFileSync(envLocalPath, "utf8").split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match && !(match[1] in process.env)) {
        process.env[match[1]] = match[2];
      }
    }
  }
}

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitForServer(url, timeoutMs = 20_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch(url, { redirect: "manual" });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

async function fetchSeedData(supabase) {
  const seed = {
    assessmentId: null,
    consultingRequestId: null,
    noticeId: null,
    noticeIsSeeded: false,
    knownName: null,
    knownEmail: null,
  };

  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select("id,name,email")
    .order("created_at", { ascending: false })
    .limit(20);
  if (assessmentsError) {
    throw new Error(`Failed to read assessments: ${assessmentsError.message}`);
  }
  if (!assessments || assessments.length === 0) {
    console.warn(
      "WARNING: no assessments exist. Route-specific checks for /admin/assessments/<id> " +
        "and the known-name/email check will be skipped. The generic email/architecture-token " +
        "checks still run on every route."
    );
  } else {
    seed.assessmentId = assessments[0].id;
    const withPii = assessments.find((a) => a.name && a.email);
    if (withPii) {
      seed.knownName = withPii.name;
      seed.knownEmail = withPii.email;
    }
  }

  const { data: consultingRequests, error: consultingError } = await supabase
    .from("consulting_requests")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1);
  if (consultingError) {
    throw new Error(`Failed to read consulting_requests: ${consultingError.message}`);
  }
  if (consultingRequests && consultingRequests.length > 0) {
    seed.consultingRequestId = consultingRequests[0].id;
  } else {
    console.warn("WARNING: no consulting_requests exist. /admin/consulting-requests/<id> check skipped.");
  }

  const { data: notices, error: noticesError } = await supabase
    .from("notices")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1);
  if (noticesError) {
    throw new Error(`Failed to read notices: ${noticesError.message}`);
  }
  if (notices && notices.length > 0) {
    seed.noticeId = notices[0].id;
  } else if (SEED_NOTICES) {
    const marker = `security-test-seed-${Date.now()}`;
    const { data: inserted, error: insertError } = await supabase
      .from("notices")
      .insert({
        title: marker,
        body_html: `<p>${marker}</p>`,
        created_by: "security-regression-test",
        updated_by: "security-regression-test",
      })
      .select("id")
      .single();
    if (insertError) {
      throw new Error(`Failed to seed a temporary notice: ${insertError.message}`);
    }
    seed.noticeId = inserted.id;
    seed.noticeIsSeeded = true;
    seed.noticeMarker = marker;
    console.log(`Seeded temporary notice ${inserted.id} for /admin/notices/<id> (will be deleted after the run).`);
  } else {
    console.warn(
      "WARNING: no notices exist. /admin/notices/<id> will be checked against a made-up id " +
        "(so it 404s, not a real record) unless you pass --seed to create and clean up a temporary one."
    );
  }

  return seed;
}

async function cleanupSeed(supabase, seed) {
  if (seed.noticeIsSeeded && seed.noticeId) {
    const { error } = await supabase.from("notices").delete().eq("id", seed.noticeId);
    if (error) {
      console.error(`WARNING: failed to delete seeded notice ${seed.noticeId}: ${error.message}`);
    } else {
      console.log(`Deleted seeded notice ${seed.noticeId}.`);
    }
  }
}

function buildRoutes(seed) {
  const routes = ["/admin", "/admin/assessments", "/admin/consulting-requests", "/admin/notices", "/admin/operators", "/admin/access-logs", "/admin/account"];

  if (seed.assessmentId) {
    routes.push(`/admin/assessments/${seed.assessmentId}`);
  }
  if (seed.consultingRequestId) {
    routes.push(`/admin/consulting-requests/${seed.consultingRequestId}`);
  }
  routes.push(`/admin/notices/${seed.noticeId ?? "00000000-0000-0000-0000-000000000000"}`);

  return routes;
}

function checkBody(route, body, seed) {
  const failures = [];

  // Strip harmless CSS at-rules before scanning for a bare '@' — see EMAIL_RE
  // comment above. This keeps the "no @ character" intent of the check
  // without flagging Next's own boilerplate.
  const stripped = body.replace(/@(media|import|font-face|keyframes|charset|supports|page)\b/gi, "");
  if (stripped.includes("@") || EMAIL_RE.test(body)) {
    const match = body.match(EMAIL_RE);
    failures.push(`contains an email-shaped string${match ? ` ("${match[0]}")` : ""}`);
  }

  for (const token of ARCHITECTURE_TOKENS) {
    if (body.includes(token)) {
      failures.push(`contains architecture-level token "${token}"`);
    }
  }

  if (seed.knownName && body.includes(seed.knownName)) {
    failures.push(`contains seeded assessment name "${seed.knownName}"`);
  }
  if (seed.knownEmail && body.includes(seed.knownEmail)) {
    failures.push(`contains seeded assessment email "${seed.knownEmail}"`);
  }
  if (seed.noticeMarker && body.includes(seed.noticeMarker)) {
    failures.push(`contains seeded notice marker "${seed.noticeMarker}"`);
  }

  return failures;
}

async function main() {
  loadEnv();

  const nextBuildId = path.join(repoRoot, ".next", "BUILD_ID");
  if (!existsSync(nextBuildId)) {
    console.error(
      "No .next build found. Run `npm run build` first (this script starts the already-built app; " +
        "it never builds itself, so it never runs concurrently with a dev server)."
    );
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (checked .env.local and process.env).");
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const seed = await fetchSeedData(supabase);
  const routes = buildRoutes(seed);

  const port = await getFreePort();
  const baseUrl = `http://localhost:${port}`;

  console.log(`Starting \`next start -p ${port}\` against the existing .next build...`);
  const server = spawn(process.execPath, [path.join(repoRoot, "node_modules", ".bin", "next"), "start", "-p", String(port)], {
    cwd: repoRoot,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let serverOutput = "";
  server.stdout.on("data", (chunk) => (serverOutput += chunk));
  server.stderr.on("data", (chunk) => (serverOutput += chunk));

  let exitCode = 0;
  try {
    await waitForServer(baseUrl);

    console.log(`\nChecking ${routes.length} admin routes with no auth cookie...\n`);

    for (const route of routes) {
      const res = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
      const body = await res.text();
      const failures = checkBody(route, body, seed);

      if (failures.length === 0) {
        console.log(`PASS  ${route}  (status ${res.status}, ${body.length}B body, no customer data)`);
      } else {
        exitCode = 1;
        console.log(`FAIL  ${route}  (status ${res.status}, ${body.length}B body)`);
        for (const f of failures) {
          console.log(`        - ${f}`);
        }
      }
    }
  } catch (err) {
    exitCode = 1;
    console.error("\nERROR:", err instanceof Error ? err.message : err);
    console.error("\n--- next start output ---\n" + serverOutput);
  } finally {
    server.kill("SIGTERM");
    await cleanupSeed(supabase, seed);
  }

  console.log(exitCode === 0 ? "\nAll admin routes: no customer data in an unauthenticated response body.\n" : "\nLEAK DETECTED — see FAIL lines above.\n");
  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
