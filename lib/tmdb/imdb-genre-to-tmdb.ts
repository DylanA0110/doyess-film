/** Mapeo aproximado etiquetas IMDb CSV → género TMDB (discover). */
const MAP: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Musical: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Sci-Fi': 878,
  'Science Fiction': 878,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

export function tmdbGenreIdFromImdbLabel(name: string): number | null {
  const direct = MAP[name];
  if (direct) return direct;
  const lower = name.toLowerCase();
  for (const [key, id] of Object.entries(MAP)) {
    if (key.toLowerCase() === lower) return id;
  }
  return null;
}
