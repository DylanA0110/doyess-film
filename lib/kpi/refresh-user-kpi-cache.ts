import type { SupabaseClient } from '@supabase/supabase-js';
import type { DashboardStats } from '@/components/dashboard/types';
import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import { buildDashboardStats } from '@/lib/imdb/build-dashboard-stats';
import { loadOrBuildProfile } from '@/lib/recommendation/load-profile-snapshot';

export async function refreshUserKpiCache(
  supabase: SupabaseClient,
  userId: string,
  rows?: CinephileStatsRow[],
): Promise<DashboardStats | null> {
  let list = rows;
  if (!list) {
    const { data, error } = await supabase
      .from('cinephile_stats')
      .select('*')
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    list = (data ?? []) as CinephileStatsRow[];
  }

  if (list.length === 0) {
    await supabase.from('user_kpi_cache').delete().eq('user_id', userId);
    return null;
  }

  const tasteProfile = await loadOrBuildProfile(supabase, userId, list);
  const stats = buildDashboardStats(list, tasteProfile);

  const { error: cacheError } = await supabase.from('user_kpi_cache').upsert(
    {
      user_id: userId,
      ratings_count: list.length,
      stats_json: stats,
      refreshed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (cacheError) {
    if (cacheError.message.includes('user_kpi_cache')) return stats;
    throw new Error(cacheError.message);
  }

  return stats;
}
