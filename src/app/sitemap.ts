import type { MetadataRoute } from "next";
import { hasNoIndex } from "@/lib/route-content";
import { ROUTE_CONTENT } from "@/lib/route-content.generated";
import { SITE_URL } from "@/lib/site/base-url";

function toAbsoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, SITE_URL).toString();
}

function priorityForPath(path: string): number {
  if (path === "/") {
    return 1;
  }

  const depth = path.split("/").filter(Boolean).length;
  return depth >= 2 ? 0.6 : 0.7;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = Object.values(ROUTE_CONTENT)
    .filter((route) => !hasNoIndex(route.indexing))
    .map((route) => ({
      url: toAbsoluteUrl(route.canonical || route.path),
      changeFrequency: route.path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: priorityForPath(route.path),
    }));

  const uniqueEntries = new Map(entries.map((entry) => [entry.url, entry]));

  return Array.from(uniqueEntries.values()).sort((a, b) =>
    a.url.localeCompare(b.url),
  );
}
