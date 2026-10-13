/**
 * Solo desarrollo local. Con DEV_SKIP_AUTH=true el dashboard no exige Supabase/Google.
 * Nunca activar en producción.
 */

function parseEnvBool(value: string | undefined) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

export function isDevSkipAuth() {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  return (
    parseEnvBool(process.env.DEV_SKIP_AUTH) ||
    parseEnvBool(process.env.NEXT_PUBLIC_DEV_SKIP_AUTH)
  );
}
