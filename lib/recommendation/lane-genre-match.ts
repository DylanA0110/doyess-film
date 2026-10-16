import type { MediaCandidate } from '@/lib/recommendation/media-candidate';
import { tmdbGenreIdsToImdbLabels } from '@/lib/recommendation/format-explore-match';
import { tmdbDiscoverGenreIds } from '@/lib/tmdb/imdb-genre-to-tmdb';

/** El candidato debe incluir al menos un género TMDB del carril (evita romance en “Suspense”). */
export function candidateMatchesLaneGenre(
  imdbGenreLabel: string,
  candidate: MediaCandidate,
): boolean {
  const requiredIds = tmdbDiscoverGenreIds(imdbGenreLabel);
  if (requiredIds.length === 0) return true;

  const candidateIds =
    candidate.tmdbGenreIds.length > 0
      ? candidate.tmdbGenreIds
      : [];

  if (candidateIds.length > 0) {
    return requiredIds.some((id) => candidateIds.includes(id));
  }

  const labels = (
    candidate.genreLabels.length > 0
      ? candidate.genreLabels
      : tmdbGenreIdsToImdbLabels(candidate.tmdbGenreIds)
  ).map((l) => l.trim().toLowerCase());

  const requiredLabels = requiredIds
    .flatMap((id) => {
      const fromAxis = tmdbGenreIdsToImdbLabels([id]);
      return fromAxis;
    })
    .map((l) => l.toLowerCase());

  return labels.some((l) => requiredLabels.includes(l));
}
