'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { UnifiedSearchHit } from '@/lib/tmdb/search-media';

async function fetchMediaSearch(query: string): Promise<UnifiedSearchHit[]> {
  const response = await fetch(`/api/tmdb/search-media?q=${encodeURIComponent(query)}`);
  const data = (await response.json()) as { results?: UnifiedSearchHit[]; error?: string };
  if (!response.ok) throw new Error(data.error ?? 'Error de búsqueda');
  return data.results ?? [];
}

export function useMediaSearch(debouncedQuery: string) {
  const trimmed = debouncedQuery.trim();
  return useQuery({
    queryKey: queryKeys.mediaSearch(trimmed),
    queryFn: () => fetchMediaSearch(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 5 * 60_000,
  });
}
