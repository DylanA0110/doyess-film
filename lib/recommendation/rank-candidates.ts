import { scoreCandidate } from '@/lib/recommendation/score-candidate';
import type {
  CandidateMovie,
  ScoredCandidate,
  UserVectorProfile,
} from '@/lib/recommendation/types';

export function rankCandidates(
  profile: UserVectorProfile,
  candidates: CandidateMovie[],
): ScoredCandidate[] {
  const scored = candidates.map((candidate) => ({
    candidate,
    breakdown: scoreCandidate(profile, candidate),
  }));
  scored.sort((a, b) => b.breakdown.finalScore - a.breakdown.finalScore);
  return scored;
}
