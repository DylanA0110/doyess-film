'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';
import { invalidateUserCinephileData } from '@/lib/invalidate-user-cinephile';
import { PENDING_ENRICH_SESSION_KEY } from '@/lib/imdb/run-tmdb-enrich-batches';

type SubmitRatingInput = {
  tmdbId: number;
  mediaType: TmdbMediaType;
  rating: number;
};

type SubmitRatingResponse = {
  ok: boolean;
  needsEnrichment?: boolean;
  imdbId?: string;
  error?: string;
};

async function postRating(input: SubmitRatingInput): Promise<SubmitRatingResponse> {
  const response = await fetch('/api/ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as SubmitRatingResponse;
  if (!response.ok) throw new Error(data.error ?? 'No se pudo guardar la nota');
  return data;
}

export function useSubmitRating(userId: string | undefined) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: postRating,
    onSuccess: (data) => {
      if (data.needsEnrichment && typeof window !== 'undefined') {
        sessionStorage.setItem(PENDING_ENRICH_SESSION_KEY, '1');
        sessionStorage.removeItem('doyess-film-silent-enrich-attempted');
      }
      if (userId) {
        invalidateUserCinephileData(queryClient, userId);
      }
      router.refresh();
    },
  });
}
