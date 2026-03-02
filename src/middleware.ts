import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {locales, routing} from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

function withRscNoStoreHeaders(response: NextResponse, shouldApply: boolean): NextResponse {
  if (!shouldApply) {
    return response;
  }

  response.headers.set('Cache-Control', 'private, no-store, no-cache, max-age=0, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

function isRscLikeRequest(request: NextRequest): boolean {
  if (request.nextUrl.searchParams.has('_rsc')) {
    return true;
  }

  const rawUrl = request.url;
  if (/[?&]_rsc(?:=|&|$)/.test(rawUrl)) {
    return true;
  }

  const rscHeader = request.headers.get('RSC');
  if (rscHeader === '1') {
    return true;
  }

  const hasRouterStateTree = request.headers.has('Next-Router-State-Tree');
  const hasRouterPrefetch = request.headers.has('Next-Router-Prefetch');
  const hasRouterSegmentPrefetch = request.headers.has('Next-Router-Segment-Prefetch');
  if (hasRouterStateTree || hasRouterPrefetch || hasRouterSegmentPrefetch) {
    return true;
  }

  const purpose = request.headers.get('Purpose');
  if (purpose?.toLowerCase() === 'prefetch') {
    return true;
  }

  const secFetchDest = request.headers.get('Sec-Fetch-Dest');
  if (secFetchDest?.toLowerCase() === 'empty') {
    return true;
  }

  return false;
}

export default function middleware(request: NextRequest) {
  const shouldApplyNoStore = isRscLikeRequest(request);
  const pathname = request.nextUrl.pathname;

  const firstSegment = pathname.split('/').filter(Boolean)[0];

  if (firstSegment && /^[a-zA-Z]{2}$/.test(firstSegment)) {
    const normalizedSegment = firstSegment.toLowerCase();

    if (!locales.includes(normalizedSegment as (typeof locales)[number])) {
      return withRscNoStoreHeaders(new NextResponse(null, {status: 404}), shouldApplyNoStore);
    }
  }

  return withRscNoStoreHeaders(handleI18nRouting(request), shouldApplyNoStore);
}

/**
 * Local smoke commands:
 * npm run build
 * PORT=3010 npx next start -p 3010 > /tmp/enki-start.log 2>&1 & echo $! > /tmp/enki.pid
 * curl -sS -I "http://127.0.0.1:3010/" | egrep -i "HTTP/|location|cache-control"
 * curl -sS -I "http://127.0.0.1:3010/tr" | egrep -i "HTTP/|location|cache-control"
 * curl -sS -I "http://127.0.0.1:3010/en" | egrep -i "HTTP/|location|cache-control"
 * curl -sS -I "http://127.0.0.1:3010/xx" | head -n 5
 * curl -sS -I -H "RSC: 1" "http://127.0.0.1:3010/" | egrep -i "HTTP/|content-type|cache-control"
 * curl -sS -I "http://127.0.0.1:3010/?_rsc=1" | egrep -i "HTTP/|content-type|cache-control"
 * kill $(cat /tmp/enki.pid)
 */
export const config = {
  matcher: '/((?!api|_next|opengraph-image|twitter-image|.*\\..*).*)'
};
