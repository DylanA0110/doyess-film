import type { UserVectorProfile } from '@/lib/recommendation/types';
import type { MediaCandidate } from '@/lib/recommendation/media-candidate';

/** Texto para UI — sin jerga estadística (μ, σ, Bayes, Z). */

type CandidateReasonInput = {
  profile: UserVectorProfile;
  candidate: MediaCandidate;
  affinity: number;
  alignedKeywords: string[];
  directorMatch: boolean;
  hiddenGem: boolean;
};

function affinityLeadLine(affinity: number, hasKeywordProfile: boolean): string | null {
  if (!hasKeywordProfile) return null;
  if (affinity >= 0.42) return 'Muy en tu onda';
  if (affinity >= 0.22) return 'Encaja bastante con lo que sueles elegir';
  if (affinity >= 0.1) return 'Comparte algo de lo que te gusta ver';
  return null;
}

function genreLeadLine(profile: UserVectorProfile): string {
  const genre = profile.dominantByBayes;
  if (genre && genre !== '—') {
    const second = profile.topGenreNames.find((g) => g !== genre && g !== '—');
    if (second) {
      return `En la línea de tu gusto por ${genre.toLowerCase()} y ${second.toLowerCase()}`;
    }
    return `En la línea de tu gusto por ${genre.toLowerCase()}`;
  }
  return 'Elegida para ampliar lo que ya disfrutas';
}

/** Motivo corto para pick del día, carriles y listas (sin % ni “keywords”). */
export function formatCandidateMatchReason(input: CandidateReasonInput): string {
  const hasKeywordProfile = Object.keys(input.profile.keywordVector).length > 0;
  const parts: string[] = [];

  const lead =
    affinityLeadLine(input.affinity, hasKeywordProfile) ??
    genreLeadLine(input.profile);
  parts.push(lead);

  if (input.alignedKeywords.length > 0) {
    const themes = input.alignedKeywords.slice(0, 2).join(' y ');
    parts.push(`Porque sueles ir a historias de ${themes.toLowerCase()}`);
  }

  if (input.directorMatch && input.candidate.director) {
    parts.push(`De ${input.candidate.director}, un nombre que ya puntúas alto`);
  } else if (input.directorMatch) {
    parts.push('De un director que ya te gusta');
  }

  if (input.hiddenGem) {
    parts.push('Poca gente la ha visto; puede sorprenderte');
  }

  return parts.slice(0, 3).join(' · ');
}

export function consistencyLabel(stdDev: number): string {
  if (stdDev < 0.6) return 'Tus notas son muy parecidas entre sí.';
  if (stdDev >= 1.5) return 'A veces amas un título y otras lo pasas por alto.';
  return 'Tus notas suelen moverse un poco arriba o abajo de tu media.';
}

export function genreAffinityExplanation(
  genreName: string,
  percent: number,
  titleCount: number,
  highlight: string,
): string {
  if (titleCount === 0) {
    return `Aún no hay ${genreName} en este grupo de tu historial.`;
  }
  return `Cerca del ${percent}% de lo que más ves en este grupo (${titleCount} títulos). Destacan: ${highlight}.`;
}

export function volumeVsAffinityLine(volumeGenre: string, affinityGenre: string): string {
  if (volumeGenre === affinityGenre || volumeGenre === '—') {
    return `Lo que más ves y lo que mejor puntúas coinciden en ${affinityGenre}.`;
  }
  return `Ves mucho ${volumeGenre}, pero tus mejores notas se concentran en ${affinityGenre}.`;
}
