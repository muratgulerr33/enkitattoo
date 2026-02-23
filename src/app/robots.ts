import type { MetadataRoute } from "next";
import { hasNoIndex } from "@/lib/route-content";
import { ROUTE_CONTENT } from "@/lib/route-content.generated";
import { SITE_URL } from "@/lib/site/base-url";

function toPath(pathOrUrl: string): string {
  return new URL(pathOrUrl, SITE_URL).pathname;
}

export default function robots(): MetadataRoute.Robots {
  const disallowPaths = Array.from(
    new Set(
      Object.values(ROUTE_CONTENT)
        .filter((route) => hasNoIndex(route.indexing))
        .map((route) => toPath(route.canonical || route.path)),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowPaths,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
