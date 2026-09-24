import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { isOwnerOnlyAdminPath, OWNER_ONLY_ADMIN_PATHS } from "./owner-only-paths";

// The access log decides `forbidden` from OWNER_ONLY_ADMIN_PATHS, but the
// real refusal happens inside the page or route handler. If someone adds an
// owner-only screen and forgets the list, a staff account probing it would be
// logged as an ordinary `granted` read — the one row the monthly inspection
// most needs to stand out. This test is the thing that remembers.
//
// It is a static scan, not an execution: it finds every admin page/route that
// compares a role against "owner" and asserts that its route path is covered.
const appRoot = path.resolve(__dirname, "..", "..", "app");

const OWNER_CHECK = /role\s*!==\s*"owner"|role\s*===\s*"owner"/;

function collectEntrypoints(dir: string, found: string[] = []): string[] {
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      collectEntrypoints(full, found);
    } else if (dirent.name === "page.tsx" || dirent.name === "route.ts") {
      found.push(full);
    }
  }
  return found;
}

// src/app/admin/(dashboard)/operators/page.tsx -> /admin/operators
function routePathOf(file: string): string {
  const relative = path.relative(appRoot, file);
  const segments = path
    .dirname(relative)
    .split(path.sep)
    // Route groups like (dashboard) and (site) are organisational only and
    // do not appear in the URL.
    .filter((segment) => segment !== "." && !segment.startsWith("("));
  return `/${segments.join("/")}`;
}

describe("OWNER_ONLY_ADMIN_PATHS", () => {
  const adminEntrypoints = [
    ...collectEntrypoints(path.join(appRoot, "admin")),
    ...collectEntrypoints(path.join(appRoot, "api", "admin")),
  ];

  it("finds the admin entrypoints at all (guards against the scan silently matching nothing)", () => {
    expect(adminEntrypoints.length).toBeGreaterThan(5);
  });

  it("covers every admin page and route handler that enforces an owner check", () => {
    const enforcing = adminEntrypoints.filter((file) =>
      OWNER_CHECK.test(fs.readFileSync(file, "utf8"))
    );

    expect(
      enforcing.length,
      "no admin entrypoint compares a role against \"owner\" any more — either the owner-only " +
        "screens were removed (delete this guard too) or the check moved somewhere this scan cannot see"
    ).toBeGreaterThan(0);

    const uncovered = enforcing
      .map((file) => ({ file, routePath: routePathOf(file) }))
      .filter(({ routePath }) => !isOwnerOnlyAdminPath(routePath));

    expect(
      uncovered.map(({ routePath }) => routePath),
      `every owner-only admin route must be listed in OWNER_ONLY_ADMIN_PATHS, or the access log ` +
        `records a staff account probing it as "granted". Currently listed: ` +
        `${JSON.stringify(OWNER_ONLY_ADMIN_PATHS)}`
    ).toEqual([]);
  });

  it("does not list a path that no longer has an owner check (a stale entry logs forbidden for nothing)", () => {
    const enforcingPaths = adminEntrypoints
      .filter((file) => OWNER_CHECK.test(fs.readFileSync(file, "utf8")))
      .map(routePathOf);

    for (const ownerPath of OWNER_ONLY_ADMIN_PATHS) {
      expect(
        enforcingPaths.some(
          (routePath) => routePath === ownerPath || routePath.startsWith(`${ownerPath}/`)
        ),
        `${ownerPath} is listed as owner-only but no page or route handler under it enforces it`
      ).toBe(true);
    }
  });
});
