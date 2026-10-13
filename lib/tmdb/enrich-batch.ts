import { enrichMovieFromImdbId } from '@/lib/tmdb/enrich-movie';

export const ENRICH_BATCH_SIZE = 10;

export type EnrichBatchItemResult = {
  imdbId: string;
  ok: boolean;
  error?: string;
};

export async function enrichImdbIdBatch(
  imdbIds: string[],
): Promise<EnrichBatchItemResult[]> {
  const unique = [...new Set(imdbIds.map((id) => id.trim()).filter(Boolean))].slice(
    0,
    ENRICH_BATCH_SIZE,
  );

  const results: EnrichBatchItemResult[] = [];

  for (const imdbId of unique) {
    try {
      const payload = await enrichMovieFromImdbId(imdbId);
      if (!payload) {
        results.push({ imdbId, ok: false, error: 'No encontrado en TMDB' });
        continue;
      }
      results.push({ imdbId, ok: true });
    } catch (err) {
      results.push({
        imdbId,
        ok: false,
        error: err instanceof Error ? err.message : 'Error TMDB',
      });
    }
  }

  return results;
}
