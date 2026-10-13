import { getTmdbPosterUrl } from '@/lib/tmdb/images';

export const NEUTRAL_POSTER = '/doyess-logo.svg';

export function resolvePosterUrl(posterPath: string | null | undefined): string {
  if (!posterPath) return NEUTRAL_POSTER;
  return getTmdbPosterUrl(posterPath, 'w342');
}
