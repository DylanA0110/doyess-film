import type { TmdbSearchMovie } from './client';
import { searchTmdbMovies } from './client';

export type FeaturedMovieCard = {
  label: string;
  query: string;
  year?: number;
  accent: string;
  movie: TmdbSearchMovie | null;
};

export const featuredQueries = [
  {
    label: 'Infiltrados',
    query: 'The Departed',
    year: 2006,
    accent: 'Afinidad 94%',
  },
  {
    label: 'Origen',
    query: 'Inception',
    year: 2010,
    accent: 'Sueño / Suspense',
  },
  {
    label: 'Dune: Parte dos',
    query: 'Dune Part Two',
    year: 2024,
    accent: 'Ciencia ficción',
  },
  {
    label: 'El caballero oscuro',
    query: 'The Dark Knight',
    year: 2008,
    accent: 'Drama criminal',
  },
  {
    label: 'Oppenheimer',
    query: 'Oppenheimer',
    year: 2023,
    accent: 'Biografía épica',
  },
  {
    label: 'Spider-Verse',
    query: 'Spider-Man Across the Spider-Verse',
    year: 2023,
    accent: 'Animación',
  },
] as const;

export async function fetchFeaturedMovies(): Promise<FeaturedMovieCard[]> {
  return Promise.all(
    featuredQueries.map(async (item) => {
      const matches = await searchTmdbMovies(item.query, item.year);

      return {
        label: item.label,
        query: item.query,
        year: item.year,
        accent: item.accent,
        movie: matches[0] ?? null,
      };
    }),
  );
}
