import type { UserVectorProfile } from '@/lib/recommendation/types';
import { titleGenreAffinity } from '@/lib/recommendation/build-user-profile';
import { computeAffinity } from '@/lib/recommendation/score-candidate';
import type { MediaCandidate } from '@/lib/recommendation/media-candidate';
import { GENRE_AXIS } from '@/lib/recommendation/genre-axis';

const IMDB_FROM_TMDB = new Map(
  GENRE_AXIS.map((g) => [g.tmdbId, g.label]),
);

export function tmdbGenreIdsToImdbLabels(genreIds: number[]): string[] {
  const out: string[] = [];
  for (const id of genreIds) {
    const label = IMDB_FROM_TMDB.get(id);
    if (label) out.push(label);
  }
  return out;
}

export function computeDisplayAffinity(
  profile: UserVectorProfile,
  candidate: MediaCandidate,
): number {
  const keywordAffinity = computeAffinity(profile, candidate);
  const hasKeywords = Object.keys(profile.keywordVector).length > 0;

  if (hasKeywords && keywordAffinity >= 0.08) {
    return keywordAffinity;
  }

  const genreLabels =
    candidate.genreLabels.length > 0
      ? candidate.genreLabels
      : tmdbGenreIdsToImdbLabels(candidate.tmdbGenreIds);

  if (genreLabels.length === 0) {
    return keywordAffinity;
  }

  const genreAffinity = titleGenreAffinity(profile, genreLabels);
  if (!hasKeywords) return genreAffinity;
  return Math.max(keywordAffinity, genreAffinity * 0.85 + keywordAffinity * 0.15);
}

export type ExploreMatchBadge =
  | { type: 'percent'; label: string; value: number }
  | { type: 'text'; label: string };

export function formatExploreMatchBadge(
  displayAffinity: number,
  finalScore: number,
  profile: UserVectorProfile,
): ExploreMatchBadge {
  const hasSignal =
    Object.keys(profile.keywordVector).length > 0 || profile.genreStats.length > 0;
  const strong =
    displayAffinity >= 0.22 ||
    finalScore >= 0.45 ||
    (displayAffinity >= 0.15 && finalScore >= 0.38);

  if (hasSignal && strong) {
    const pct = Math.min(99, Math.max(1, Math.round(displayAffinity * 100)));
    return { type: 'percent', label: `${pct}% contigo`, value: pct };
  }

  if (displayAffinity >= 0.35 || finalScore >= 0.5) {
    return { type: 'text', label: 'Muy en tu onda' };
  }
  if (displayAffinity >= 0.18 || finalScore >= 0.35) {
    return { type: 'text', label: 'Encaja contigo' };
  }
  if (displayAffinity >= 0.08) {
    return { type: 'text', label: 'Para descubrir' };
  }
  return { type: 'text', label: 'Nueva para vos' };
}

export function slugToDisplayLabel(slugOrName: string): string {
  const s = slugOrName.trim();
  if (!s) return '';
  if (s.includes(' ') && !s.includes('-')) return s;
  return s
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
