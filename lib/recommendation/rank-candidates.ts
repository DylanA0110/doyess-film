import type { MediaCandidate } from '@/lib/recommendation/media-candidate';
import { scoreCandidate } from '@/lib/recommendation/score-candidate';
import type { ScoreResult, UserVectorProfile } from '@/lib/recommendation/types';

export type ScoredMediaCandidate = ScoreResult & { candidate: MediaCandidate };

export function rankCandidates(
  profile: UserVectorProfile,
  candidates: MediaCandidate[],
): ScoredMediaCandidate[] {
  const scored = candidates.map((candidate) => ({
    ...scoreCandidate(profile, candidate),
    candidate,
  }));
  scored.sort((a, b) => b.finalScore - a.finalScore);
  return scored;
}
