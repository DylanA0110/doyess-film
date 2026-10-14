/** Clasificación IMDb CSV → película, serie (show) o capítulo. */
export type TitleKind = 'movie' | 'series' | 'episode';

export function isTvEpisodeTitleType(titleType: string | null | undefined): boolean {
  if (!titleType?.trim()) return false;
  const t = titleType.trim().toLowerCase();
  return t.includes('episode') || t.includes('episodio') || t === 'tv episode';
}

export function titleKindFromImdbType(titleType: string | null | undefined): TitleKind {
  if (!titleType?.trim()) return 'movie';
  const t = titleType.trim().toLowerCase();
  if (isTvEpisodeTitleType(titleType)) return 'episode';
  if (
    t.includes('serie') ||
    t.includes('series') ||
    t.includes('tv') ||
    t === 'miniserie'
  ) {
    return 'series';
  }
  return 'movie';
}

export function titleKindLabel(kind: TitleKind): string {
  if (kind === 'series') return 'Series';
  if (kind === 'episode') return 'Capítulos';
  return 'Películas';
}

/** Filas que alimentan KPIs de cine (largometrajes); excluye series y capítulos. */
export function rowsForMovieKpis<T extends { title_type?: string | null }>(rows: T[]): T[] {
  return rows.filter((r) => titleKindFromImdbType(r.title_type) === 'movie');
}
