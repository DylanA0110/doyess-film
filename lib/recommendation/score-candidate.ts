import {
  labelForTmdbGenreId,
  tmdbGenreIdToAxisIndex,
  vectorFromTmdbGenreIds,
} from '@/lib/recommendation/genre-axis';
import { cosineSimilarity } from '@/lib/recommendation/math';
import type {
  CandidateMovie,
  CandidateScoreBreakdown,
  UserVectorProfile,
} from '@/lib/recommendation/types';

const TOP_DIRECTOR_NAMES = (profile: UserVectorProfile) =>
  new Set(profile.topDirectors.map((d) => d.name.toLowerCase()));

export function scoreCandidate(
  profile: UserVectorProfile,
  candidate: CandidateMovie,
): CandidateScoreBreakdown {
  const M = vectorFromTmdbGenreIds(candidate.genreIds);
  const cosineAffinity = cosineSimilarity(profile.genreVector, M);

  const qualityBonus =
    Math.log10(Math.max(candidate.voteCount, 1)) * (candidate.voteAverage / 100);

  const directorName = candidate.director?.trim().toLowerCase() ?? '';
  const directorInTop5 =
    directorName.length > 0 && TOP_DIRECTOR_NAMES(profile).has(directorName);
  const directorBonus = directorInTop5 ? 0.05 : 0;

  const finalScore = cosineAffinity + qualityBonus + directorBonus;

  const alignedGenreLabels: string[] = [];
  for (const id of candidate.genreIds) {
    const idx = tmdbGenreIdToAxisIndex(id);
    if (idx != null && profile.genreVector[idx] > 0) {
      alignedGenreLabels.push(labelForTmdbGenreId(id));
    }
  }

  return {
    cosineAffinity,
    qualityBonus,
    directorBonus,
    finalScore,
    alignedGenreLabels,
    directorInTop5,
  };
}
