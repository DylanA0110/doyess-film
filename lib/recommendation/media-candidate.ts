import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';

export type MediaType = TmdbMediaType;
export type MediaRef = `m_${number}` | `t_${number}`;

export type MediaCandidate = {
  mediaType: MediaType;
  tmdbId: number;
  mediaRef: MediaRef;
  displayTitle: string;
  releaseYear: number | null;
  overview: string;
  posterPath: string | null;
  voteAverage: number;
  voteAverageAdjusted: number;
  voteCount: number;
  keywords: string[];
  director: string | null;
  imdbId: string | null;
  tmdbGenreIds: number[];
  genreLabels: string[];
};

export function mediaRef(mediaType: MediaType, tmdbId: number): MediaRef {
  return mediaType === 'tv' ? `t_${tmdbId}` : `m_${tmdbId}`;
}

function releaseYearFromDate(date: string | undefined): number | null {
  if (!date) return null;
  const y = Number.parseInt(date.slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
}

function adjustedVoteAverage(voteAverage: number, mediaType: MediaType): number {
  const adj = mediaType === 'tv' ? voteAverage - 0.5 : voteAverage;
  return Math.max(0, adj);
}

export type TmdbMovieListShape = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
};

export type TmdbTvListShape = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
};

export function fromTmdbMovieListItem(
  item: TmdbMovieListShape,
  extras?: {
    keywords?: string[];
    director?: string | null;
    imdbId?: string | null;
    genreLabels?: string[];
  },
): MediaCandidate {
  const mediaType: MediaType = 'movie';
  const genreIds = item.genre_ids ?? [];
  return {
    mediaType,
    tmdbId: item.id,
    mediaRef: mediaRef(mediaType, item.id),
    displayTitle: item.title,
    releaseYear: releaseYearFromDate(item.release_date),
    overview: item.overview ?? '',
    posterPath: item.poster_path,
    voteAverage: item.vote_average,
    voteAverageAdjusted: adjustedVoteAverage(item.vote_average, mediaType),
    voteCount: item.vote_count,
    keywords: extras?.keywords ?? [],
    director: extras?.director ?? null,
    imdbId: extras?.imdbId ?? null,
    tmdbGenreIds: genreIds,
    genreLabels: extras?.genreLabels ?? [],
  };
}

export function fromTmdbTvListItem(
  item: TmdbTvListShape,
  extras?: {
    keywords?: string[];
    director?: string | null;
    imdbId?: string | null;
    genreLabels?: string[];
  },
): MediaCandidate {
  const mediaType: MediaType = 'tv';
  const genreIds = item.genre_ids ?? [];
  return {
    mediaType,
    tmdbId: item.id,
    mediaRef: mediaRef(mediaType, item.id),
    displayTitle: item.name,
    releaseYear: releaseYearFromDate(item.first_air_date),
    overview: item.overview ?? '',
    posterPath: item.poster_path,
    voteAverage: item.vote_average,
    voteAverageAdjusted: adjustedVoteAverage(item.vote_average, mediaType),
    voteCount: item.vote_count,
    keywords: extras?.keywords ?? [],
    director: extras?.director ?? null,
    imdbId: extras?.imdbId ?? null,
    tmdbGenreIds: genreIds,
    genreLabels: extras?.genreLabels ?? [],
  };
}
