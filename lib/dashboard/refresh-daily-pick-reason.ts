import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import type { DailyPickResult } from '@/components/dashboard/types';
import { getUserRecommendationProfile } from '@/lib/recommendation';
import { mediaCandidateFromDetail } from '@/lib/recommendation/candidate-from-detail';
import { scoreCandidate } from '@/lib/recommendation/score-candidate';
import { fetchTmdbKeywords } from '@/lib/tmdb/keywords';
import { fetchTmdbMediaDetail } from '@/lib/tmdb/media-detail';

/** Recalcula el copy del pick con el perfil actual (filas cacheadas con texto viejo). */
export async function refreshDailyPickReason(
  pick: DailyPickResult,
  rows: CinephileStatsRow[],
): Promise<DailyPickResult> {
  const profile = getUserRecommendationProfile(rows);
  if (!profile) return pick;

  const detail = await fetchTmdbMediaDetail('movie', pick.tmdbId);
  if (!detail) return pick;

  const candidate = mediaCandidateFromDetail(detail);
  if (candidate.keywords.length === 0) {
    candidate.keywords = await fetchTmdbKeywords('movie', pick.tmdbId);
  }

  const scored = scoreCandidate(profile, candidate);
  return { ...pick, reason: scored.reason };
}
