export type OAuthErrorCode =
  | 'google_disabled'
  | 'missing-code'
  | 'exchange'
  | 'oauth'
  | 'auth'
  | string;

export function getOAuthErrorMessage(
  code: OAuthErrorCode | null,
  reason: string | null,
): { title: string; detail: string } | null {
  if (!code) return null;

  const reasonText = reason?.trim() ? ` (${reason})` : '';

  switch (code) {
    case 'google_disabled':
      return {
        title: 'Google no está activado en Supabase',
        detail:
          'En el panel de Supabase → Authentication → Providers → Google, activa el proveedor y guarda Client ID y Secret. Guía: docs/google-oauth-setup.md' +
          reasonText,
      };
    case 'missing-code':
      return {
        title: 'No recibimos el código de autorización',
        detail:
          'Añade http://localhost:3000/auth/callback en Supabase → URL Configuration → Redirect URLs (sin barra final). Vuelve a iniciar sesión desde /auth/login.' +
          reasonText,
      };
    case 'exchange':
      return {
        title: 'No se pudo crear la sesión',
        detail:
          'Prueba de nuevo desde «Continuar con Google» (usa /auth/login). Si persiste, borra cookies de localhost e inténtalo otra vez.' +
          reasonText,
      };
    case 'oauth':
      return {
        title: 'Google canceló o rechazó el acceso',
        detail: `Revisa la cuenta de prueba en Google Cloud (modo Testing) o inténtalo de nuevo.${reasonText}`,
      };
    case 'auth':
      return {
        title: 'Error al iniciar sesión',
        detail: `Comprueba Supabase y las variables NEXT_PUBLIC_SUPABASE_* en .env.${reasonText}`,
      };
    default:
      return {
        title: 'No pudimos completar el inicio de sesión',
        detail: reason ?? 'Inténtalo de nuevo o revisa docs/google-oauth-setup.md',
      };
  }
}
