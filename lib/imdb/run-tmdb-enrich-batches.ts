import type { ImportedTitle } from '@/lib/imdb/types';
import { ENRICH_BATCH_SIZE } from '@/lib/tmdb/enrich-batch';

const MAX_BATCHES_PER_SESSION = 50;

export const PENDING_ENRICH_SESSION_KEY = 'doyess-film-pending-enrich';

type EnrichResponse = {
  enriched: number;
  failed: number;
  skipped?: number;
  remaining: number;
  errors?: string[];
};

async function postEnrich(imdbIds: string[]): Promise<EnrichResponse> {
  const response = await fetch('/api/tmdb/enrich', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(imdbIds.length ? { imdbIds } : {}),
  });

  const data = (await response.json()) as EnrichResponse & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? 'Error al enriquecer con TMDB');
  }
  return data;
}

export type EnrichProgressCallback = (message: string, progressPercent?: number) => void;

/** Tras import: solo cola pending en servidor (no re-envía todo el CSV). */
export async function runTmdbEnrichAfterImport(
  _titles: ImportedTitle[],
  onProgress?: EnrichProgressCallback,
): Promise<EnrichResponse> {
  let totalEnriched = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let batchIndex = 0;
  let remaining = 1;

  while (remaining > 0 && batchIndex < MAX_BATCHES_PER_SESSION) {
    batchIndex += 1;
    const pct = Math.min(95, Math.round((batchIndex / 10) * 90));
    onProgress?.(`Enriqueciendo con TMDB (lote ${batchIndex})…`, pct);

    const result = await postEnrich([]);
    totalEnriched += result.enriched;
    totalFailed += result.failed;
    totalSkipped += result.skipped ?? 0;
    remaining = result.remaining;

    if (result.enriched === 0 && result.failed === 0 && (result.skipped ?? 0) === 0) {
      break;
    }
  }

  onProgress?.('TMDB listo', 100);

  return {
    enriched: totalEnriched,
    failed: totalFailed,
    skipped: totalSkipped,
    remaining,
  };
}

/** Enriquece películas del usuario con enrichment_status = pending. */
export async function runTmdbEnrichPending(
  onProgress?: EnrichProgressCallback,
): Promise<EnrichResponse> {
  let totalEnriched = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let remaining = 1;
  let batchIndex = 0;
  let lastErrors: string[] | undefined;

  while (remaining > 0 && batchIndex < MAX_BATCHES_PER_SESSION) {
    batchIndex += 1;
    onProgress?.(`Enriqueciendo con TMDB (lote ${batchIndex})…`, Math.min(95, batchIndex * 8));

    try {
      const result = await postEnrich([]);
      totalEnriched += result.enriched;
      totalFailed += result.failed;
      totalSkipped += result.skipped ?? 0;
      remaining = result.remaining;
      lastErrors = result.errors;

      if (result.enriched === 0 && result.failed === 0 && (result.skipped ?? 0) === 0) {
        break;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al enriquecer';
      throw new Error(message);
    }
  }

  return {
    enriched: totalEnriched,
    failed: totalFailed,
    skipped: totalSkipped,
    remaining,
    errors: lastErrors,
  };
}

/** Prioriza ids nuevos del import (solo si siguen pending en servidor). */
export async function runTmdbEnrichNewIds(
  newImdbIds: string[],
  onProgress?: EnrichProgressCallback,
): Promise<EnrichResponse> {
  const unique = [...new Set(newImdbIds.filter(Boolean))];
  let totalEnriched = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (let offset = 0; offset < unique.length; offset += ENRICH_BATCH_SIZE) {
    const batch = unique.slice(offset, offset + ENRICH_BATCH_SIZE);
    const batchNum = Math.floor(offset / ENRICH_BATCH_SIZE) + 1;
    onProgress?.(`Enriqueciendo novedades (lote ${batchNum})…`, Math.min(40, batchNum * 10));
    const result = await postEnrich(batch);
    totalEnriched += result.enriched;
    totalFailed += result.failed;
    totalSkipped += result.skipped ?? 0;
  }

  const tail = await runTmdbEnrichPending(onProgress);
  return {
    enriched: totalEnriched + tail.enriched,
    failed: totalFailed + tail.failed,
    skipped: totalSkipped + (tail.skipped ?? 0),
    remaining: tail.remaining,
    errors: tail.errors,
  };
}
