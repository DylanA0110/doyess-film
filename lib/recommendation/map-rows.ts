import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';
import { titleKindFromImdbType } from '@/lib/imdb/title-kind';
import type { UserRating } from '@/lib/recommendation/types';

export function cinephileRowsToUserRatings(rows: CinephileStatsRow[]): UserRating[] {
  return rows.map((row) => ({
    movieId: row.movie_id,
    imdbId: row.imdb_id?.trim() || null,
    title: row.title,
    rating: row.rating,
    genres: row.genres ?? [],
    directors: row.directors ?? [],
    releaseYear: row.release_year,
    titleKind: titleKindFromImdbType(row.title_type),
    dateRated: row.date_rated,
    keywords: row.tmdb_keywords ?? [],
  }));
}
