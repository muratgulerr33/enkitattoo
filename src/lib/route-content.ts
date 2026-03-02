import { ROUTE_CONTENT, type RouteContent } from "./route-content.generated";
import { mainHubs, specialHubs } from "./hub/hubs.v1";

export function getRouteContent(path: string): RouteContent | null {
  return ROUTE_CONTENT[path] ?? null;
}

export function requireRouteContent(path: string): RouteContent | null {
  return ROUTE_CONTENT[path] ?? null;
}

export function listKnownPaths(): string[] {
  const routePaths = Object.keys(ROUTE_CONTENT);
  const hubPaths = [...mainHubs, ...specialHubs].map((hub) => `/kesfet/${hub.slug}`);
  return Array.from(new Set([...routePaths, ...hubPaths]));
}

export function hasNoIndex(indexing?: string): boolean {
  return Boolean(indexing && indexing.toLowerCase().includes("noindex"));
}
