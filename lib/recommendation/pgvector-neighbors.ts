import type { SupabaseClient } from '@supabase/supabase-js';
import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';
import { sparseToDense, vectorToPg } from '@/lib/recommendation/dense-keyword-vector';
import type { UserVectorProfile } from '@/lib/recommendation/types';

export type PgVectorNeighbor = {
  tmdbId: number;
  mediaType: TmdbMediaType;
  similarity: number;
};

export async function fetchPgVectorNeighbors(
  supabase: SupabaseClient,
  profile: UserVectorProfile,
  matchCount = 24,
): Promise<PgVectorNeighbor[]> {
  const keys = Object.keys(profile.keywordVector);
  if (keys.length === 0) return [];

  const queryEmbedding = vectorToPg(sparseToDense(profile.keywordVector));
  const { data, error } = await supabase.rpc('match_media_neighbors', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
  });

  if (error) {
    if (
      error.message.includes('match_media_neighbors') ||
      error.message.includes('vector')
    ) {
      return [];
    }
    throw new Error(error.message);
  }

  return (data ?? []).map(
    (row: { tmdb_id: number; media_type: string; similarity: number }) => ({
      tmdbId: row.tmdb_id,
      mediaType: row.media_type === 'tv' ? 'tv' : 'movie',
      similarity: row.similarity ?? 0,
    }),
  );
}
