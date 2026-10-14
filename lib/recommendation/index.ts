import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import { buildUserVectorProfile } from '@/lib/recommendation/build-user-profile';
import { cinephileRowsToUserRatings } from '@/lib/recommendation/map-rows';
import { rankCandidates } from '@/lib/recommendation/rank-candidates';
import {
  ALGORITHM_VERSION,
  type CandidateMovie,
  type ScoredCandidate,
  type UserVectorProfile,
} from '@/lib/recommendation/types';

export {
  ALGORITHM_VERSION,
  BAYES_M_DIRECTOR,
  BAYES_M_GENRE,
  type CandidateMovie,
  type CandidateScoreBreakdown,
  type CinephileInsight,
  type CriticPersona,
  type DirectorBayesianStat,
  type ExploreLaneKind,
  type GenreBayesianStat,
  type ScoredCandidate,
  type UserRating,
  type UserVectorProfile,
} from '@/lib/recommendation/types';

export {
  bayesianAverage,
  cosineSimilarity,
  l2Normalize,
  mean,
  percentile,
  stdDev,
  zScore,
} from '@/lib/recommendation/math';
export {
  buildTasteSliceForRatings,
  buildUserVectorProfile,
  genreDisplayPercentages,
  genreDisplayPercentagesForSlice,
  titleGenreAffinity,
} from '@/lib/recommendation/build-user-profile';
export { buildCinephileInsights } from '@/lib/recommendation/build-cinephile-insights';
export { cinephileRowsToUserRatings } from '@/lib/recommendation/map-rows';
export { scoreCandidate } from '@/lib/recommendation/score-candidate';
export { rankCandidates } from '@/lib/recommendation/rank-candidates';
export { formatAffinityPercent, formatRecommendationReason } from '@/lib/recommendation/format-reason';
export { GENRE_AXIS } from '@/lib/recommendation/genre-axis';

export function getUserRecommendationProfile(
  rows: CinephileStatsRow[],
): UserVectorProfile | null {
  const ratings = cinephileRowsToUserRatings(rows).filter((r) => r.titleKind === 'movie');
  return buildUserVectorProfile(ratings);
}

export function rankCandidatesFromRows(
  rows: CinephileStatsRow[],
  candidates: CandidateMovie[],
): ScoredCandidate[] {
  const profile = getUserRecommendationProfile(rows);
  if (!profile) return [];
  return rankCandidates(profile, candidates);
}
