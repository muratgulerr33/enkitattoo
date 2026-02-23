import { ROUTE_CONTENT, type RouteContent } from "./route-content.generated";

export function getRouteContent(path: string): RouteContent | null {
  return ROUTE_CONTENT[path] ?? null;
}

export function requireRouteContent(path: string): RouteContent | null {
  return ROUTE_CONTENT[path] ?? null;
}

export function listKnownPaths(): string[] {
  return Object.keys(ROUTE_CONTENT);
}

export function hasNoIndex(indexing?: string): boolean {
  return Boolean(indexing && indexing.toLowerCase().includes("noindex"));
}
