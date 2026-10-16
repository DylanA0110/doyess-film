'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { MediaDetailPayload } from '@/lib/tmdb/media-detail';
import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';

async function fetchMediaDetail(
  mediaType: TmdbMediaType,
  tmdbId: number,
): Promise<MediaDetailPayload> {
  const response = await fetch(
    `/api/tmdb/detail?type=${mediaType}&id=${tmdbId}`,
  );
  const data = (await response.json()) as { detail?: MediaDetailPayload; error?: string };
  if (!response.ok) throw new Error(data.error ?? 'Error al cargar ficha');
  if (!data.detail) throw new Error('Sin datos');
  return data.detail;
}

export function useMediaDetail(
  mediaType: TmdbMediaType | null | undefined,
  tmdbId: number | null | undefined,
  enabled = true,
) {
  const id = tmdbId ?? 0;
  const type = mediaType ?? 'movie';
  return useQuery({
    queryKey: queryKeys.mediaDetail(type, id),
    queryFn: () => fetchMediaDetail(type, id),
    enabled: enabled && Boolean(mediaType) && id > 0,
    staleTime: 10 * 60_000,
  });
}
