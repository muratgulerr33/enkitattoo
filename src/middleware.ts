import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {locales, routing} from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === '/') {
    return NextResponse.next();
  }

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
  matcher: '/((?!api|_next|.*\\..*).*)'
};
