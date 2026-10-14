export type EnrichmentStatus = 'pending' | 'ok' | 'not_found' | 'skipped';

export function isTerminalEnrichmentStatus(status: string | null | undefined): boolean {
  return status === 'ok' || status === 'not_found' || status === 'skipped';
}

/** Tipos IMDb que no merecen llamada TMDB (clasificaciones sueltas, etc.). */
export function shouldSkipTmdbWithoutAttempt(titleType: string | null | undefined): boolean {
  if (!titleType?.trim()) return false;
  const t = titleType.trim().toLowerCase();
  return (
    t.includes('video game') ||
    t.includes('video') ||
    t === 'short' ||
    t.includes('cortometraje') ||
    t.includes('podcast')
  );
}

export { isTvEpisodeTitleType } from '@/lib/imdb/title-kind';
