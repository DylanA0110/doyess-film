import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCachedDailyPickResult } from '@/lib/dashboard/daily-pick-cache';
import { loadCinephileStatsRows } from '@/lib/supabase/load-cinephile-stats';
import { loadOrBuildProfile } from '@/lib/recommendation/load-profile-snapshot';
import {
  buildExplorePage,
  exploreContextFromRows,
} from '@/lib/recommendation/lanes/build-explore-lanes';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { rows } = await loadCinephileStatsRows(supabase, user.id);
  if (rows.length === 0) {
    return NextResponse.json({ hero: null, lanes: [] });
  }

  const profile = await loadOrBuildProfile(supabase, user.id, rows);
  if (!profile) {
    return NextResponse.json({ hero: null, lanes: [] });
  }

  const { seenIds } = exploreContextFromRows(rows);
  const dailyPick = await getCachedDailyPickResult(supabase, user.id);
  const payload = await buildExplorePage(profile, seenIds, supabase, dailyPick, user.id);

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'private, max-age=300',
    },
  });
}
