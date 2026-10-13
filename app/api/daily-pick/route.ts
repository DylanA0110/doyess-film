import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCachedDailyPickResult } from '@/lib/dashboard/daily-pick-cache';

/** Solo devuelve la fila guardada (sin TMDB). La generación ocurre en el Server Component del dashboard. */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pick = await getCachedDailyPickResult(supabase, user.id);

  return NextResponse.json(
    { pick },
    {
      headers: {
        'Cache-Control': 'private, max-age=300',
      },
    },
  );
}
