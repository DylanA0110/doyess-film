const TMDB_BASE = 'https://api.themoviedb.org/3';

function getToken() {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) throw new Error('TMDB_API_TOKEN is not configured');
  return token;
}

export type TmdbMediaType = 'movie' | 'tv';

export type TmdbFindResult = {
  mediaType: TmdbMediaType;
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  /** Si el match fue un capítulo IMDb, créditos/póster vienen de la serie. */
  fromTvEpisode?: boolean;
};

type FindHit = {
  id: number;
  name?: string;
  title?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  show_id?: number;
};

function mapHit(mediaType: TmdbMediaType, hit: FindHit): TmdbFindResult {
  return {
    mediaType,
    id: hit.id,
    title: hit.title ?? hit.name ?? '',
    poster_path: hit.poster_path,
    backdrop_path: hit.backdrop_path,
  };
}

async function fetchTvShowById(showId: number): Promise<TmdbFindResult | null> {
  const response = await fetch(`${TMDB_BASE}/tv/${showId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/json',
    },
    next: { revalidate: 86400 },
  });
  if (!response.ok) return null;
  const show = (await response.json()) as FindHit;
  return { ...mapHit('tv', show), fromTvEpisode: true };
}

export async function findTmdbByImdbId(
  imdbId: string,
  options?: { preferTv?: boolean },
): Promise<TmdbFindResult | null> {
  const normalized = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;
  const url = `${TMDB_BASE}/find/${normalized}?external_source=imdb_id`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/json',
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    movie_results?: FindHit[];
    tv_results?: FindHit[];
    tv_episode_results?: FindHit[];
  };

  const episode = data.tv_episode_results?.[0];
  if (episode?.show_id) {
    const fromShow = await fetchTvShowById(episode.show_id);
    if (fromShow) return fromShow;
  }

  const movie = data.movie_results?.[0];
  const tv = data.tv_results?.[0];

  if (options?.preferTv && tv) return mapHit('tv', tv);
  if (movie) return mapHit('movie', movie);
  if (tv) return mapHit('tv', tv);
  return null;
}

/** @deprecated Usa findTmdbByImdbId */
export async function findTmdbMovieByImdbId(imdbId: string) {
  const hit = await findTmdbByImdbId(imdbId);
  if (!hit || hit.mediaType !== 'movie') return null;
  return {
    id: hit.id,
    title: hit.title,
    poster_path: hit.poster_path,
    backdrop_path: hit.backdrop_path,
  };
}
