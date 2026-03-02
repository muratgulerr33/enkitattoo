import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

function isInternalProxyHost(host: string | null) {
  if (!host) return false;
  const h = host.toLowerCase();
  return h.startsWith("localhost") || h.startsWith("127.0.0.1");
}

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ✅ NEXT 16 "Proxy (Middleware)" loop fix:
  // If Next internally proxies to the rewritten locale path using localhost/127.0.0.1,
  // we MUST bypass next-intl on already-locale-prefixed paths to prevent:
  // /kesfet/... -> rewrite /tr/kesfet/... -> (internal) /tr/... -> redirect /... -> loop
  const host = request.headers.get("host");
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (isInternalProxyHost(host) && firstSegment) {
    const normalized = firstSegment.toLowerCase();
    if (locales.includes(normalized as (typeof locales)[number])) {
      return NextResponse.next();
    }
  }

  // Unknown 2-letter locale guard: /xx -> 404
  if (firstSegment && /^[a-zA-Z]{2}$/.test(firstSegment)) {
    const normalizedSegment = firstSegment.toLowerCase();
    if (!locales.includes(normalizedSegment as (typeof locales)[number])) {
      return new NextResponse(null, { status: 404 });
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: "/((?!api|_next|.*\\..*).*)",
};
