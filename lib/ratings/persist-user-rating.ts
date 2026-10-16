import type { SupabaseClient } from '@supabase/supabase-js';
import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';
import { fetchTmdbMediaDetail } from '@/lib/tmdb/media-detail';
import { fetchTmdbKeywords } from '@/lib/tmdb/keywords';
import { syntheticImdbId, titleTypeForMedia } from '@/lib/ratings/synthetic-imdb-id';
import { scheduleTasteProfileRebuild } from '@/lib/jobs/rebuild-taste-profile';

export type PersistRatingInput = {
  userId: string;
  tmdbId: number;
  mediaType: TmdbMediaType;
  rating: number;
};

export type PersistRatingResult = {
  movieId: string;
  imdbId: string;
  needsEnrichment: boolean;
};

export async function persistUserRating(
  supabase: SupabaseClient,
  input: PersistRatingInput,
): Promise<PersistRatingResult> {
  const detail = await fetchTmdbMediaDetail(input.mediaType, input.tmdbId);
  if (!detail) {
    throw new Error('No se encontró el título en TMDB');
  }

  const imdbId =
    detail.imdbId?.trim() || syntheticImdbId(input.mediaType, input.tmdbId);

  const tmdbKeywords = await fetchTmdbKeywords(input.mediaType, input.tmdbId);

  const metadata = {
    title: detail.title,
    original_title: detail.title,
    title_type: titleTypeForMedia(input.mediaType),
    release_year: detail.year ?? null,
    runtime_mins: detail.runtimeMins ?? null,
    genres: detail.genres.length > 0 ? detail.genres : null,
    poster_path: detail.posterPath,
    tmdb_id: input.tmdbId,
    tmdb_media_type: input.mediaType,
    tmdb_keywords: tmdbKeywords.length > 0 ? tmdbKeywords : null,
    directors: detail.directors.length > 0 ? detail.directors : null,
    enrichment_status: tmdbKeywords.length > 0 ? 'done' : 'pending',
  };

  const { data: existing } = await supabase
    .from('movies')
    .select('id, enrichment_status')
    .eq('imdb_id', imdbId)
    .maybeSingle();

  let movieId: string;
  let needsEnrichment = false;

  if (existing) {
    const { error: updateError } = await supabase
      .from('movies')
      .update(metadata)
      .eq('imdb_id', imdbId);
    if (updateError) throw new Error(updateError.message);
    movieId = existing.id;
    needsEnrichment = (existing.enrichment_status ?? 'pending') === 'pending';
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from('movies')
      .insert({
        imdb_id: imdbId,
        ...metadata,
      })
      .select('id')
      .single();

    if (insertError || !inserted) {
      throw new Error(insertError?.message ?? 'No se pudo guardar el título');
    }
    movieId = inserted.id;
    needsEnrichment = metadata.enrichment_status === 'pending';
  }

  const today = new Date().toISOString().slice(0, 10);
  const { error: ratingError } = await supabase.from('user_ratings').upsert(
    {
      user_id: input.userId,
      movie_id: movieId,
      rating: Math.round(input.rating),
      date_rated: today,
    },
    { onConflict: 'user_id,movie_id' },
  );

  if (ratingError) throw new Error(ratingError.message);

  await scheduleTasteProfileRebuild(supabase, input.userId, {
    name: 'rating.added',
    data: { userId: input.userId, movieId, imdbId },
  });

  return { movieId, imdbId, needsEnrichment };
}
