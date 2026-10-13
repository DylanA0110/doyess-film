'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  runTmdbEnrichPending,
  type EnrichProgressCallback,
} from '@/lib/imdb/run-tmdb-enrich-batches';

export function useTmdbEnrich(userId: string | undefined) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (onPhaseChange?: EnrichProgressCallback) => {
      return runTmdbEnrichPending(onPhaseChange);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['cinephile-stats', userId] });
      }
      router.refresh();
    },
  });
}
