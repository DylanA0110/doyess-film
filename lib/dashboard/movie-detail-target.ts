import type { MovieDetailTarget } from '@/components/dashboard/movie-detail-dialog';
import type { DashboardMovie } from '@/components/dashboard/types';
import type { ExploreCardItem } from '@/lib/recommendation/lanes/build-explore-lanes';

export function exploreCardToDetailTarget(item: ExploreCardItem): MovieDetailTarget {
  return {
    tmdbId: item.tmdbId,
    mediaType: item.mediaType,
    title: item.title,
    year: item.year,
    posterUrl: item.posterUrl,
    userRating: item.userRating ?? undefined,
  };
}

export function dashboardMovieToDetailTarget(movie: DashboardMovie): MovieDetailTarget | null {
  if (!movie.tmdbId) return null;
  const mediaType =
    movie.tmdbMediaType ?? (movie.titleKind === 'series' ? 'tv' : 'movie');
  return {
    tmdbId: movie.tmdbId,
    mediaType,
    title: movie.title,
    year: movie.year,
    userRating: movie.userRating,
    posterUrl: movie.posterUrl,
  };
}
