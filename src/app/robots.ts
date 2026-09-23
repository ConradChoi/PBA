import type { MetadataRoute } from "next";

// /robots.txt 404s without this file. Disallowing /admin here is
// belt-and-braces with the X-Robots-Tag header (next.config.ts,
// customHttp.yml): a header only reaches a crawler that already fetched the
// URL, while this stops well-behaved crawlers from requesting it at all.
// /api is included too — those routes serve JSON, never a page worth
// indexing, and some return data even to a HEAD/GET without auth headers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/admin", "/admin/", "/api"],
    },
  };
}
