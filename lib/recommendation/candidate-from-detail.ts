import type { MediaDetailPayload } from '@/lib/tmdb/media-detail';
import { mediaRef, type MediaCandidate } from '@/lib/recommendation/media-candidate';

export function mediaCandidateFromDetail(
  detail: MediaDetailPayload,
  extras?: { keywords?: string[]; director?: string | null; imdbId?: string | null },
): MediaCandidate {
  const mediaType = detail.mediaType;
  const voteAverage = detail.voteAverage;
  const voteAverageAdjusted =
    mediaType === 'tv' ? Math.max(0, voteAverage - 0.5) : voteAverage;

  return {
    mediaType,
    tmdbId: detail.tmdbId,
    mediaRef: mediaRef(mediaType, detail.tmdbId),
    displayTitle: detail.title,
    releaseYear: detail.year ?? null,
    overview: detail.overview,
    posterPath: detail.posterPath,
    voteAverage,
    voteAverageAdjusted,
    voteCount: 0,
    keywords: extras?.keywords ?? [],
    director: extras?.director ?? null,
    imdbId: extras?.imdbId ?? detail.imdbId,
    tmdbGenreIds: [],
    genreLabels: detail.genres ?? [],
  };
}
