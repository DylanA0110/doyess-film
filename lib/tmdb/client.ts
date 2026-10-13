export type TmdbSearchMovie = {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  media_type?: string;
};

type TmdbSearchResponse = {
  page: number;
  results: TmdbSearchMovie[];
  total_pages: number;
  total_results: number;
};

const tmdbBaseUrl = 'https://api.themoviedb.org/3';

function getTmdbToken() {
  const token = process.env.TMDB_API_TOKEN;

  if (!token) {
    throw new Error('TMDB_API_TOKEN is not configured');
  }

  return token;
}

export async function searchTmdbMovies(query: string, year?: number) {
  const url = new URL(`${tmdbBaseUrl}/search/movie`);
  url.searchParams.set('query', query);

  if (year) {
    url.searchParams.set('year', String(year));
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getTmdbToken()}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`TMDB search failed with status ${response.status}`);
  }

  const data = (await response.json()) as TmdbSearchResponse;
  return data.results;
}

export async function getTmdbMovieDetails(movieId: number) {
  const response = await fetch(`${tmdbBaseUrl}/movie/${movieId}`, {
    headers: {
      Authorization: `Bearer ${getTmdbToken()}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`TMDB movie lookup failed with status ${response.status}`);
  }

  return (await response.json()) as {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    runtime: number | null;
    genres: Array<{ id: number; name: string }>;
    imdb_id: string | null;
    vote_average: number;
    vote_count: number;
  };
}
