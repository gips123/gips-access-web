import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const pathname = request.nextUrl.pathname;

  // Paths that require authentication
  const isProtectedPath = pathname.startsWith('/storage');

  // Login page path
  const isLoginPage = pathname === '/login';

  if (isProtectedPath && !authToken) {
    // Redirect to login, pass origin path so we can redirect back after login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage) {
    // Jika ada trigger komando hapus cookie (misalnya backend menolak token expired)
    if (request.nextUrl.searchParams.get('clear') === '1') {
      const response = NextResponse.next();
      response.cookies.delete('auth_token');
      return response;
    }

    if (authToken) {
      // Already authenticated — redirect to private storage
      return NextResponse.redirect(new URL('/storage', request.url));
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, etc.
     * as well as any file with an extension (e.g. .svg, .webp)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)',
  ],
};
