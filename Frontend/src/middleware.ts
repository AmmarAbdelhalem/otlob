import { NextRequest, NextResponse } from 'next/server';

const locales = ['ar', 'en'];
const defaultLocale = 'ar';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static files, images, APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract current locale from pathname if present
  let currentLocale = defaultLocale;
  for (const loc of locales) {
    if (pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`) {
      currentLocale = loc;
      break;
    }
  }

  // If no locale prefix, redirect to defaultLocale (ar)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // Check authentication for protected routes
  const token = request.cookies.get('otlob_token')?.value;
  const pathWithoutLocale = pathname.replace(new RegExp(`^/(${locales.join('|')})`), '');

  if (pathWithoutLocale === '/admin' || pathWithoutLocale.startsWith('/admin/')) {
    const backendAdminUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin`
      : 'http://localhost:8000/admin';
    return NextResponse.redirect(backendAdminUrl);
  }

  const isProtected =
    pathWithoutLocale.startsWith('/account') ||
    pathWithoutLocale.startsWith('/vendor') ||
    pathWithoutLocale.startsWith('/courier');

  if (isProtected && !token) {
    const loginUrl = new URL(`/${currentLocale}/auth/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
