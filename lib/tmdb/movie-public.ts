import { tmdbGenreIdFromImdbLabel } from '@/lib/tmdb/imdb-genre-to-tmdb';

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

export type TmdbMovieListItem = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
};

export type TmdbMovieDetail = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  genres: Array<{ id: number; name: string }>;
  imdb_id: string | null;
};

export async function fetchMovieRecommendations(
  tmdbId: number,
  page = 1,
): Promise<TmdbMovieListItem[]> {
  const url = new URL(`${TMDB_BASE}/movie/${tmdbId}/recommendations`);
  url.searchParams.set('language', 'es-MX');
  url.searchParams.set('page', String(page));

  const response = await fetch(url, { headers: authHeaders(), next: { revalidate: 3600 } });
  if (!response.ok) return [];
  const data = (await response.json()) as { results?: TmdbMovieListItem[] };
  return (data.results ?? []).filter((m) => m.poster_path && m.overview?.trim());
}

export async function discoverMoviesForTaste(
  genreName: string,
  yearMin: number,
  yearMax: number,
  minVote: number,
  page: number,
): Promise<TmdbMovieListItem[]> {
  const genreId = tmdbGenreIdFromImdbLabel(genreName) ?? 18;
  const url = new URL(`${TMDB_BASE}/discover/movie`);
  url.searchParams.set('language', 'es-MX');
  url.searchParams.set('with_genres', String(genreId));
  url.searchParams.set('primary_release_date.gte', `${yearMin}-01-01`);
  url.searchParams.set('primary_release_date.lte', `${yearMax}-12-31`);
  url.searchParams.set('sort_by', 'popularity.desc');
  url.searchParams.set('vote_count.gte', '400');
  url.searchParams.set('vote_average.gte', String(minVote));
  url.searchParams.set('include_adult', 'false');
  url.searchParams.set('page', String(page));

  const response = await fetch(url, { headers: authHeaders(), next: { revalidate: 3600 } });
  if (!response.ok) return [];
  const data = (await response.json()) as { results?: TmdbMovieListItem[] };
  return (data.results ?? []).filter((m) => m.poster_path && m.overview?.trim());
}

export async function fetchMovieDetail(tmdbId: number): Promise<TmdbMovieDetail | null> {
  const url = new URL(`${TMDB_BASE}/movie/${tmdbId}`);
  url.searchParams.set('language', 'es-MX');
  url.searchParams.set('append_to_response', 'external_ids');

  const response = await fetch(url.toString(), {
    headers: authHeaders(),
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
    vote_count: number;
    genres: Array<{ id: number; name: string }>;
    external_ids?: { imdb_id?: string | null };
  };

  return {
    id: data.id,
    title: data.title,
    overview: data.overview,
    poster_path: data.poster_path,
    backdrop_path: data.backdrop_path,
    release_date: data.release_date,
    runtime: data.runtime,
    vote_average: data.vote_average,
    vote_count: data.vote_count,
    genres: data.genres ?? [],
    imdb_id: data.external_ids?.imdb_id?.trim() || null,
  };
}

export async function fetchMovieImdbId(tmdbId: number): Promise<string | null> {
  const response = await fetch(`${TMDB_BASE}/movie/${tmdbId}/external_ids`, {
    headers: authHeaders(),
    next: { revalidate: 86400 },
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { imdb_id: string | null };
  return data.imdb_id?.trim() || null;
}
