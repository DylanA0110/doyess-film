import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';
const TMDB_BASE = 'https://api.themoviedb.org/3';

function getToken() {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) throw new Error('TMDB_API_TOKEN is not configured');
  return token;
}

export type MediaDetailPayload = {
  tmdbId: number;
  mediaType: TmdbMediaType;
  title: string;
  year?: number;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  runtimeMins?: number | null;
  genres: string[];
  directors: string[];
  voteAverage: number;
  imdbId: string | null;
};

function directorNamesFromCredits(
  mediaType: TmdbMediaType,
  credits?: {
    crew?: Array<{ name: string; job: string }>;
  },
  createdBy?: Array<{ name: string }>,
): string[] {
  const names = new Set<string>();
  for (const c of credits?.crew ?? []) {
    if (c.job === 'Director' || (mediaType === 'tv' && c.job === 'Executive Producer')) {
      names.add(c.name);
    }
  }
  if (mediaType === 'tv') {
    for (const c of createdBy ?? []) {
      if (c.name) names.add(c.name);
    }
  }
  return [...names].slice(0, 4);
}

async function fetchTvDetail(tmdbId: number): Promise<MediaDetailPayload | null> {
  const url = new URL(`${TMDB_BASE}/tv/${tmdbId}`);
  url.searchParams.set('language', 'es-MX');
  url.searchParams.set('append_to_response', 'external_ids,credits');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/json',
    },
    next: { revalidate: 3600 },
  });
  if (!response.ok) return null;

  const data = (await response.json()) as {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    episode_run_time?: number[];
    vote_average: number;
    genres: Array<{ name: string }>;
    external_ids?: { imdb_id?: string | null };
    created_by?: Array<{ name: string }>;
    credits?: { crew?: Array<{ name: string; job: string }> };
  };

  const runtime =
    data.episode_run_time?.find((m) => m > 0) ?? data.episode_run_time?.[0] ?? null;
  const year = data.first_air_date ? Number(data.first_air_date.slice(0, 4)) : undefined;

  return {
    tmdbId: data.id,
    mediaType: 'tv',
    title: data.name,
    year: Number.isFinite(year) ? year : undefined,
    overview: data.overview ?? '',
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    runtimeMins: runtime,
    genres: (data.genres ?? []).map((g) => g.name),
    directors: directorNamesFromCredits('tv', data.credits, data.created_by),
    voteAverage: data.vote_average,
    imdbId: data.external_ids?.imdb_id?.trim() || null,
  };
}

async function fetchMovieDetailWithCredits(tmdbId: number): Promise<MediaDetailPayload | null> {
  const url = new URL(`${TMDB_BASE}/movie/${tmdbId}`);
  url.searchParams.set('language', 'es-MX');
  url.searchParams.set('append_to_response', 'external_ids,credits');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/json',
    },
    next: { revalidate: 3600 },
  });
  if (!response.ok) return null;

  const data = (await response.json()) as {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    runtime: number | null;
    vote_average: number;
    genres: Array<{ name: string }>;
    external_ids?: { imdb_id?: string | null };
    credits?: { crew?: Array<{ name: string; job: string }> };
  };

  const year = data.release_date ? Number(data.release_date.slice(0, 4)) : undefined;

  return {
    tmdbId: data.id,
    mediaType: 'movie',
    title: data.title,
    year: Number.isFinite(year) ? year : undefined,
    overview: data.overview ?? '',
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    runtimeMins: data.runtime,
    genres: (data.genres ?? []).map((g) => g.name),
    directors: directorNamesFromCredits('movie', data.credits),
    voteAverage: data.vote_average,
    imdbId: data.external_ids?.imdb_id?.trim() || null,
  };
}

export async function fetchTmdbMediaDetail(
  mediaType: TmdbMediaType,
  tmdbId: number,
): Promise<MediaDetailPayload | null> {
  if (mediaType === 'movie') {
    return fetchMovieDetailWithCredits(tmdbId);
  }
  return fetchTvDetail(tmdbId);
}
