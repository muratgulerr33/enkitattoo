import {NextRequest, NextResponse} from 'next/server';
import {locales, routing} from './i18n/routing';

const DEFAULT_LOCALE = routing.defaultLocale;
const INTERNAL_REWRITE_HEADER = 'x-enki-internal-rewrite';

const INTERNAL_BYPASS_EXACT_PATHS = new Set([
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.webmanifest'
]);

function isBypassPath(pathname: string): boolean {
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/api')) return true;
  if (pathname.startsWith('/favicon')) return true;
  if (pathname.startsWith('/opengraph-image')) return true;
  if (pathname.startsWith('/twitter-image')) return true;
  if (INTERNAL_BYPASS_EXACT_PATHS.has(pathname)) return true;
  if (/\.[a-z0-9]+$/i.test(pathname)) return true;
  return false;
}

function isRscLikeRequest(request: NextRequest): boolean {
  if (request.nextUrl.searchParams.has('_rsc')) return true;
  if (/[?&]_rsc(?:=|&|$)/.test(request.url)) return true;

  if (request.headers.get('RSC') === '1') return true;

  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/x-component')) return true;

  if (request.headers.has('Next-Router-Prefetch')) return true;
  if (request.headers.has('Next-Router-State-Tree')) return true;
  if (request.headers.has('Next-Router-Segment-Prefetch')) return true;

  return false;
}

function applyRscNoStoreHeaders(response: NextResponse, request: NextRequest): NextResponse {
  if (!isRscLikeRequest(request)) return response;

  response.headers.set('Cache-Control', 'private, no-store, no-cache, max-age=0, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('CDN-Cache-Control', 'no-store');
  response.headers.set('Surrogate-Control', 'no-store');

  return response;
}

function stripDefaultLocalePrefix(pathname: string): string {
  const stripped = pathname.replace(new RegExp(`^/${DEFAULT_LOCALE}(?=/|$)`), '');
  return stripped === '' ? '/' : stripped;
}

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isBypassPath(pathname)) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split('/').filter(Boolean)[0];

  if (firstSegment && /^[a-zA-Z]{2}$/.test(firstSegment)) {
    const normalized = firstSegment.toLowerCase();

    if (!locales.includes(normalized as (typeof locales)[number])) {
      return applyRscNoStoreHeaders(new NextResponse(null, {status: 404}), request);
    }
  }

  const isInternalRewrite = request.headers.get(INTERNAL_REWRITE_HEADER) === '1';
  if (isInternalRewrite) {
    return applyRscNoStoreHeaders(NextResponse.next(), request);
  }

  const hasLocalePrefix =
    !!firstSegment && locales.includes(firstSegment.toLowerCase() as (typeof locales)[number]);

  if (hasLocalePrefix && firstSegment!.toLowerCase() === DEFAULT_LOCALE) {
    const canonicalPath = stripDefaultLocalePrefix(pathname);

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = canonicalPath;

    const response = NextResponse.redirect(redirectUrl, 308);
    return applyRscNoStoreHeaders(response, request);
  }

  if (hasLocalePrefix) {
    return applyRscNoStoreHeaders(NextResponse.next(), request);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.protocol = 'http:';
  rewriteUrl.pathname = pathname === '/' ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(INTERNAL_REWRITE_HEADER, '1');
  requestHeaders.set('x-forwarded-proto', 'http');

  const response = NextResponse.rewrite(rewriteUrl, {request: {headers: requestHeaders}});
  if (process.env.NODE_ENV !== 'production') {
    response.headers.set('x-enki-mw-debug', 'default-locale-rewrite');
  }

  return applyRscNoStoreHeaders(response, request);
}

export const config = {
  matcher: '/((?!api|_next|.*\\..*).*)'
};
