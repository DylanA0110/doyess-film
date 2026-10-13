import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

type CookieValue = {
  name: string;
  value: string;
};

type CookieSetValue = CookieValue & {
  options: Record<string, unknown>;
};

type SupabaseServerCookies = {
  getAll: () => CookieValue[] | Promise<CookieValue[]>;
  setAll?: (
    cookiesToSet: CookieSetValue[],
    headers: Record<string, string>,
  ) => void | Promise<void>;
};

export async function createSupabaseServerClient(
  cookieMethods?: SupabaseServerCookies,
) {
  if (cookieMethods) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookieMethods },
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll desde Server Component sin mutación de cookies
          }
        },
      },
    },
  );
}
