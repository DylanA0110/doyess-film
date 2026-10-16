import { fromTmdbMovieListItem, type MediaCandidate } from '@/lib/recommendation/media-candidate';
import { rankCandidates } from '@/lib/recommendation/rank-candidates';
import { scoreCandidatePartial } from '@/lib/recommendation/score-candidate';
import type { UserVectorProfile } from '@/lib/recommendation/types';
import { genreDisplayPercentages } from '@/lib/recommendation/build-user-profile';
import { findTmdbByImdbId } from '@/lib/tmdb/find-by-imdb';
import { fetchTmdbKeywords, mapWithConcurrency } from '@/lib/tmdb/keywords';
import {
  discoverMoviesForTaste,
  fetchMovieImdbId,
  fetchMovieRecommendations,
  type TmdbMovieListItem,
} from '@/lib/tmdb/movie-public';

const PARTIAL_TOP = 15;
const KEYWORD_FETCH_CONCURRENCY = 6;

function normalizeImdb(id: string): string {
  const t = id.trim();
  return t.startsWith('tt') ? t : `tt${t.replace(/^tt/, '')}`;
}

function isExcluded(imdbId: string | null, excluded: Set<string>): boolean {
  if (!imdbId) return false;
  const norm = normalizeImdb(imdbId);
  return excluded.has(norm) || excluded.has(imdbId);
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
  const genreNames = genreDisplayPercentages(profile)
    .filter((g) => g.count > 0 && g.name !== 'Otros' && g.name !== '—')
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4)
    .map((g) => g.name);

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
  const candidates: MediaCandidate[] = [];

  for (const item of inspectOrder.slice(0, 40)) {
    const imdbId = await fetchMovieImdbId(item.id);
    if (isExcluded(imdbId, excludedImdbIds)) continue;
    candidates.push(fromTmdbMovieListItem(item, { imdbId }));
  }

  if (candidates.length === 0) return null;

  const partialRanked = [...candidates]
    .map((c) => ({ c, partial: scoreCandidatePartial(profile, c) }))
    .sort((a, b) => b.partial - a.partial)
    .slice(0, PARTIAL_TOP)
    .map((x) => x.c);

  await mapWithConcurrency(partialRanked, KEYWORD_FETCH_CONCURRENCY, async (candidate) => {
    if (candidate.keywords.length > 0) return candidate;
    candidate.keywords = await fetchTmdbKeywords('movie', candidate.tmdbId);
    return candidate;
  });

  const ranked = rankCandidates(profile, partialRanked);
  const top = ranked.slice(0, 8);
  const pick = top[0] ?? ranked[0];
  if (!pick) return null;
  const item = pick.candidate;

  const imdbId =
    item.imdbId ?? (await fetchMovieImdbId(item.tmdbId));

  return {
    tmdbId: item.tmdbId,
    imdbId,
    title: item.displayTitle,
    overview: item.overview,
    posterPath: item.posterPath,
    releaseYear: item.releaseYear,
    voteAverage: item.voteAverage,
    matchReason: pick.reason,
  };
}
