'use client';

import { useQuery } from '@tanstack/react-query';
import type { ExplorePagePayload } from '@/lib/recommendation/lanes/build-explore-lanes';
import { queryKeys } from '@/lib/query-keys';

async function fetchExplore(): Promise<ExplorePagePayload> {
  const res = await fetch('/api/explore');
  if (!res.ok) throw new Error('No se pudo cargar Explorar');
  return (await res.json()) as ExplorePagePayload;
}

export function useExploreLanes(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.explore(userId),
    queryFn: fetchExplore,
    enabled,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
