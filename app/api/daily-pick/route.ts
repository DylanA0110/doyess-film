import { NextResponse } from 'next/server';
import { buildDashboardStats } from '@/lib/imdb/build-dashboard-stats';
import { getCachedDailyPickResult } from '@/lib/dashboard/daily-pick-cache';
import { resolveDailyPick } from '@/lib/dashboard/resolve-daily-pick';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { loadCinephileStatsRows } from '@/lib/supabase/load-cinephile-stats';

/** Solo lectura: fila guardada hoy (sin TMDB). */
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
        'Cache-Control': 'private, no-store',
      },
    },
  );
}

/** Genera la película del día si aún no existe (TMDB una vez por día). */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await getCachedDailyPickResult(supabase, user.id);
  if (existing) {
    return NextResponse.json({ pick: existing });
  }

  const { rows } = await loadCinephileStatsRows(supabase, user.id);
  if (rows.length === 0) {
    return NextResponse.json({ pick: null }, { status: 400 });
  }

  const stats = buildDashboardStats(rows);
  const pick = await resolveDailyPick(supabase, user.id, rows, stats);

  return NextResponse.json({ pick });
}
