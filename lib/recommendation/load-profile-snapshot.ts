import type { SupabaseClient } from '@supabase/supabase-js';
import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import { buildUserVectorProfile } from '@/lib/recommendation/build-user-profile';
import { cinephileRowsToUserRatings } from '@/lib/recommendation/map-rows';
import { ALGORITHM_VERSION, type UserVectorProfile } from '@/lib/recommendation/types';

type SnapshotRow = {
  algorithm_version: number;
  profile_json: UserVectorProfile;
  ratings_count: number;
};

export async function loadOrBuildProfile(
  supabase: SupabaseClient,
  userId: string,
  rows: CinephileStatsRow[],
): Promise<UserVectorProfile | null> {
  const built = buildUserVectorProfile(cinephileRowsToUserRatings(rows));
  if (!built) return null;

  const { data } = await supabase
    .from('user_taste_profiles')
    .select('algorithm_version, profile_json, ratings_count')
    .eq('user_id', userId)
    .maybeSingle();

  const snap = data as SnapshotRow | null;
  if (
    snap &&
    snap.algorithm_version === ALGORITHM_VERSION &&
    snap.ratings_count === rows.length
  ) {
    return snap.profile_json as UserVectorProfile;
  }

  await supabase.from('user_taste_profiles').upsert(
    {
      user_id: userId,
      algorithm_version: ALGORITHM_VERSION,
      profile_json: built,
      ratings_count: rows.length,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  return built;
}
