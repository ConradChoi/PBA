import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NotFoundContent } from "./NotFoundContent";
import ko from "@/i18n/messages/ko";

// Splitting the root layout into (site)/layout.tsx and admin/layout.tsx left
// the app-wide 404 (no route matched at all) with no root layout to render
// under: a bare <html> with no `lang`, no header/footer, no analytics.
// NotFoundContent is the shared body rendered by both
// src/app/(site)/not-found.tsx and src/app/global-not-found.tsx (the latter
// supplies the actual <html>/<body>/chrome -- see that file and
// next.config.ts's `experimental.globalNotFound` for why a not-found.tsx
// inside (site) alone isn't enough for a genuinely unmatched URL). This
// pins that its copy comes from the message files, not a hardcoded string.
// Same next-intl/server stub as ResultReport.test.tsx: it resolves messages
// directly from the real `ko` object instead of the request-scoped API.
vi.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { locale: string; namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    const messages = ko as unknown as Record<string, unknown>;
    const resolve = (key: string): unknown =>
      `${namespace}.${key}`
        .split(".")
        .reduce<unknown>(
          (acc, part) =>
            acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined,
          messages
        );

    function t(key: string): string {
      const value = resolve(key);
      if (typeof value !== "string") {
        throw new Error(`Test stub: missing string message "${namespace}.${key}"`);
      }
      return value;
    }
    return t;
  },
}));

describe("NotFoundContent", () => {
  it("renders the global-404 copy from the message files, with a link home", async () => {
    const html = renderToStaticMarkup(await NotFoundContent());

    expect(html).toContain(ko.common.notFound.global.title);
    expect(html).toContain(ko.common.notFound.global.description);
    expect(html).toContain(ko.common.notFound.global.cta);
    expect(html).toMatch(/<a[^>]+href="\/"[^>]*>/);
  });
});
