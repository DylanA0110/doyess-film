/** Mapeo etiquetas IMDb / dashboard → género TMDB (discover). */
const MAP: Record<string, number> = {
  Action: 28,
  Acción: 28,
  Adventure: 12,
  Aventura: 12,
  Animation: 16,
  Animación: 16,
  Comedy: 35,
  Comedia: 35,
  Crime: 80,
  Crimen: 80,
  Documentary: 99,
  Documental: 99,
  Drama: 18,
  Family: 10751,
  Familiar: 10751,
  Fantasy: 14,
  Fantasía: 14,
  History: 36,
  Historia: 36,
  Biography: 36,
  Biografía: 36,
  Horror: 27,
  Terror: 27,
  Music: 10402,
  Musical: 10402,
  Música: 10402,
  Mystery: 9648,
  Misterio: 9648,
  Romance: 10749,
  'Sci-Fi': 878,
  'Science Fiction': 878,
  'Ciencia ficción': 878,
  'Ciencia Ficción': 878,
  Thriller: 53,
  Suspense: 53,
  War: 10752,
  Bélico: 10752,
  Western: 37,
  'Del oeste': 37,
};

/** Géneros IMDb que no existen en TMDB → ids TMDB más cercanos para discover/filtro. */
const DISCOVER_ALIASES: Record<string, number[]> = {
  suspense: [53],
  thriller: [53],
  misterio: [9648],
  mystery: [9648],
};

function normalizeKey(name: string): string {
  return name.trim().toLowerCase();
}

export function tmdbGenreIdFromImdbLabel(name: string): number | null {
  const trimmed = name.trim();
  const direct = MAP[trimmed];
  if (direct) return direct;
  const lower = normalizeKey(trimmed);
  for (const [key, id] of Object.entries(MAP)) {
    if (normalizeKey(key) === lower) return id;
  }
  const alias = DISCOVER_ALIASES[lower];
  return alias?.[0] ?? null;
}

/** Todos los ids TMDB que cuentan para un carril de género (p. ej. Suspense → Thriller). */
export function tmdbDiscoverGenreIds(name: string): number[] {
  const id = tmdbGenreIdFromImdbLabel(name);
  if (id != null) return [id];
  const alias = DISCOVER_ALIASES[normalizeKey(name)];
  return alias ?? [];
}
