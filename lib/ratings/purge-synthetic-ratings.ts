import type { SupabaseClient } from '@supabase/supabase-js';
import { isSyntheticImdbId } from '@/lib/ratings/synthetic-imdb-id';

/** Calificaciones de prueba en sesiones de QA (TMDB). */
const KNOWN_QA_TMDB_IDS = [372058, 124364] as const;

type RatingJoin = {
  movie_id: string;
  movies:
    | { imdb_id: string; tmdb_id: number | null }
    | { imdb_id: string; tmdb_id: number | null }[]
    | null;
};

function movieImdb(row: RatingJoin): string | null {
  const m = row.movies;
  if (!m) return null;
  if (Array.isArray(m)) return m[0]?.imdb_id ?? null;
  return m.imdb_id ?? null;
}

/**
 * Quita calificaciones hechas en la app con id sintético cuando el usuario ya tiene CSV IMDb.
 * Evita que pruebas (QA) contaminen Resumen, Para vos y listas.
 */
export async function purgeSyntheticRatingsWhenImported(
  supabase: SupabaseClient,
  userId: string,
  importedRatingCount: number,
): Promise<number> {
  if (importedRatingCount === 0) return 0;

  const { data, error } = await supabase
    .from('user_ratings')
    .select('movie_id, movies!inner ( imdb_id )')
    .eq('user_id', userId);

  if (error || !data?.length) return 0;

  const syntheticIds = (data as RatingJoin[])
    .filter((row) => isSyntheticImdbId(movieImdb(row)))
    .map((row) => row.movie_id);

  if (syntheticIds.length === 0) return 0;

  const { error: delError } = await supabase
    .from('user_ratings')
    .delete()
    .eq('user_id', userId)
    .in('movie_id', syntheticIds);

  if (delError) return 0;
  return syntheticIds.length;
}

function movieTmdb(row: RatingJoin): number | null {
  const m = row.movies;
  if (!m) return null;
  if (Array.isArray(m)) return m[0]?.tmdb_id ?? null;
  return m.tmdb_id ?? null;
}

/** Quita títulos calificados solo en pruebas (p. ej. Tu nombre / From) si hay historial IMDb. */
export async function purgeKnownQaTmdbRatings(
  supabase: SupabaseClient,
  userId: string,
  importedRatingCount: number,
): Promise<number> {
  if (importedRatingCount === 0) return 0;

  const { data, error } = await supabase
    .from('user_ratings')
    .select('movie_id, movies!inner ( imdb_id, tmdb_id )')
    .eq('user_id', userId);

  if (error || !data?.length) return 0;

  const qaSet = new Set<number>(KNOWN_QA_TMDB_IDS);
  const toDelete = (data as RatingJoin[])
    .filter((row) => {
      const tid = movieTmdb(row);
      return tid != null && qaSet.has(tid as (typeof KNOWN_QA_TMDB_IDS)[number]);
    })
    .map((row) => row.movie_id);

  if (toDelete.length === 0) return 0;

  const { error: delError } = await supabase
    .from('user_ratings')
    .delete()
    .eq('user_id', userId)
    .in('movie_id', toDelete);

  if (delError) return 0;
  return toDelete.length;
}
