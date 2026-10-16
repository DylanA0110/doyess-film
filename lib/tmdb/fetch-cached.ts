import { createHash } from 'crypto';
import { tmdbCacheGet, tmdbCacheKey, tmdbCacheSet } from '@/lib/cache/tmdb-redis';

const DEFAULT_TTL = 7 * 24 * 3600;

export async function fetchTmdbJsonCached<T>(
  url: string,
  options: {
    cacheKind: 'movie' | 'tv' | 'search' | 'discover';
    cacheId: string;
    ttlSeconds?: number;
    init?: RequestInit;
  },
): Promise<T> {
  const key = tmdbCacheKey(options.cacheKind, options.cacheId);
  const cached = await tmdbCacheGet(key);
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      /* miss */
    }
  }

  const response = await fetch(url, options.init);
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }
  const data = (await response.json()) as T;
  await tmdbCacheSet(key, JSON.stringify(data), options.ttlSeconds ?? DEFAULT_TTL);
  return data;
}

export function hashDiscoverParams(params: Record<string, string | number | undefined>): string {
  const raw = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return createHash('sha256').update(raw).digest('hex').slice(0, 20);
}
