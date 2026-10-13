import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware';
import { isDevSkipAuth } from '@/lib/auth/dev-mode';

const protectedRoutes = ['/dashboard'];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isDevSkipAuth() && pathname === '/auth/login') {
    const next = request.nextUrl.searchParams.get('next');
    const destination =
      next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isProtectedRoute && isDevSkipAuth()) {
    return NextResponse.next({ request });
  }

  const response = NextResponse.next({ request });
  const supabase = createSupabaseMiddlewareClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
