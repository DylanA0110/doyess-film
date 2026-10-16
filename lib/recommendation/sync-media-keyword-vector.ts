import type { SupabaseClient } from '@supabase/supabase-js';
import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';
import {
  keywordsListToDense,
  sparseToDense,
  vectorToPg,
} from '@/lib/recommendation/dense-keyword-vector';

export async function upsertMediaKeywordVector(
  supabase: SupabaseClient,
  tmdbId: number,
  mediaType: TmdbMediaType,
  keywords: string[],
  sparseWeights?: Record<string, number>,
): Promise<void> {
  if (!tmdbId) return;
  const dense = sparseWeights
    ? sparseToDense(sparseWeights)
    : keywordsListToDense(keywords);
  const { error } = await supabase.from('media_keyword_vectors').upsert(
    {
      tmdb_id: tmdbId,
      media_type: mediaType,
      embedding: vectorToPg(dense),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'tmdb_id,media_type' },
  );
  if (error) {
    if (error.message.includes('media_keyword_vectors')) return;
    throw new Error(error.message);
  }
}
