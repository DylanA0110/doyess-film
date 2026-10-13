import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware';

const protectedRoutes = ['/dashboard'];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createSupabaseMiddlewareClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isDemo =
    request.cookies.get('doyess_demo_session')?.value === 'true' ||
    request.nextUrl.searchParams.get('demo') === 'true';

  if (request.nextUrl.searchParams.get('demo') === 'true') {
    response.cookies.set('doyess_demo_session', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  if (isProtectedRoute && !user && !isDemo) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('from', pathname);

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
