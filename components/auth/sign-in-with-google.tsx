'use client';

import * as React from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type SignInWithGoogleProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * OAuth en el navegador (PKCE en cookies locales). Patrón recomendado para localhost.
 */
export function SignInWithGoogle({ children, className }: SignInWithGoogleProps) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });

      if (error) {
        const url = new URL('/', window.location.origin);
        const disabled =
          error.message.toLowerCase().includes('not enabled') ||
          error.message.toLowerCase().includes('unsupported provider');
        url.searchParams.set('error', disabled ? 'google_disabled' : 'auth');
        url.searchParams.set('reason', error.message);
        window.location.href = url.toString();
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      throw new Error('Supabase no devolvió URL de autorización');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      const url = new URL('/', window.location.origin);
      url.searchParams.set('error', 'auth');
      url.searchParams.set('reason', message);
      window.location.href = url.toString();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={() => void handleClick()} disabled={loading} className={className}>
      {loading ? 'Abriendo Google…' : children}
    </button>
  );
}
