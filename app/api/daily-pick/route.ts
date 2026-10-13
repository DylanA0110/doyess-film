import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { buildDashboardStats } from '@/lib/imdb/build-dashboard-stats';
import { resolveDailyPick } from '@/lib/dashboard/resolve-daily-pick';
import { loadCinephileStatsRows } from '@/lib/supabase/load-cinephile-stats';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { rows } = await loadCinephileStatsRows(supabase, user.id);
  if (rows.length === 0) {
    return NextResponse.json({ pick: null });
  }

  const stats = buildDashboardStats(rows);
  const pick = await resolveDailyPick(supabase, user.id, rows, stats);

  return NextResponse.json({ pick });
}
