import {
  cosineSimilaritySparse,
  normalizeVoteQuality,
} from '@/lib/recommendation/math';
import {
  l2NormalizeSparse,
  slugifyKeyword,
} from '@/lib/recommendation/keyword-idf';
import {
  HIDDEN_GEM_AFFINITY_MIN,
  HIDDEN_GEM_MULTIPLIER,
  HIDDEN_GEM_VOTE_MAX,
  SCORE_WEIGHT_AFFINITY,
  SCORE_WEIGHT_DIRECTOR,
  SCORE_WEIGHT_QUALITY,
  type ScoreResult,
  type UserVectorProfile,
} from '@/lib/recommendation/types';
import type { MediaCandidate } from '@/lib/recommendation/media-candidate';
import { formatCandidateMatchReason } from '@/lib/recommendation/format-user-copy';

function keywordsToVector(keywords: string[]): Record<string, number> {
  const raw: Record<string, number> = {};
  for (const kw of keywords) {
    const slug = slugifyKeyword(kw);
    if (!slug) continue;
    raw[slug] = (raw[slug] ?? 0) + 1;
  }
  return l2NormalizeSparse(raw);
}

function alignedKeywordLabels(
  profile: UserVectorProfile,
  candidateKeywords: string[],
): string[] {
  const out: string[] = [];
  for (const kw of candidateKeywords) {
    const slug = slugifyKeyword(kw);
    if (slug && (profile.keywordVector[slug] ?? 0) > 0) {
      out.push(kw);
    }
  }
  return out;
}

function getDirectorBonusNorm(profile: UserVectorProfile, candidate: MediaCandidate): number {
  const directorName = candidate.director?.trim().toLowerCase() ?? '';
  if (!directorName) return 0;
  const top = new Set(profile.topDirectors.map((d) => d.name.toLowerCase()));
  return top.has(directorName) ? 1 : 0;
}

export function computeAffinity(
  profile: UserVectorProfile,
  candidate: MediaCandidate,
): number {
  const candidateVec = keywordsToVector(candidate.keywords);
  if (Object.keys(profile.keywordVector).length === 0) return 0;
  return cosineSimilaritySparse(profile.keywordVector, candidateVec);
}

export function scoreCandidatePartial(
  profile: UserVectorProfile,
  candidate: MediaCandidate,
): number {
  const qualityNorm = normalizeVoteQuality(
    candidate.voteAverageAdjusted,
    candidate.voteCount,
  );
  const directorBonusNorm = getDirectorBonusNorm(profile, candidate);
  const partialWeight = SCORE_WEIGHT_QUALITY + SCORE_WEIGHT_DIRECTOR;
  if (partialWeight === 0) return 0;
  return (
    (qualityNorm * SCORE_WEIGHT_QUALITY + directorBonusNorm * SCORE_WEIGHT_DIRECTOR) /
    partialWeight
  );
}

export function scoreCandidate(
  profile: UserVectorProfile,
  candidate: MediaCandidate,
): ScoreResult {
  const affinity = computeAffinity(profile, candidate);
  const qualityNorm = normalizeVoteQuality(
    candidate.voteAverageAdjusted,
    candidate.voteCount,
  );
  const directorBonusNorm = getDirectorBonusNorm(profile, candidate);

  const base =
    affinity * SCORE_WEIGHT_AFFINITY +
    qualityNorm * SCORE_WEIGHT_QUALITY +
    directorBonusNorm * SCORE_WEIGHT_DIRECTOR;

  const hiddenGemMultiplier =
    candidate.voteCount < HIDDEN_GEM_VOTE_MAX && affinity > HIDDEN_GEM_AFFINITY_MIN
      ? HIDDEN_GEM_MULTIPLIER
      : 1;

  const finalScore = Math.min(base * hiddenGemMultiplier, 1);

  const alignedKeywords = alignedKeywordLabels(profile, candidate.keywords);
  const reason = formatCandidateMatchReason({
    profile,
    candidate,
    affinity,
    alignedKeywords,
    directorMatch: directorBonusNorm > 0,
    hiddenGem: hiddenGemMultiplier > 1,
  });

  return {
    finalScore,
    reason,
    breakdown: {
      affinity,
      qualityNorm,
      directorBonusNorm,
      hiddenGemMultiplier,
      alignedKeywords,
    },
  };
}
