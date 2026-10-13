/** Clasificación IMDb CSV → película vs serie para stats y TMDB. */
export type TitleKind = 'movie' | 'series';

export function titleKindFromImdbType(titleType: string | null | undefined): TitleKind {
  if (!titleType?.trim()) return 'movie';
  const t = titleType.trim().toLowerCase();
  if (
    t.includes('serie') ||
    t.includes('series') ||
    t.includes('tv') ||
    t.includes('episod') ||
    t === 'miniserie'
  ) {
    return 'series';
  }
  return 'movie';
}

export function titleKindLabel(kind: TitleKind): string {
  return kind === 'series' ? 'Series' : 'Películas';
}
