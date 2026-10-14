import type { DashboardMovie } from '@/components/dashboard/types';
import {
  cinephileRowToMovie,
  type CinephileStatsRow,
} from '@/lib/imdb/build-dashboard-stats';
import { normalizePersonName } from '@/lib/imdb/normalize-person-name';
import { rowsForMovieKpis } from '@/lib/imdb/title-kind';
import type { TmdbCastSnapshotEntry } from '@/lib/tmdb/types';

function parseCast(value: unknown): TmdbCastSnapshotEntry[] {
  if (!value || !Array.isArray(value)) return [];
  return value as TmdbCastSnapshotEntry[];
}

/** Películas por persona (director o actor), clave = nombre normalizado. */
export function buildPersonMovieLookup(
  rows: CinephileStatsRow[],
): Record<string, DashboardMovie[]> {
  const lookup: Record<string, DashboardMovie[]> = {};
  const movieRows = rowsForMovieKpis(rows);

  const push = (person: string, movie: DashboardMovie) => {
    const key = normalizePersonName(person);
    if (!key) return;
    if (!lookup[key]) lookup[key] = [];
    if (lookup[key].some((m) => m.id === movie.id)) return;
    lookup[key].push(movie);
  };

  for (const row of movieRows) {
    const movie = cinephileRowToMovie(row);
    for (const d of row.directors ?? []) push(d, movie);
    for (const member of parseCast(row.cast_snapshot)) {
      if (member.name) push(member.name, movie);
    }
  }

  for (const key of Object.keys(lookup)) {
    lookup[key].sort((a, b) => (b.userRating ?? 0) - (a.userRating ?? 0));
  }

  return lookup;
}

export function moviesForPersonName(
  lookup: Record<string, DashboardMovie[]>,
  displayName: string,
): DashboardMovie[] {
  return lookup[normalizePersonName(displayName)] ?? [];
}
