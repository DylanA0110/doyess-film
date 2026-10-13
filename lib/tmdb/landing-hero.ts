import {
  getTmdbBackdropUrl,
  getTmdbPosterUrl,
  getTmdbProfileUrl,
} from '@/lib/tmdb/images';

export type LandingSpotlightMovie = {
  title: string;
  year: string;
  genres: string;
  rating: number;
  posterUrl: string;
  backdropUrl: string;
};

export type LandingDirectorPreview = {
  name: string;
  count: number;
  photoUrl: string | null;
};

export type LandingHeroAssets = {
  spotlight: LandingSpotlightMovie;
  directors: LandingDirectorPreview[];
};

const GODFATHER_TMDB_ID = 238;

const ILLUSTRATIVE_DIRECTORS = [
  { id: 525, name: 'Nolan', count: 12 },
  { id: 1032, name: 'Scorsese', count: 9 },
  { id: 7467, name: 'Fincher', count: 7 },
  { id: 138, name: 'Tarantino', count: 6 },
] as const;

const FALLBACK: LandingHeroAssets = {
  spotlight: {
    title: 'El Padrino',
    year: '1972',
    genres: 'Drama • Crimen',
    rating: 9.2,
    posterUrl: '/ElPadrino.jpeg',
    backdropUrl: '/ElPadrino.jpeg',
  },
  directors: ILLUSTRATIVE_DIRECTORS.map((d) => ({
    name: d.name,
    count: d.count,
    photoUrl: null,
  })),
};

function getTmdbToken() {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) return null;
  return token;
}

async function tmdbFetch<T>(path: string): Promise<T | null> {
  const token = getTmdbToken();
  if (!token) return null;

  const response = await fetch(`https://api.themoviedb.org/3${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    next: { revalidate: 86_400 },
  });

  if (!response.ok) return null;
  return (await response.json()) as T;
}

export async function fetchLandingHeroAssets(): Promise<LandingHeroAssets> {
  try {
    const movie = await tmdbFetch<{
      title: string;
      release_date: string;
      vote_average: number;
      poster_path: string | null;
      backdrop_path: string | null;
      genres: Array<{ name: string }>;
      images?: { backdrops: Array<{ file_path: string }> };
    }>(`/movie/${GODFATHER_TMDB_ID}?language=es-ES&append_to_response=images`);

    const directorResults = await Promise.all(
      ILLUSTRATIVE_DIRECTORS.map(async (item) => {
        const person = await tmdbFetch<{ name: string; profile_path: string | null }>(
          `/person/${item.id}?language=es-ES`,
        );
        return {
          name: item.name,
          count: item.count,
          photoUrl: getTmdbProfileUrl(person?.profile_path ?? null),
        };
      }),
    );

    if (!movie) {
      return FALLBACK;
    }

    const year = movie.release_date?.slice(0, 4) ?? '1972';
    const genreLabel =
      movie.genres?.slice(0, 2).map((g) => g.name).join(' • ') || 'Drama • Crimen';
    const backdropPath =
      movie.backdrop_path ??
      movie.images?.backdrops?.find((b) => b.file_path)?.file_path ??
      null;

    return {
      spotlight: {
        title: movie.title,
        year,
        genres: genreLabel,
        rating: 9.2,
        posterUrl: getTmdbPosterUrl(movie.poster_path, 'w500'),
        backdropUrl: getTmdbBackdropUrl(backdropPath, 'w1280'),
      },
      directors: directorResults,
    };
  } catch {
    return FALLBACK;
  }
}
