import type { SupabaseClient } from '@supabase/supabase-js';
import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';

export async function lookupUserRatingByTmdb(
  supabase: SupabaseClient,
  userId: string,
  mediaType: TmdbMediaType,
  tmdbId: number,
): Promise<number | null> {
  const { data: movie } = await supabase
    .from('movies')
    .select('id')
    .eq('tmdb_id', tmdbId)
    .eq('tmdb_media_type', mediaType)
    .maybeSingle();

  if (!movie?.id) return null;

  const { data: ratingRow } = await supabase
    .from('user_ratings')
    .select('rating')
    .eq('user_id', userId)
    .eq('movie_id', movie.id)
    .maybeSingle();

  const rating = ratingRow?.rating;
  return typeof rating === 'number' ? rating : null;
}
