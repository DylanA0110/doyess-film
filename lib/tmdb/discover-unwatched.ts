import type { DailyPickTasteProfile } from '@/lib/dashboard/daily-pick-taste';
import { findTmdbByImdbId } from '@/lib/tmdb/find-by-imdb';
import { tmdbGenreIdFromImdbLabel } from '@/lib/tmdb/imdb-genre-to-tmdb';
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

function scoreCandidate(
  item: TmdbMovieListItem,
  profile: DailyPickTasteProfile,
  genreIdSet: Set<number>,
): number {
  let score = item.vote_average * 4;
  score += Math.min(12, Math.log10(Math.max(item.vote_count, 1)) * 4);

  const year = releaseYear(item);
  if (year) {
    const mid = (profile.yearMin + profile.yearMax) / 2;
    const span = Math.max(8, (profile.yearMax - profile.yearMin) / 2);
    const dist = Math.abs(year - mid) / span;
    score += Math.max(0, 14 - dist * 14);
  }

  const ids = item.genre_ids ?? [];
  let genreHit = 0;
  for (const id of ids) {
    if (genreIdSet.has(id)) genreHit += 1;
  }
  score += genreHit * 6;

  for (const name of profile.genreNames) {
    const gid = tmdbGenreIdFromImdbLabel(name);
    if (gid && ids.includes(gid)) score += (profile.genreWeights[name] ?? 0.2) * 20;
  }

  return score;
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
  profile: DailyPickTasteProfile,
  excludedImdbIds: Set<string>,
  seed: number,
): Promise<UnwatchedDiscoverPick | null> {
  const genreIdSet = new Set(
    profile.genreNames
      .map((n) => tmdbGenreIdFromImdbLabel(n))
      .filter((id): id is number => id != null),
  );

  const pool: TmdbMovieListItem[] = [];

  for (let i = 0; i < profile.genreNames.length; i++) {
    const genre = profile.genreNames[i];
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

  const scored: Array<{ item: TmdbMovieListItem; score: number }> = [];
  const inspectOrder = [...unique].sort((a, b) => b.vote_average - a.vote_average);

  for (const candidate of inspectOrder.slice(0, 28)) {
    const imdbId = await fetchMovieImdbId(candidate.id);
    if (isExcluded(imdbId, excludedImdbIds)) continue;
    const score = scoreCandidate(candidate, profile, genreIdSet);
    scored.push({ item: candidate, score });
  }

  if (scored.length === 0) return null;

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 8);
  const pick = top[seed % top.length];
  const year = releaseYear(pick.item);

  const genreLabel = profile.genreNames.slice(0, 2).join(' y ');
  const matchReason = `Fuera de tu IMDb · afinidad con ${genreLabel} y tu época favorita (${profile.yearMin}–${profile.yearMax})`;

  const imdbId = await fetchMovieImdbId(pick.item.id);

  return {
    tmdbId: pick.item.id,
    imdbId,
    title: pick.item.title,
    overview: pick.item.overview,
    posterPath: pick.item.poster_path,
    releaseYear: year,
    voteAverage: pick.item.vote_average,
    matchReason,
  };
}
