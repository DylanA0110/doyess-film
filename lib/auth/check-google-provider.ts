/**
 * Supabase devuelve 400 JSON si Google no está habilitado en Authentication → Providers.
 */
export async function isGoogleProviderEnabledInSupabase(): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    return false;
  }

  try {
    const response = await fetch(`${baseUrl}/auth/v1/authorize?provider=google`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: 'no-store',
    });

    const body = await response.text();

    if (
      body.includes('not enabled') ||
      body.includes('Unsupported provider') ||
      body.includes('validation_failed')
    ) {
      return false;
    }

    return response.ok || response.status === 302;
  } catch {
    return false;
  }
}
