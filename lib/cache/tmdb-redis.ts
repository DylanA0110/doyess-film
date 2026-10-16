import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

export async function tmdbCacheGet(key: string): Promise<string | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    const value = await client.get<string>(key);
    return value ?? null;
  } catch {
    return null;
  }
}

export async function tmdbCacheSet(
  key: string,
  value: string,
  ttlSeconds: number,
): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.set(key, value, { ex: ttlSeconds });
  } catch {
    /* ignore cache write errors */
  }
}

export async function tmdbCacheDel(key: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.del(key);
  } catch {
    /* ignore */
  }
}

export function tmdbCacheKey(kind: 'movie' | 'tv' | 'search' | 'discover', id: string): string {
  return `tmdb:${kind}:${id}`;
}
