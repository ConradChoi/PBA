import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
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
