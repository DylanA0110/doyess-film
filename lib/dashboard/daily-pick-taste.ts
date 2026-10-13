import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import type { DashboardStats } from '@/components/dashboard/types';
import { titleKindFromImdbType } from '@/lib/imdb/title-kind';

export type DailyPickTasteProfile = {
  genreNames: string[];
  genreWeights: Record<string, number>;
  yearMin: number;
  yearMax: number;
  minVoteAverage: number;
  /** IMDb ids de títulos 9–10 para recomendaciones TMDB */
  seedImdbIds: string[];
};

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.floor((sorted.length - 1) * p);
  return sorted[Math.max(0, idx)];
}

export function buildDailyPickTasteProfile(
  rows: CinephileStatsRow[],
  stats: DashboardStats,
): DailyPickTasteProfile {
  const genreWeights: Record<string, number> = {};
  for (const g of stats.topGenres.slice(0, 5)) {
    genreWeights[g.name] = g.percentage / 100;
  }

  const likedYears = rows
    .filter((r) => r.rating >= 7 && r.release_year)
    .map((r) => r.release_year as number)
    .sort((a, b) => a - b);

  const allYears = rows
    .filter((r) => r.release_year)
    .map((r) => r.release_year as number)
    .sort((a, b) => a - b);

  const baseYears = likedYears.length >= 8 ? likedYears : allYears;
  const yearMin =
    baseYears.length > 0 ? percentile(baseYears, 0.12) : 1970;
  const yearMax =
    baseYears.length > 0 ? percentile(baseYears, 0.88) : new Date().getFullYear();

  const minVoteAverage =
    stats.averageRating >= 7.5 ? 7.4 : stats.averageRating >= 6.5 ? 7.0 : 6.6;

  const seeds = rows
    .filter(
      (r) =>
        r.imdb_id?.trim() &&
        r.rating >= 9 &&
        titleKindFromImdbType(r.title_type) === 'movie',
    )
    .sort((a, b) => b.rating - a.rating || (b.release_year ?? 0) - (a.release_year ?? 0))
    .slice(0, 3)
    .map((r) => r.imdb_id!.trim());

  if (seeds.length === 0) {
    rows
      .filter((r) => r.imdb_id?.trim() && r.rating >= 8)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 2)
      .forEach((r) => seeds.push(r.imdb_id!.trim()));
  }

  const genreNames =
    stats.topGenres.length > 0
      ? stats.topGenres.slice(0, 3).map((g) => g.name)
      : stats.dominantGenreName !== '—'
        ? [stats.dominantGenreName]
        : ['Drama'];

  return {
    genreNames,
    genreWeights,
    yearMin: Math.max(1950, yearMin - 2),
    yearMax: Math.min(new Date().getFullYear(), yearMax + 2),
    minVoteAverage,
    seedImdbIds: seeds,
  };
}
