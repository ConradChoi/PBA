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
    ];
  },
};

export default withNextIntl(nextConfig);
