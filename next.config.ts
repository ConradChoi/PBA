import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Splitting the root layout into (site)/layout.tsx and admin/layout.tsx
    // (so each can render <html lang> for its own audience) left no layout
    // at all for a URL that matches no route -- Next's built-in fallback
    // then serves a bare, unbranded 404 with no `lang`, no chrome, no
    // analytics. This flag turns on the `global-not-found.tsx` file
    // convention (see src/app/global-not-found.tsx), the supported way to
    // give that genuinely-unmatched-route case a real page when there are
    // multiple root layouts and no single one to fall back to.
    globalNotFound: true,
  },
  async headers() {
    return [
      {
        // One URL serves five languages, so caches must key on what decides
        // the language. Segment-anchored so `/administration` or `/apikeys`
        // aren't mistaken for the `/admin` and `/api` trees.
        source: "/((?!(?:admin|api)(?:/|$)).*)",
        headers: [
          { key: "Vary", value: "Accept-Language, Cookie, CloudFront-Viewer-Country" },
        ],
      },
      {
        // Keep the operator dashboard out of search engines. Belt-and-braces
        // with robots.ts's Disallow rule: a crawler that ignores robots.txt
        // (or reaches an admin URL via a stray link) still gets told via
        // this header not to index whatever it fetched. Same matcher as
        // src/middleware.ts's config.matcher, so this stays in lockstep with
        // what actually requires auth.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
