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
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieMethods ?? {
        getAll: async () => {
          const cookieStore = await cookies();

          return cookieStore
            .getAll()
            .map(({ name, value }) => ({ name, value }));
        },
        setAll: async () => {},
      },
    },
  );
}
