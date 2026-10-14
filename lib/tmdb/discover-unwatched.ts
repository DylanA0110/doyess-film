import { formatRecommendationReason } from '@/lib/recommendation/format-reason';
import { rankCandidates } from '@/lib/recommendation/rank-candidates';
import type { CandidateMovie, UserVectorProfile } from '@/lib/recommendation/types';
import { findTmdbByImdbId } from '@/lib/tmdb/find-by-imdb';
import {
  discoverMoviesForTaste,
  fetchMovieImdbId,
  fetchMovieRecommendations,
  type TmdbMovieListItem,
} from '@/lib/tmdb/movie-public';

function normalizeImdb(id: string): string {
  const t = id.trim();
  return t.startsWith('tt') ? t : `tt${t.replace(/^tt/, '')}`;
}

function isExcluded(imdbId: string | null, excluded: Set<string>): boolean {
  if (!imdbId) return false;
  const norm = normalizeImdb(imdbId);
  return excluded.has(norm) || excluded.has(imdbId);
}

function releaseYear(item: TmdbMovieListItem): number | null {
  if (!item.release_date) return null;
  const y = Number.parseInt(item.release_date.slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
}

function tmdbItemToCandidate(item: TmdbMovieListItem): CandidateMovie {
  return {
    tmdbId: item.id,
    title: item.title,
    overview: item.overview,
    posterPath: item.poster_path,
    releaseYear: releaseYear(item),
    voteAverage: item.vote_average,
    voteCount: item.vote_count,
    genreIds: item.genre_ids ?? [],
    director: null,
  };
}

function dedupeById(items: TmdbMovieListItem[]): TmdbMovieListItem[] {
  const seen = new Set<number>();
  const out: TmdbMovieListItem[] = [];
  for (const m of items) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    out.push(m);
  }
  return out;
}

export type UnwatchedDiscoverPick = {
  tmdbId: number;
  imdbId: string | null;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseYear: number | null;
  voteAverage: number;
  matchReason: string;
};

export async function discoverUnwatchedMovie(
  profile: UserVectorProfile,
  excludedImdbIds: Set<string>,
  seed: number,
): Promise<UnwatchedDiscoverPick | null> {
  const pool: TmdbMovieListItem[] = [];
  const genreNames = profile.topGenreNames;

  for (let i = 0; i < genreNames.length; i++) {
    const genre = genreNames[i];
    const page = 1 + ((seed + i) % 3);
    const chunk = await discoverMoviesForTaste(
      genre,
      profile.yearMin,
      profile.yearMax,
      profile.minVoteAverage,
      page,
    );
    pool.push(...chunk);
  }

  for (const imdbId of profile.seedImdbIds.slice(0, 2)) {
    const found = await findTmdbByImdbId(imdbId, { preferTv: false });
    if (!found || found.mediaType !== 'movie') continue;
    const recs = await fetchMovieRecommendations(found.id, 1 + (seed % 2));
    pool.push(...recs);
  }

  const unique = dedupeById(pool);
  if (unique.length === 0) return null;

  const inspectOrder = [...unique].sort((a, b) => b.vote_average - a.vote_average);
  const candidates: CandidateMovie[] = [];

  for (const item of inspectOrder.slice(0, 28)) {
    const imdbId = await fetchMovieImdbId(item.id);
    if (isExcluded(imdbId, excludedImdbIds)) continue;
    candidates.push(tmdbItemToCandidate(item));
  }

  if (candidates.length === 0) return null;

  const ranked = rankCandidates(profile, candidates);
  const top = ranked.slice(0, 8);
  const pick = top[seed % top.length];
  const item = pick.candidate;
  const matchReason = formatRecommendationReason(pick.breakdown, profile);

  const imdbId = await fetchMovieImdbId(item.tmdbId);

  return {
    tmdbId: item.tmdbId,
    imdbId,
    title: item.title,
    overview: item.overview,
    posterPath: item.posterPath,
    releaseYear: item.releaseYear,
    voteAverage: item.voteAverage,
    matchReason,
  };
}
