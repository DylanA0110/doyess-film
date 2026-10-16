import type { SupabaseClient } from '@supabase/supabase-js';
import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import { loadOrBuildProfile } from '@/lib/recommendation/load-profile-snapshot';
import type { DoyessJobEvent } from '@/lib/jobs/events';
import { emitJobEvent } from '@/lib/jobs/events';

export async function rebuildTasteProfileFromDb(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data: rows, error } = await supabase
    .from('cinephile_stats')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  const list = (rows ?? []) as CinephileStatsRow[];
  await loadOrBuildProfile(supabase, userId, list);
}

export async function scheduleTasteProfileRebuild(
  supabase: SupabaseClient,
  userId: string,
  event: DoyessJobEvent,
): Promise<void> {
  await supabase.from('user_taste_profiles').delete().eq('user_id', userId);
  await supabase.from('user_kpi_cache').delete().eq('user_id', userId);
  await emitJobEvent(event);
}
