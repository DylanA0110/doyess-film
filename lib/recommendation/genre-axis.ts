import { tmdbGenreIdFromImdbLabel } from '@/lib/tmdb/imdb-genre-to-tmdb';

/** Eje fijo TMDB (ids únicos, orden estable por id) */
export const GENRE_AXIS: Array<{ tmdbId: number; label: string }> = [
  { tmdbId: 28, label: 'Action' },
  { tmdbId: 12, label: 'Adventure' },
  { tmdbId: 16, label: 'Animation' },
  { tmdbId: 35, label: 'Comedy' },
  { tmdbId: 80, label: 'Crime' },
  { tmdbId: 99, label: 'Documentary' },
  { tmdbId: 18, label: 'Drama' },
  { tmdbId: 10751, label: 'Family' },
  { tmdbId: 14, label: 'Fantasy' },
  { tmdbId: 36, label: 'History' },
  { tmdbId: 27, label: 'Horror' },
  { tmdbId: 10402, label: 'Music' },
  { tmdbId: 9648, label: 'Mystery' },
  { tmdbId: 10749, label: 'Romance' },
  { tmdbId: 878, label: 'Sci-Fi' },
  { tmdbId: 53, label: 'Thriller' },
  { tmdbId: 10752, label: 'War' },
  { tmdbId: 37, label: 'Western' },
];

const TMDB_ID_TO_INDEX = new Map(GENRE_AXIS.map((g, i) => [g.tmdbId, i]));

const IMDB_LABEL_TO_INDEX = new Map<string, number>();
for (const entry of GENRE_AXIS) {
  IMDB_LABEL_TO_INDEX.set(entry.label.toLowerCase(), TMDB_ID_TO_INDEX.get(entry.tmdbId)!);
}
IMDB_LABEL_TO_INDEX.set('science fiction', TMDB_ID_TO_INDEX.get(878)!);
IMDB_LABEL_TO_INDEX.set('sci-fi', TMDB_ID_TO_INDEX.get(878)!);
IMDB_LABEL_TO_INDEX.set('musical', TMDB_ID_TO_INDEX.get(10402)!);
IMDB_LABEL_TO_INDEX.set('suspense', TMDB_ID_TO_INDEX.get(53)!);
IMDB_LABEL_TO_INDEX.set('misterio', TMDB_ID_TO_INDEX.get(9648)!);
IMDB_LABEL_TO_INDEX.set('crimen', TMDB_ID_TO_INDEX.get(80)!);
IMDB_LABEL_TO_INDEX.set('ciencia ficción', TMDB_ID_TO_INDEX.get(878)!);
IMDB_LABEL_TO_INDEX.set('terror', TMDB_ID_TO_INDEX.get(27)!);
IMDB_LABEL_TO_INDEX.set('animación', TMDB_ID_TO_INDEX.get(16)!);
IMDB_LABEL_TO_INDEX.set('fantasía', TMDB_ID_TO_INDEX.get(14)!);
IMDB_LABEL_TO_INDEX.set('comedia', TMDB_ID_TO_INDEX.get(35)!);
IMDB_LABEL_TO_INDEX.set('acción', TMDB_ID_TO_INDEX.get(28)!);

export function tmdbGenreIdToAxisIndex(tmdbId: number): number | null {
  const idx = TMDB_ID_TO_INDEX.get(tmdbId);
  return idx === undefined ? null : idx;
}

export function imdbGenreToAxisIndex(imdbLabel: string): number | null {
  const direct = tmdbGenreIdFromImdbLabel(imdbLabel);
  if (direct != null) return tmdbGenreIdToAxisIndex(direct);
  const lower = imdbLabel.trim().toLowerCase();
  const idx = IMDB_LABEL_TO_INDEX.get(lower);
  return idx === undefined ? null : idx;
}

export function labelForTmdbGenreId(tmdbId: number): string {
  return GENRE_AXIS.find((g) => g.tmdbId === tmdbId)?.label ?? 'Género';
}

/** Multi-hot binario L2-normalizado para candidatos TMDB */
export function vectorFromTmdbGenreIds(genreIds: number[]): number[] {
  const raw = new Array<number>(GENRE_AXIS.length).fill(0);
  for (const id of genreIds) {
    const idx = tmdbGenreIdToAxisIndex(id);
    if (idx != null) raw[idx] = 1;
  }
  return l2NormalizeLocal(raw);
}

function l2NormalizeLocal(vector: number[]): number[] {
  let norm = 0;
  for (const x of vector) norm += x * x;
  norm = Math.sqrt(norm);
  if (norm === 0) return vector;
  return vector.map((x) => x / norm);
}

export function axisIndexToLabel(index: number): string {
  return GENRE_AXIS[index]?.label ?? '—';
}
