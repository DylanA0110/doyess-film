import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import { getUserRecommendationProfile } from '@/lib/recommendation';
import { mediaCandidateFromDetail } from '@/lib/recommendation/candidate-from-detail';
import { computeDisplayAffinity } from '@/lib/recommendation/format-explore-match';
import { scoreCandidate } from '@/lib/recommendation/score-candidate';
import { fetchTmdbKeywords } from '@/lib/tmdb/keywords';
import { fetchTmdbMediaDetail } from '@/lib/tmdb/media-detail';
import type { StoredDailyPick } from '@/lib/dashboard/daily-pick-format';

const MIN_DISPLAY_AFFINITY = 0.1;
const MIN_TOTAL_SCORE = 0.22;
const STALE_REASON = /~0\s*%|Coincide\s*~0/i;

export async function isStoredDailyPickStale(
  row: StoredDailyPick,
  rows: CinephileStatsRow[],
): Promise<boolean> {
  if (STALE_REASON.test(row.reason ?? '')) return true;

  const profile = getUserRecommendationProfile(rows);
  if (!profile) return false;

  const detail = await fetchTmdbMediaDetail('movie', row.tmdb_id);
  if (!detail) return false;

  const candidate = mediaCandidateFromDetail(detail);
  if (candidate.keywords.length === 0) {
    candidate.keywords = await fetchTmdbKeywords('movie', row.tmdb_id);
  }

  const scored = scoreCandidate(profile, candidate);
  const displayAffinity = computeDisplayAffinity(profile, candidate);

  return displayAffinity < MIN_DISPLAY_AFFINITY || scored.finalScore < MIN_TOTAL_SCORE;
}
