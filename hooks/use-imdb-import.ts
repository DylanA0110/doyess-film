'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ImportedTitle } from '@/lib/imdb/types';
import {
  PENDING_ENRICH_SESSION_KEY,
  runTmdbEnrichAfterImport,
  type EnrichProgressCallback,
} from '@/lib/imdb/run-tmdb-enrich-batches';

type ImportResponse = {
  imported: number;
  skipped: number;
  newImdbIds?: string[];
  errors: string[];
};

export type ImportWithEnrichOptions = {
  onPhaseChange?: EnrichProgressCallback;
};

async function importImdbTitles(titles: ImportedTitle[]): Promise<ImportResponse> {
  const response = await fetch('/api/imdb/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titles }),
  });

  const data = (await response.json()) as ImportResponse & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? 'Error al importar el CSV');
  }

  return data;
}

export function useImdbImport(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      titles,
      onPhaseChange,
    }: {
      titles: ImportedTitle[];
      onPhaseChange?: EnrichProgressCallback;
    }) => {
      onPhaseChange?.('Guardando calificaciones…', 25);
      const importResult = await importImdbTitles(titles);
      if (importResult.imported === 0) {
        return { ...importResult, enrichRemaining: 0 };
      }

      if (importResult.newImdbIds && importResult.newImdbIds.length > 0) {
        sessionStorage.setItem(PENDING_ENRICH_SESSION_KEY, '1');
        sessionStorage.removeItem('doyess-film-silent-enrich-attempted');
      }

      onPhaseChange?.('Enriqueciendo con TMDB…', 40);
      let enrich = { enriched: 0, failed: 0, remaining: 0 };
      try {
        enrich = await runTmdbEnrichAfterImport(titles, onPhaseChange);
      } catch (enrichErr) {
        console.error('[imdb-import] TMDB enrich', enrichErr);
        enrich = {
          enriched: 0,
          failed: 0,
          remaining: importResult.newImdbIds?.length ?? 0,
        };
      }
      return { ...importResult, enrichRemaining: enrich.remaining };
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['cinephile-stats', userId] });
      }
    },
  });
}
