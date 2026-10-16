import type { TmdbMediaType } from '@/lib/tmdb/find-by-imdb';

export function syntheticImdbId(mediaType: TmdbMediaType, tmdbId: number): string {
  const prefix = mediaType === 'tv' ? 't' : 'm';
  return `doyess-tmdb-${prefix}-${tmdbId}`;
}

export function isSyntheticImdbId(imdbId: string | null | undefined): boolean {
  return Boolean(imdbId?.startsWith('doyess-tmdb-'));
}

/** Filas del CSV IMDb cuando coexisten con calificaciones hechas solo en la app (QA / pruebas). */
export function rowsForImportedDisplay<T extends { imdb_id?: string | null }>(
  rows: T[],
): T[] {
  const imported = rows.filter((r) => !isSyntheticImdbId(r.imdb_id));
  return imported.length > 0 ? imported : rows;
}

export function titleTypeForMedia(mediaType: TmdbMediaType): string {
  return mediaType === 'tv' ? 'tvSeries' : 'movie';
}
