/** Texto para UI — sin jerga estadística (μ, σ, Bayes, Z). */

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
  return `Representa ~${percent}% de tu afinidad en este grupo (${titleCount} títulos). Destacan: ${highlight}.`;
}

export function volumeVsAffinityLine(volumeGenre: string, affinityGenre: string): string {
  if (volumeGenre === affinityGenre || volumeGenre === '—') {
    return `Lo que más ves y lo que mejor puntúas coinciden en ${affinityGenre}.`;
  }
  return `Ves mucho ${volumeGenre}, pero tus mejores notas se concentran en ${affinityGenre}.`;
}
