type PosterSize = 'w342' | 'w500' | 'w780';
type BackdropSize = 'w780' | 'w1280' | 'original';
type ProfileSize = 'w185' | 'h632';

export function getTmdbPosterUrl(
  posterPath: string | null | undefined,
  size: PosterSize = 'w780',
) {
  if (!posterPath) {
    return '/doyess-logo.svg';
  }

  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

export function getTmdbBackdropUrl(
  backdropPath: string | null | undefined,
  size: BackdropSize = 'w1280',
) {
  if (!backdropPath) {
    return '/ElPadrino.jpeg';
  }

  return `https://image.tmdb.org/t/p/${size}${backdropPath}`;
}

export function getTmdbProfileUrl(
  profilePath: string | null | undefined,
  size: ProfileSize = 'w185',
) {
  if (!profilePath) {
    return null;
  }

  return `https://image.tmdb.org/t/p/${size}${profilePath}`;
}
