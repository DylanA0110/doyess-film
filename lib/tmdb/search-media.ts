import { createHash } from 'crypto';
import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';
import { tmdbCacheGet, tmdbCacheKey, tmdbCacheSet } from '@/lib/cache/tmdb-redis';

const TMDB_BASE = 'https://api.themoviedb.org/3';

function getToken() {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) throw new Error('TMDB_API_TOKEN is not configured');
  return token;
}

export type UnifiedSearchHit = {
  tmdbId: number;
  mediaType: TmdbMediaType;
  title: string;
  year?: number;
  overview: string;
  posterPath: string | null;
  voteAverage: number;
};

type RawHit = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  poster_path?: string | null;
  vote_average?: number;
};

function yearFromDate(value?: string): number | undefined {
  if (!value?.trim()) return undefined;
  const y = Number(value.slice(0, 4));
  return Number.isFinite(y) ? y : undefined;
}

function mapHit(hit: RawHit, mediaType: TmdbMediaType): UnifiedSearchHit {
  const title = (mediaType === 'tv' ? hit.name : hit.title)?.trim() || 'Sin título';
  const date = mediaType === 'tv' ? hit.first_air_date : hit.release_date;
  return {
    tmdbId: hit.id,
    mediaType,
    title,
    year: yearFromDate(date),
    overview: String(hit.overview ?? '').trim(),
    posterPath: hit.poster_path ?? null,
    voteAverage: hit.vote_average ?? 0,
  };
}

async function searchEndpoint(path: string, query: string): Promise<RawHit[]> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('query', query);
  url.searchParams.set('language', 'es-MX');
  url.searchParams.set('include_adult', 'false');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/json',
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) return [];
  const data = (await response.json()) as { results?: RawHit[] };
  return data.results ?? [];
}

const SEARCH_CACHE_TTL_SECONDS = 3600;

export async function searchTmdbMedia(query: string, limit = 12): Promise<UnifiedSearchHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const cacheKey = tmdbCacheKey(
    'search',
    createHash('sha256').update(trimmed.toLowerCase()).digest('hex').slice(0, 16),
  );
  const cached = await tmdbCacheGet(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as UnifiedSearchHit[];
    } catch {
      /* miss */
    }
  }

  const [movies, tv] = await Promise.all([
    searchEndpoint('/search/movie', trimmed),
    searchEndpoint('/search/tv', trimmed),
  ]);

  const merged: UnifiedSearchHit[] = [
    ...movies.map((m) => mapHit(m, 'movie')),
    ...tv.map((t) => mapHit(t, 'tv')),
  ];

  merged.sort((a, b) => b.voteAverage - a.voteAverage);
  const result = merged.slice(0, limit);
  await tmdbCacheSet(cacheKey, JSON.stringify(result), SEARCH_CACHE_TTL_SECONDS);
  return result;
}
