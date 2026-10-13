import { NextRequest, NextResponse } from 'next/server';
import { isGoogleProviderEnabledInSupabase } from '@/lib/auth/check-google-provider';
import { isDevSkipAuth } from '@/lib/auth/dev-mode';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Inicia OAuth con Google (servidor). Tras Google, Supabase redirige a /auth/callback?code=...
 */
export async function GET(request: NextRequest) {
  if (isDevSkipAuth()) {
    const next = request.nextUrl.searchParams.get('next');
    const destination =
      next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  const origin = request.nextUrl.origin;

  const googleEnabled = await isGoogleProviderEnabledInSupabase();
  if (!googleEnabled) {
    const url = new URL('/', origin);
    url.searchParams.set('error', 'google_disabled');
    url.searchParams.set(
      'reason',
      'Activa Google en Supabase → Authentication → Providers → Google (Enable + Client ID/Secret).',
    );
    return NextResponse.redirect(url);
  }

  // Sin query en redirectTo: coincide con Redirect URL exacta en Supabase
  const redirectTo = `${origin}/auth/callback`;

  const pendingCookies: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];

  const supabase = await createSupabaseServerClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet) => {
      cookiesToSet.forEach(({ name, value, options }) => {
        pendingCookies.push({ name, value, options });
      });
    },
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error || !data.url) {
    const url = new URL('/', origin);
    url.searchParams.set('error', error?.message?.includes('not enabled') ? 'google_disabled' : 'auth');
    if (error?.message) {
      url.searchParams.set('reason', error.message);
    }
    return NextResponse.redirect(url);
  }

  const response = NextResponse.redirect(data.url);
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
