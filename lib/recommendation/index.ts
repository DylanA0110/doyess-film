import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import { rowsForImportedDisplay } from '@/lib/ratings/synthetic-imdb-id';
import { buildUserRecommendationProfile } from '@/lib/recommendation/build-keyword-profile';
import { cinephileRowsToUserRatings } from '@/lib/recommendation/map-rows';
import type { MediaCandidate } from '@/lib/recommendation/media-candidate';
import { rankCandidates, type ScoredMediaCandidate } from '@/lib/recommendation/rank-candidates';
import {
  ALGORITHM_VERSION,
  type UserVectorProfile,
} from '@/lib/recommendation/types';

export {
  ALGORITHM_VERSION,
  BAYES_M_DIRECTOR,
  BAYES_M_GENRE,
  HIDDEN_GEM_AFFINITY_MIN,
  HIDDEN_GEM_MULTIPLIER,
  HIDDEN_GEM_VOTE_MAX,
  SCORE_WEIGHT_AFFINITY,
  SCORE_WEIGHT_DIRECTOR,
  SCORE_WEIGHT_QUALITY,
  type CandidateMovie,
  type CandidateScoreBreakdown,
  type CinephileInsight,
  type CriticPersona,
  type DirectorBayesianStat,
  type ExploreLaneKind,
  type GenreBayesianStat,
  type ScoreResult,
  type ScoreResultBreakdown,
  type ScoredCandidate,
  type UserRating,
  type UserVectorProfile,
} from '@/lib/recommendation/types';

export {
  bayesianAverage,
  cosineSimilarity,
  cosineSimilaritySparse,
  daysSinceDate,
  exponentialTimeDecayWeight,
  l2Normalize,
  mean,
  normalizeVoteQuality,
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
export { buildUserRecommendationProfile } from '@/lib/recommendation/build-keyword-profile';
export { buildCinephileInsights } from '@/lib/recommendation/build-cinephile-insights';
export { cinephileRowsToUserRatings } from '@/lib/recommendation/map-rows';
export {
  computeAffinity,
  scoreCandidate,
  scoreCandidatePartial,
} from '@/lib/recommendation/score-candidate';
export { rankCandidates, type ScoredMediaCandidate } from '@/lib/recommendation/rank-candidates';
export { formatAffinityPercent, formatRecommendationReason } from '@/lib/recommendation/format-reason';
export { GENRE_AXIS } from '@/lib/recommendation/genre-axis';
export { buildSeenMediaSet } from '@/lib/recommendation/seen-media';
export {
  getRecommendedLane,
  type LaneQuery,
  type RankedLaneItem,
} from '@/lib/recommendation/lanes/get-recommended-lane';
export type { MediaCandidate, MediaRef, MediaType } from '@/lib/recommendation/media-candidate';

export function getUserRecommendationProfile(
  rows: CinephileStatsRow[],
): UserVectorProfile | null {
  const ratings = cinephileRowsToUserRatings(rowsForImportedDisplay(rows));
  return buildUserRecommendationProfile(ratings);
}

export function rankCandidatesFromRows(
  rows: CinephileStatsRow[],
  candidates: MediaCandidate[],
): ScoredMediaCandidate[] {
  const profile = getUserRecommendationProfile(rows);
  if (!profile) return [];
  return rankCandidates(profile, candidates);
}
