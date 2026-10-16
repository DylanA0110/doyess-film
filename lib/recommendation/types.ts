import type { TitleKind } from '@/components/dashboard/types';

export const ALGORITHM_VERSION = 3;

export const SCORE_WEIGHT_AFFINITY = 0.6;
export const SCORE_WEIGHT_QUALITY = 0.3;
export const SCORE_WEIGHT_DIRECTOR = 0.1;

export const HIDDEN_GEM_VOTE_MAX = 1500;
export const HIDDEN_GEM_AFFINITY_MIN = 0.8;
export const HIDDEN_GEM_MULTIPLIER = 1.5;

export const BAYES_M_GENRE = 3;
export const BAYES_M_DIRECTOR = 2;

export const GUILTY_PLEASURE_MEAN_Z = -0.5;
export const GUILTY_PLEASURE_MIN_COUNT = 5;

export type UserRating = {
  movieId: string;
  imdbId: string | null;
  title: string;
  rating: number;
  genres: string[];
  directors: string[];
  releaseYear: number | null;
  titleKind: TitleKind;
  dateRated: string | null;
  keywords?: string[];
};

export type GenreBayesianStat = {
  name: string;
  count: number;
  meanRating: number;
  meanZ: number;
  bayesianScore: number;
  frequencyRank: number;
  bayesianRank: number;
};

export type DirectorBayesianStat = {
  name: string;
  count: number;
  meanZ: number;
  bayesianScore: number;
  avgRating: number;
};

export type CriticPersona = {
  label: string;
  globalMean: number;
  globalStdDev: number;
  detail: string;
};

export type TitleKindTasteSlice = {
  criticPersona: CriticPersona;
  genreStats: GenreBayesianStat[];
  dominantByAffinity: string;
  dominantByVolume: string;
  ratingsCount: number;
};

export type UserVectorProfile = {
  algorithmVersion: number;
  globalMean: number;
  globalStdDev: number;
  criticPersona: CriticPersona;
  /** Vector L2-normalizado sobre GENRE_AXIS */
  genreVector: number[];
  genreStats: GenreBayesianStat[];
  dominantByBayes: string;
  dominantByFrequency: string;
  topGenreNames: string[];
  topDirectors: DirectorBayesianStat[];
  yearMin: number;
  yearMax: number;
  minVoteAverage: number;
  seedImdbIds: string[];
  ratingsCount: number;
  moviesTaste: TitleKindTasteSlice | null;
  seriesTaste: TitleKindTasteSlice | null;
  /** Sparse TF-IDF L2-normalizado (v3) */
  keywordVector: Record<string, number>;
  topKeywords: string[];
};

export type ScoreResultBreakdown = {
  affinity: number;
  qualityNorm: number;
  directorBonusNorm: number;
  hiddenGemMultiplier: number;
  alignedKeywords: string[];
};

export type ScoreResult = {
  finalScore: number;
  reason: string;
  breakdown: ScoreResultBreakdown;
};

export type CandidateMovie = {
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseYear: number | null;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  director: string | null;
};

export type CandidateScoreBreakdown = {
  cosineAffinity: number;
  qualityBonus: number;
  directorBonus: number;
  finalScore: number;
  alignedGenreLabels: string[];
  directorInTop5: boolean;
};

export type ScoredCandidate = {
  candidate: CandidateMovie;
  breakdown: CandidateScoreBreakdown;
};

export type ExploreLaneKind = 'genre' | 'director' | 'hiddenGems' | 'becauseYouLoved';

export type CinephileInsightKind =
  | 'trueFavoriteGenre'
  | 'reliableDirector'
  | 'guiltyPleasure'
  | 'criticStyle';

export type CinephileInsight = {
  kind: CinephileInsightKind;
  headline: string;
  detail: string;
  evidence: string;
};
