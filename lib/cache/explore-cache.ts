import type { ExplorePagePayload } from '@/lib/recommendation/lanes/build-explore-lanes';
import { tmdbCacheDel, tmdbCacheGet, tmdbCacheSet } from '@/lib/cache/tmdb-redis';

const TTL_SECONDS = 300;

function exploreCacheKey(userId: string): string {
  return `explore:page:${userId}`;
}

export async function getExplorePageCache(
  userId: string,
): Promise<ExplorePagePayload | null> {
  const raw = await tmdbCacheGet(exploreCacheKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ExplorePagePayload;
  } catch {
    return null;
  }
}

export async function setExplorePageCache(
  userId: string,
  payload: ExplorePagePayload,
): Promise<void> {
  await tmdbCacheSet(exploreCacheKey(userId), JSON.stringify(payload), TTL_SECONDS);
}

export async function invalidateExplorePageCache(userId: string): Promise<void> {
  await tmdbCacheDel(exploreCacheKey(userId));
}
