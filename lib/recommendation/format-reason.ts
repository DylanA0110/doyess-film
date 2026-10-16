import type { CandidateScoreBreakdown, UserVectorProfile } from '@/lib/recommendation/types';

export function formatAffinityPercent(cosineAffinity: number): number {
  return Math.round(Math.min(1, Math.max(0, cosineAffinity)) * 100);
}

export function formatRecommendationReason(
  breakdown: CandidateScoreBreakdown,
  profile: UserVectorProfile,
): string {
  const pct = formatAffinityPercent(breakdown.cosineAffinity);
  const parts: string[] = [];

  if (pct >= 40) parts.push('Muy en tu onda');
  else if (pct >= 20) parts.push('Encaja con lo que sueles elegir');
  else parts.push(`En la línea de tu gusto por ${profile.dominantByBayes.toLowerCase()}`);

  if (breakdown.alignedGenreLabels.length > 0) {
    const genres = breakdown.alignedGenreLabels.slice(0, 2).join(' y ');
    parts.push(`Géneros que te van: ${genres.toLowerCase()}`);
  }

  if (breakdown.directorInTop5) {
    parts.push('De un director que ya te gusta');
  }

  parts.push(`Entre ${profile.yearMin} y ${profile.yearMax}`);
  parts.push('Aún no está en tu historial');

  return parts.join(' · ');
}
