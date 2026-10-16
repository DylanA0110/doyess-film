import { tmdbGenreIdFromImdbLabel } from '@/lib/tmdb/imdb-genre-to-tmdb';
import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';
import type { TmdbMovieListShape, TmdbTvListShape } from '@/lib/recommendation/media-candidate';
import { fetchTmdbJsonCached, hashDiscoverParams } from '@/lib/tmdb/fetch-cached';

const TMDB_BASE = 'https://api.themoviedb.org/3';

function getToken() {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) throw new Error('TMDB_API_TOKEN is not configured');
  return token;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    Accept: 'application/json',
  };
}

type DiscoverOptions = {
  mediaType: TmdbMediaType;
  genreName?: string;
  keywordId?: number;
  yearMin: number;
  yearMax: number;
  minVote: number;
  page: number;
  voteCountMin?: number;
  voteCountMax?: number;
  sortBy?: 'popularity.desc' | 'vote_average.desc';
};

export async function discoverMediaForTaste(
  options: DiscoverOptions,
): Promise<Array<TmdbMovieListShape | TmdbTvListShape>> {
  const url = new URL(`${TMDB_BASE}/discover/${options.mediaType}`);
  url.searchParams.set('language', 'es-MX');
  url.searchParams.set('sort_by', options.sortBy ?? 'popularity.desc');
  url.searchParams.set(
    'vote_count.gte',
    String(options.voteCountMin ?? 400),
  );
  if (options.voteCountMax != null) {
    url.searchParams.set('vote_count.lte', String(options.voteCountMax));
  }
  url.searchParams.set('vote_average.gte', String(options.minVote));
  url.searchParams.set('include_adult', 'false');
  url.searchParams.set('page', String(options.page));

  if (options.mediaType === 'movie') {
    url.searchParams.set('primary_release_date.gte', `${options.yearMin}-01-01`);
    url.searchParams.set('primary_release_date.lte', `${options.yearMax}-12-31`);
    if (options.genreName) {
      const genreId = tmdbGenreIdFromImdbLabel(options.genreName);
      if (genreId != null) {
        url.searchParams.set('with_genres', String(genreId));
      }
    }
  } else {
    url.searchParams.set('first_air_date.gte', `${options.yearMin}-01-01`);
    url.searchParams.set('first_air_date.lte', `${options.yearMax}-12-31`);
    if (options.genreName) {
      const genreId = tmdbGenreIdFromImdbLabel(options.genreName);
      if (genreId != null) {
        url.searchParams.set('with_genres', String(genreId));
      }
    }
  }

  if (options.keywordId != null) {
    url.searchParams.set('with_keywords', String(options.keywordId));
  }

  const cacheId = hashDiscoverParams({
    mediaType: options.mediaType,
    genre: options.genreName,
    keywordId: options.keywordId,
    yearMin: options.yearMin,
    yearMax: options.yearMax,
    minVote: options.minVote,
    page: options.page,
  });

  let data: { results?: Array<Record<string, unknown>> };
  try {
    data = await fetchTmdbJsonCached<{ results?: Array<Record<string, unknown>> }>(
      url.toString(),
      {
        cacheKind: 'discover',
        cacheId,
        ttlSeconds: 6 * 3600,
        init: { headers: authHeaders(), next: { revalidate: 3600 } },
      },
    );
  } catch {
    return [];
  }

  return (data.results ?? [])
    .filter((m) => m.poster_path && String(m.overview ?? '').trim())
    .map((m) => {
      const genreIds = Array.isArray(m.genre_ids)
        ? (m.genre_ids as number[]).filter((id) => typeof id === 'number')
        : [];
      return { ...m, genre_ids: genreIds } as TmdbMovieListShape | TmdbTvListShape;
    });
}
