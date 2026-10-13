'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedMovies } from '@/lib/tmdb/featured-movies';

export function useFeaturedMovies() {
  return useQuery({
    queryKey: ['tmdb', 'featured-movies'],
    queryFn: fetchFeaturedMovies,
    staleTime: 1000 * 60 * 30,
  });
}
