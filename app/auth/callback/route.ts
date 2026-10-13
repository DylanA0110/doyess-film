import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Patrón oficial Supabase PKCE:
 * https://supabase.com/docs/guides/auth/social-login/auth-google
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');
  const oauthDescription =
    searchParams.get('error_description') ?? searchParams.get('error_code');

  const next = '/dashboard';

  if (oauthError) {
    const url = new URL('/', origin);
    url.searchParams.set('error', 'oauth');
    url.searchParams.set('reason', oauthDescription ?? oauthError);
    return NextResponse.redirect(url);
  }

  if (!code) {
    const url = new URL('/', origin);
    url.searchParams.set('error', 'missing-code');
    url.searchParams.set(
      'reason',
      'Añade http://localhost:3000/auth/callback en Supabase → URL Configuration → Redirect URLs.',
    );
    return NextResponse.redirect(url);
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  const supabase = await createSupabaseServerClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet, headers) => {
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    },
  });

  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const url = new URL('/', origin);
    url.searchParams.set('error', 'exchange');
    url.searchParams.set('reason', error.message);
    return NextResponse.redirect(url);
  }

  const user = sessionData.user;
  if (user) {
    const { buildProfileUpsertFromUser } = await import('@/lib/auth/user-profile');
    await supabase.from('profiles').upsert(buildProfileUpsertFromUser(user), {
      onConflict: 'id',
    });
  }

  return response;
}
