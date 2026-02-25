import { getRouteContent } from "@/lib/route-content";
import { SITE_URL } from "@/lib/site/base-url";

function normalizePath(path: string): string {
  const rawPath = (path || "/").split(/[?#]/, 1)[0] || "/";
  const prefixed = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  if (prefixed === "/") {
    return prefixed;
  }

  return prefixed.replace(/\/+$/, "") || "/";
}

function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toTitleCase(label: string): string {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toLocaleUpperCase("tr-TR")}${part.slice(1)}`)
    .join(" ");
}

function resolveCrumbLabel(path: string): string {
  if (path === "/") {
    return "Ana Sayfa";
  }

  const content = getRouteContent(path);
  if (content?.h1) {
    return content.h1;
  }

  if (content?.seoTitle) {
    return content.seoTitle.replace(/\s+\|\s+Enki Tattoo$/, "");
  }

  const segment = path.split("/").filter(Boolean).at(-1) ?? "";
  const decoded = decodeSegment(segment).replace(/-/g, " ").trim();

  return decoded ? toTitleCase(decoded) : path;
}

function buildCrumbPaths(path: string): string[] {
  const normalizedPath = normalizePath(path);
  const segments = normalizedPath.split("/").filter(Boolean);
  const crumbs = ["/"];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    crumbs.push(currentPath);
  }

  return crumbs;
}

export function BreadcrumbListJsonLd({ path }: { path: string }) {
  const crumbPaths = buildCrumbPaths(path);

  if (crumbPaths.length < 2) {
    return null;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbPaths.map((crumbPath, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: resolveCrumbLabel(crumbPath),
      item: new URL(crumbPath, SITE_URL).toString(),
    })),
  } as const;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
