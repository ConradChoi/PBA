import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Guard for the one assumption the admin access log rests on: that every
// /admin/* request in admin_access_logs is a request an operator actually
// made.
//
// Next's App Router prefetches <Link> targets on viewport entry, hover and
// touch. Every one of those is a real HTTP request through src/middleware.ts,
// so each would become a row — and for the links in the assessments table,
// a row carrying subject_assessment_id, i.e. a false record that the
// operator opened that person's file. With the sidebar links visible on
// every admin page, it would also be roughly a fivefold flood.
//
// The obvious fix does not work: Next 15 deletes the FLIGHT_HEADERS
// (`RSC`, `Next-Router-Prefetch`, `Next-Router-State-Tree`, …) from the
// request BEFORE middleware runs — see
// node_modules/next/dist/esm/server/web/adapter.js, "Headers should only be
// stripped for middleware" — so a prefetch and a real navigation are
// indistinguishable there. (Even unstripped it would be partial: only
// PrefetchKind.AUTO sets that header, not hover or prefetch={true}.)
//
// So the defence is at the source: admin links do not prefetch at all.
// `prefetch={false}` sets prefetchEnabled=false in
// next/dist/client/app-dir/link.js, which skips the viewport observer and
// makes both the hover and touch handlers return early. Nothing is lost —
// this is a two-operator internal panel, not a page where a prefetched
// paint matters.
const ADMIN_DIRS = [
  path.resolve(__dirname),
  path.resolve(__dirname, "..", "..", "components", "admin"),
];

function collectTsxFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectTsxFiles(full);
    }
    return entry.isFile() && full.endsWith(".tsx") ? [full] : [];
  });
}

// Returns each `<Link ...>` opening tag, brace-aware so a `>` inside a
// template literal or expression does not end the tag early.
function linkOpeningTags(source: string): string[] {
  const tags: string[] = [];

  for (const match of source.matchAll(/<Link(?=[\s>])/g)) {
    let depth = 0;
    let end = match.index;

    for (let i = match.index; i < source.length; i += 1) {
      const char = source[i];
      if (char === "{") depth += 1;
      else if (char === "}") depth -= 1;
      else if (char === ">" && depth === 0) {
        end = i;
        break;
      }
    }

    tags.push(source.slice(match.index, end + 1));
  }

  return tags;
}

describe("admin links never prefetch", () => {
  const files = ADMIN_DIRS.flatMap(collectTsxFiles);

  it("finds the admin tree to scan", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s", (file) => {
    const tags = linkOpeningTags(fs.readFileSync(file, "utf8"));

    for (const tag of tags) {
      expect(
        tag.includes("prefetch={false}"),
        `Every <Link> under the admin tree must set prefetch={false}, or Next will ` +
          `prefetch it and write an admin_access_logs row for an access nobody made ` +
          `(middleware cannot tell a prefetch from a navigation — see the comment at ` +
          `the top of this file). Offending tag in ${path.relative(process.cwd(), file)}:\n${tag}`
      ).toBe(true);
    }
  });
});
