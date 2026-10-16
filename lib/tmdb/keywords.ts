import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';
import { slugifyKeyword } from '@/lib/recommendation/keyword-idf';

const TMDB_BASE = 'https://api.themoviedb.org/3';

function getToken() {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) throw new Error('TMDB_API_TOKEN is not configured');
  return token;
}

export async function fetchTmdbKeywords(
  mediaType: TmdbMediaType,
  tmdbId: number,
): Promise<string[]> {
  const path =
    mediaType === 'tv'
      ? `${TMDB_BASE}/tv/${tmdbId}/keywords`
      : `${TMDB_BASE}/movie/${tmdbId}/keywords`;

  const response = await fetch(path, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/json',
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return [];

  const data = (await response.json()) as {
    keywords?: Array<{ id: number; name: string }>;
    results?: Array<{ id: number; name: string }>;
  };

  const raw = data.keywords ?? data.results ?? [];
  const slugs = new Set<string>();
  for (const kw of raw) {
    const slug = slugifyKeyword(kw.name);
    if (slug) slugs.add(slug);
  }
  return [...slugs];
}

/** Concurrencia acotada sin dependencia extra */
export async function searchTmdbKeywordId(query: string): Promise<number | null> {
  const q = query.trim();
  if (!q) return null;

  const url = new URL(`${TMDB_BASE}/search/keyword`);
  url.searchParams.set('query', q);
  url.searchParams.set('page', '1');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/json',
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    results?: Array<{ id: number; name: string }>;
  };
  const hit = data.results?.[0];
  return hit?.id ?? null;
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
