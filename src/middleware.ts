import { NextRequest, NextResponse } from "next/server";
import { locales, routing } from "./i18n/routing";

const DEFAULT_LOCALE = routing.defaultLocale; // "tr"
const INTERNAL_REWRITE_HEADER = "x-enki-internal-rewrite";

const INTERNAL_BYPASS_EXACT_PATHS = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
]);

function isBypassPath(request: NextRequest): boolean {
  const p = request.nextUrl.pathname;

  if (p.startsWith("/_next")) return true;
  if (p.startsWith("/api")) return true;
  if (p.startsWith("/favicon")) return true;
  if (p.startsWith("/opengraph-image")) return true;
  if (p.startsWith("/twitter-image")) return true;

  // kök statikler
  if (INTERNAL_BYPASS_EXACT_PATHS.has(p)) return true;

  // uzantılı dosyalar (matcher zaten filtreliyor ama ekstra emniyet)
  if (/\.[a-z0-9]+$/i.test(p)) return true;

  return false;
}

function isRscLikeRequest(request: NextRequest): boolean {
  // query
  if (request.nextUrl.searchParams.has("_rsc")) return true;
  if (/[?&]_rsc(?:=|&|$)/.test(request.url)) return true;

  // headers
  const rsc = request.headers.get("RSC");
  if (rsc === "1") return true;

  const accept = request.headers.get("accept") || "";
  if (accept.includes("text/x-component")) return true;

  if (request.headers.has("Next-Router-State-Tree")) return true;
  if (request.headers.has("Next-Router-Prefetch")) return true;
  if (request.headers.has("Next-Router-Segment-Prefetch")) return true;

  const purpose = request.headers.get("Purpose")?.toLowerCase();
  if (purpose === "prefetch") return true;

  return false;
}

function applyNoStoreForRsc(res: NextResponse, request: NextRequest): NextResponse {
  if (!isRscLikeRequest(request)) return res;
  res.headers.set("Cache-Control", "private, no-store, no-cache, max-age=0, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  return res;
}

export default function middleware(request: NextRequest) {
  if (isBypassPath(request)) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  // 2 harfli ama locale olmayan şeyleri 404’le (xx gibi)
  if (first && /^[a-zA-Z]{2}$/.test(first)) {
    const normalized = first.toLowerCase();
    if (!locales.includes(normalized as (typeof locales)[number])) {
      return applyNoStoreForRsc(new NextResponse(null, { status: 404 }), request);
    }
  }

  const hasLocalePrefix =
    !!first && locales.includes(first.toLowerCase() as (typeof locales)[number]);

  // INTERNAL rewrite ile gelen request’i canonical redirect’e sokma
  const isInternalRewrite = request.headers.get(INTERNAL_REWRITE_HEADER) === "1";
  if (isInternalRewrite) {
    return applyNoStoreForRsc(NextResponse.next(), request);
  }

  // Default locale prefiksi (/tr ...) dışarıdan gelirse canonicalize et: /tr/foo -> /foo
  if (hasLocalePrefix && first!.toLowerCase() === DEFAULT_LOCALE) {
    const target = request.nextUrl.clone();
    const stripped = pathname.replace(new RegExp(`^/${DEFAULT_LOCALE}(?=/|$)`), "");
    target.pathname = stripped === "" ? "/" : stripped;
    return applyNoStoreForRsc(NextResponse.redirect(target, 308), request);
  }

  // /en, /sq, /sr gibi prefiksli istekleri aynen bırak
  if (hasLocalePrefix) {
    return applyNoStoreForRsc(NextResponse.next(), request);
  }

  // Prefixsiz istek -> içeride /tr/... olarak serve et (ama INTERNAL header set et ki loop olmasın)
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;

  const headers = new Headers(request.headers);
  headers.set(INTERNAL_REWRITE_HEADER, "1");

  return applyNoStoreForRsc(
    NextResponse.rewrite(rewriteUrl, { request: { headers } }),
    request
  );
}

export const config = {
  matcher: "/((?!api|_next|opengraph-image|twitter-image|.*\\..*).*)",
};
