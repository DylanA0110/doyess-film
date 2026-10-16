import type { TmdbCastSnapshotEntry, TmdbCrewSnapshotEntry } from '@/lib/tmdb/types';
import { findTmdbByImdbId } from '@/lib/tmdb/find-by-imdb';
import { fetchTmdbKeywords } from '@/lib/tmdb/keywords';
import { titleKindFromImdbType } from '@/lib/imdb/title-kind';

const TMDB_BASE = 'https://api.themoviedb.org/3';

function getToken() {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) throw new Error('TMDB_API_TOKEN is not configured');
  return token;
}

export type EnrichedMoviePayload = {
  tmdb_id: number;
  tmdb_media_type: 'movie' | 'tv';
  poster_path: string | null;
  backdrop_path: string | null;
  cast_snapshot: TmdbCastSnapshotEntry[];
  crew_snapshot: TmdbCrewSnapshotEntry[];
  tmdb_keywords: string[];
};

export async function enrichMovieFromImdbId(
  imdbId: string,
  titleTypeHint?: string | null,
): Promise<EnrichedMoviePayload | null> {
  const preferTv = titleKindFromImdbType(titleTypeHint) === 'series';
  const found = await findTmdbByImdbId(imdbId, { preferTv });
  if (!found) return null;

  const detailPath =
    found.mediaType === 'tv'
      ? `${TMDB_BASE}/tv/${found.id}?append_to_response=credits`
      : `${TMDB_BASE}/movie/${found.id}?append_to_response=credits`;

  const response = await fetch(detailPath, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/json',
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return {
      tmdb_id: found.id,
      tmdb_media_type: found.mediaType,
      poster_path: found.poster_path,
      backdrop_path: found.backdrop_path,
      cast_snapshot: [],
      crew_snapshot: [],
      tmdb_keywords: [],
    };
  }

  const data = (await response.json()) as {
    poster_path: string | null;
    backdrop_path: string | null;
    created_by?: Array<{
      id: number;
      name: string;
      profile_path: string | null;
    }>;
    credits?: {
      cast?: Array<{
        id: number;
        name: string;
        gender: number;
        profile_path: string | null;
        character?: string;
        order?: number;
      }>;
      crew?: Array<{
        id: number;
        name: string;
        job: string;
        profile_path: string | null;
      }>;
    };
  };

  const cast_snapshot: TmdbCastSnapshotEntry[] = (data.credits?.cast ?? [])
    .slice(0, 15)
    .map((c) => ({
      id: c.id,
      name: c.name,
      gender: c.gender,
      profile_path: c.profile_path,
      character: c.character,
      order: c.order,
    }));

  const crewFromCredits = (data.credits?.crew ?? [])
    .filter((c) =>
      ['Director', 'Creator', 'Executive Producer', 'Showrunner'].includes(c.job),
    )
    .slice(0, 8)
    .map((c) => ({
      id: c.id,
      name: c.name,
      job: c.job,
      profile_path: c.profile_path,
    }));

  const crewFromCreated =
    found.mediaType === 'tv'
      ? (data.created_by ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          job: 'Creator',
          profile_path: c.profile_path,
        }))
      : [];

  const crew_snapshot: TmdbCrewSnapshotEntry[] = [...crewFromCreated, ...crewFromCredits].slice(
    0,
    10,
  );

  const tmdb_keywords = await fetchTmdbKeywords(found.mediaType, found.id);

  return {
    tmdb_id: found.id,
    tmdb_media_type: found.mediaType,
    poster_path: data.poster_path ?? found.poster_path,
    backdrop_path: data.backdrop_path ?? found.backdrop_path,
    cast_snapshot,
    crew_snapshot,
    tmdb_keywords,
  };
}
