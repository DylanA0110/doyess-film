import type { CandidateScoreBreakdown, UserVectorProfile } from '@/lib/recommendation/types';

export function formatAffinityPercent(cosineAffinity: number): number {
  return Math.round(Math.min(1, Math.max(0, cosineAffinity)) * 100);
}

export function formatRecommendationReason(
  breakdown: CandidateScoreBreakdown,
  profile: UserVectorProfile,
): string {
  const pct = formatAffinityPercent(breakdown.cosineAffinity);
  const parts: string[] = [`~${pct}% afinidad con tu perfil`];

  if (breakdown.alignedGenreLabels.length > 0) {
    const genres = breakdown.alignedGenreLabels.slice(0, 2).join(' + ');
    parts.push(genres);
  }

  if (breakdown.directorInTop5) {
    parts.push('director en tu Top 5');
  }

  parts.push(`época ${profile.yearMin}–${profile.yearMax}`);
  parts.push('fuera de tu historial IMDb');

  return parts.join(' · ');
}
