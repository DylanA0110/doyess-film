import { volumeVsAffinityLine } from '@/lib/recommendation/format-user-copy';
import {
  GUILTY_PLEASURE_MEAN_Z,
  GUILTY_PLEASURE_MIN_COUNT,
  type CinephileInsight,
  type UserVectorProfile,
} from '@/lib/recommendation/types';

export function buildCinephileInsights(profile: UserVectorProfile): CinephileInsight[] {
  const insights: CinephileInsight[] = [];

  if (
    profile.dominantByBayes !== profile.dominantByFrequency &&
    profile.dominantByBayes !== '—'
  ) {
    insights.push({
      kind: 'trueFavoriteGenre',
      headline: `Tu género estrella: ${profile.dominantByBayes}`,
      detail: volumeVsAffinityLine(profile.dominantByFrequency, profile.dominantByBayes),
      evidence: '',
    });
  }

  const topDir = profile.topDirectors[0];
  if (topDir && topDir.count >= 2) {
    insights.push({
      kind: 'reliableDirector',
      headline: `${topDir.name} encaja contigo`,
      detail: `En ${topDir.count} películas que calificaste, tus notas hacia su trabajo suelen ser de las más altas de tu historial.`,
      evidence: `Media ${topDir.avgRating.toFixed(1)}/10 en esos títulos`,
    });
  }

  const guilty = profile.genreStats.find(
    (g) => g.count >= GUILTY_PLEASURE_MIN_COUNT && g.meanZ <= GUILTY_PLEASURE_MEAN_Z,
  );
  if (guilty) {
    insights.push({
      kind: 'guiltyPleasure',
      headline: `Mucho ${guilty.name}, notas bajas`,
      detail: `Calificas ${guilty.name} por debajo de tu media habitual aunque lo ves a menudo.`,
      evidence: `${guilty.count} títulos en tu historial`,
    });
  }

  return insights;
}
