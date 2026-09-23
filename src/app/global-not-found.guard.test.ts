import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Splitting the root layout into (site)/layout.tsx and admin/layout.tsx left
// no layout owning a URL that matches no route at all, so Next fell back to
// its bare framework 404: no `lang`, no header/footer, no analytics.
// src/app/global-not-found.tsx fixes that, but it only runs while
// next.config.ts keeps `experimental.globalNotFound` on AND the installed
// Next still recognises that key.
//
// That combination is the risk this test exists for. An experimental flag
// Next later renames or drops is ignored silently — the config still
// validates, the build still succeeds, and the only visible symptom is that
// 404s quietly go back to being unbranded. Nothing else in the suite would
// notice, because the unit test for this page renders the shared content
// component directly rather than going through real Next routing.
//
// So this is a static check of the three things that have to stay true
// together. It does NOT prove the page actually renders on an unmatched URL;
// that needs a running server.
const repoRoot = path.resolve(__dirname, "..", "..");

describe("global 404 page", () => {
  it("exists at src/app/global-not-found.tsx", () => {
    const pagePath = path.join(repoRoot, "src", "app", "global-not-found.tsx");
    expect(
      fs.existsSync(pagePath),
      "src/app/global-not-found.tsx is what gives an unmatched URL the site chrome, `lang` " +
        "and analytics. Without it, Next serves its bare default 404."
    ).toBe(true);
  });

  it("is enabled by experimental.globalNotFound in next.config.ts", () => {
    const configSource = fs.readFileSync(path.join(repoRoot, "next.config.ts"), "utf8");

    expect(
      /globalNotFound:\s*true/.test(configSource),
      "next.config.ts must set `experimental.globalNotFound: true`. The file convention is " +
        "inert without it, and 404s silently lose their chrome."
    ).toBe(true);
  });

  it("uses a flag the installed Next still accepts", () => {
    // Next validates next.config.ts against this schema and ignores keys it
    // doesn't know, so an upstream rename would not fail the build. Reading
    // the schema is how we turn that silent drop into a failing test on the
    // upgrade that causes it.
    const schemaPath = path.join(
      repoRoot,
      "node_modules",
      "next",
      "dist",
      "server",
      "config-schema.js"
    );

    if (!fs.existsSync(schemaPath)) {
      // Next moved the file; that alone is reason to re-check the flag.
      throw new Error(
        `Could not find Next's config schema at ${schemaPath}. Next's internals moved — ` +
          `re-verify that experimental.globalNotFound is still the supported way to give an ` +
          `unmatched route a page (see src/app/global-not-found.tsx).`
      );
    }

    const schemaSource = fs.readFileSync(schemaPath, "utf8");

    expect(
      schemaSource.includes("globalNotFound"),
      "The installed Next no longer declares `globalNotFound` in its config schema, so it is " +
        "now ignoring that flag and serving its bare default 404 again. Either the flag has " +
        "graduated under a new name or the convention changed — check the Next release notes " +
        "and update src/app/global-not-found.tsx and next.config.ts together."
    ).toBe(true);
  });
});
