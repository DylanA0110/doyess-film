import type { SupabaseClient } from '@supabase/supabase-js';
import type { DashboardStats } from '@/components/dashboard/types';

type KpiCacheRow = {
  ratings_count: number;
  stats_json: DashboardStats;
  refreshed_at: string;
};

export async function loadUserKpiCache(
  supabase: SupabaseClient,
  userId: string,
  expectedRatingsCount: number,
): Promise<DashboardStats | null> {
  const { data, error } = await supabase
    .from('user_kpi_cache')
    .select('ratings_count, stats_json, refreshed_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    if (error.message.includes('user_kpi_cache')) return null;
    throw new Error(error.message);
  }

  const row = data as KpiCacheRow | null;
  if (!row || row.ratings_count !== expectedRatingsCount) return null;
  return row.stats_json;
}
