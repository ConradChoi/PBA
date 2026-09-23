import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Regression guard for the incident fixed in ed486cc: middleware.ts sat at
// the repo root, but this project keeps its code under src/, so Next only
// loaded src/middleware.ts and the admin auth middleware never ran. That let
// unauthenticated requests reach rendering, where the admin dashboard
// layout's redirect fired only after sibling pages had already rendered
// their data into the response body.
//
// This test is a fast, static check of two things: the middleware file's
// location, and that its matcher still actually covers the admin routes it
// exists to protect. It does NOT execute the middleware and cannot verify
// that unauthenticated requests are actually blocked — that requires a real
// running server, which is what scripts/check-admin-no-leak.mjs is for.
const repoRoot = path.resolve(__dirname, "..");

describe("middleware location and matcher", () => {
  it("does not exist at the repo root (Next would silently ignore src/middleware.ts otherwise)", () => {
    const rootMiddlewareCandidates = [
      "middleware.ts",
      "middleware.js",
      "middleware.mts",
      "middleware.mjs",
    ];

    for (const candidate of rootMiddlewareCandidates) {
      const candidatePath = path.join(repoRoot, candidate);
      expect(
        fs.existsSync(candidatePath),
        `${candidate} must not exist at the repo root — this project's code lives under src/, ` +
          `and Next.js only loads src/middleware.ts when a src/ directory is present. A root-level ` +
          `middleware file is silently ignored, which is exactly the bug fixed in ed486cc.`
      ).toBe(false);
    }
  });

  it("exists at src/middleware.ts", () => {
    const middlewarePath = path.join(repoRoot, "src", "middleware.ts");
    expect(fs.existsSync(middlewarePath)).toBe(true);
  });

  it("exports a config.matcher that still covers /admin/:path*", async () => {
    const middlewareModule = await import("./middleware");
    const config = (middlewareModule as { config?: { matcher?: unknown } }).config;

    expect(config, "src/middleware.ts must export a config object").toBeDefined();
    expect(
      Array.isArray(config?.matcher),
      "config.matcher must be an array of route patterns"
    ).toBe(true);

    const matcher = config!.matcher as string[];
    expect(
      matcher.includes("/admin/:path*"),
      `config.matcher must include "/admin/:path*" so the auth check runs on every admin route. ` +
        `Got: ${JSON.stringify(matcher)}`
    ).toBe(true);
  });

  it("exports a middleware function", async () => {
    const middlewareModule = await import("./middleware");
    expect(typeof (middlewareModule as { middleware?: unknown }).middleware).toBe("function");
  });
});
