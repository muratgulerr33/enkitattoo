import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {locales, routing} from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

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
  if (isRscLikeRequest(request)) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'private, no-store, no-cache, max-age=0, must-revalidate');
    response.headers.set('pragma', 'no-cache');
    return response;
  }

  const pathname = request.nextUrl.pathname;
  const firstSegment = pathname.split('/').filter(Boolean)[0];

  if (firstSegment && /^[a-zA-Z]{2}$/.test(firstSegment)) {
    const normalizedSegment = firstSegment.toLowerCase();

    if (!locales.includes(normalizedSegment as (typeof locales)[number])) {
      return new NextResponse(null, {status: 404});
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: '/((?!api|_next|opengraph-image|twitter-image|.*\\..*).*)'
};
