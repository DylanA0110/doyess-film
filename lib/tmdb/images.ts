export function getTmdbPosterUrl(
  posterPath: string | null | undefined,
  size: 'w342' | 'w500' | 'w780' = 'w780',
) {
  if (!posterPath) {
    return '/doyess-logo.svg';
  }

  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}
