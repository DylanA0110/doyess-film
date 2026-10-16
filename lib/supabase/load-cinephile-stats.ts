import type { SupabaseClient } from '@supabase/supabase-js';
import type { CinephileStatsRow } from '@/lib/imdb/build-dashboard-stats';

const CINEPHILE_SELECT =
  'user_id, movie_id, imdb_id, title, title_type, release_year, runtime_mins, genres, directors, poster_path, tmdb_id, tmdb_media_type, tmdb_keywords, enrichment_status, cast_snapshot, crew_snapshot, rating, date_rated';

type MovieEmbed = {
  id: string;
  imdb_id?: string | null;
  title: string;
  title_type?: string | null;
  release_year: number | null;
  runtime_mins?: number | null;
  genres: string[] | null;
  directors: string[] | null;
  poster_path?: string | null;
  enrichment_status?: string | null;
  cast_snapshot?: unknown;
  crew_snapshot?: unknown;
  tmdb_id?: number | null;
  tmdb_media_type?: string | null;
  tmdb_keywords?: string[] | null;
};

function normalizeMovieEmbed(
  movies: MovieEmbed | MovieEmbed[] | null,
): MovieEmbed | null {
  if (!movies) return null;
  return Array.isArray(movies) ? movies[0] ?? null : movies;
}

function mapMovieToRow(userId: string, movie: MovieEmbed, rating: number, date_rated: string | null): CinephileStatsRow {
  return {
    user_id: userId,
    movie_id: movie.id,
    imdb_id: movie.imdb_id ?? null,
    title: movie.title,
    title_type: movie.title_type ?? null,
    release_year: movie.release_year,
    runtime_mins: movie.runtime_mins ?? null,
    genres: movie.genres,
    directors: movie.directors,
    poster_path: movie.poster_path ?? null,
    enrichment_status: movie.enrichment_status ?? 'pending',
    cast_snapshot: (movie.cast_snapshot as CinephileStatsRow['cast_snapshot']) ?? [],
    crew_snapshot: (movie.crew_snapshot as CinephileStatsRow['crew_snapshot']) ?? [],
    tmdb_id: movie.tmdb_id ?? null,
    tmdb_media_type: movie.tmdb_media_type ?? null,
    tmdb_keywords: movie.tmdb_keywords ?? [],
    rating,
    date_rated,
  };
}

export async function loadCinephileStatsRows(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ rows: CinephileStatsRow[]; schemaWarning: string | null }> {
  const { data: viewRows, error: viewError } = await supabase
    .from('cinephile_stats')
    .select(CINEPHILE_SELECT)
    .eq('user_id', userId);

  if (!viewError) {
    return { rows: (viewRows ?? []) as CinephileStatsRow[], schemaWarning: null };
  }

  const missingView =
    viewError.message.includes('cinephile_stats') ||
    viewError.message.includes('schema cache');

  if (!missingView) {
    return { rows: [], schemaWarning: viewError.message };
  }

  const { data: joinRows, error: joinError } = await supabase
    .from('user_ratings')
    .select(
      'rating, date_rated, movie_id, movies ( id, imdb_id, title, title_type, release_year, runtime_mins, genres, directors, poster_path, tmdb_id, tmdb_media_type, tmdb_keywords, enrichment_status, cast_snapshot, crew_snapshot )',
    )
    .eq('user_id', userId);

  if (joinError) {
    return {
      rows: [],
      schemaWarning:
        'Falta el esquema en Supabase. Ejecuta supabase/schema.sql en el SQL Editor.',
    };
  }

  const rows: CinephileStatsRow[] = [];

  for (const row of joinRows ?? []) {
    const movie = normalizeMovieEmbed(
      (row as { movies: MovieEmbed | MovieEmbed[] | null }).movies,
    );
    if (!movie) continue;
    rows.push(
      mapMovieToRow(
        userId,
        movie,
        (row as { rating: number }).rating,
        (row as { date_rated: string | null }).date_rated,
      ),
    );
  }

  return {
    rows,
    schemaWarning:
      'Ejecuta supabase/migrations/002_tmdb_enrichment.sql para pósters TMDB (vista ampliada).',
  };
}
