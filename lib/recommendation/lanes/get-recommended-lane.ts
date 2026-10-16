import {
  fromTmdbMovieListItem,
  fromTmdbTvListItem,
  type MediaCandidate,
  type MediaRef,
} from '@/lib/recommendation/media-candidate';
import { scoreCandidate, scoreCandidatePartial } from '@/lib/recommendation/score-candidate';
import type { ScoreResult, UserVectorProfile } from '@/lib/recommendation/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mediaCandidateFromDetail } from '@/lib/recommendation/candidate-from-detail';
import { fetchPgVectorNeighbors } from '@/lib/recommendation/pgvector-neighbors';
import { mediaRef } from '@/lib/recommendation/media-candidate';
import { discoverMediaForTaste } from '@/lib/tmdb/discover-media';
import { fetchTmdbKeywords, mapWithConcurrency } from '@/lib/tmdb/keywords';
import { fetchTmdbMediaDetail } from '@/lib/tmdb/media-detail';
import { candidateMatchesLaneGenre } from '@/lib/recommendation/lane-genre-match';

const PARTIAL_TOP = 15;
const KEYWORD_FETCH_CONCURRENCY = 6;

export type LaneQuery =
  | { kind: 'genre'; genreName: string; page?: number }
  | { kind: 'keyword'; tmdbKeywordId: number; page?: number };

export type RankedLaneItem = ScoreResult & { candidate: MediaCandidate };

function listItemToCandidate(
  item: Parameters<typeof fromTmdbMovieListItem>[0] | Parameters<typeof fromTmdbTvListItem>[0],
  mediaType: 'movie' | 'tv',
): MediaCandidate {
  return mediaType === 'tv'
    ? fromTmdbTvListItem(item as Parameters<typeof fromTmdbTvListItem>[0])
    : fromTmdbMovieListItem(item as Parameters<typeof fromTmdbMovieListItem>[0]);
}

export async function getRecommendedLane(
  query: LaneQuery,
  profile: UserVectorProfile,
  seenIdsSet: ReadonlySet<MediaRef>,
  options?: {
    topN?: number;
    mediaTypes?: Array<'movie' | 'tv'>;
    supabase?: SupabaseClient;
  },
): Promise<RankedLaneItem[]> {
  const topN = options?.topN ?? 10;
  const mediaTypes = options?.mediaTypes ?? ['movie', 'tv'];
  const page = query.page ?? 1;

  const pool: MediaCandidate[] = [];

  if (options?.supabase && process.env.ENABLE_PGVECTOR !== 'false') {
    const neighbors = await fetchPgVectorNeighbors(options.supabase, profile, 12);
    for (const neighbor of neighbors) {
      const ref = mediaRef(neighbor.mediaType, neighbor.tmdbId);
      if (seenIdsSet.has(ref)) continue;
      const detail = await fetchTmdbMediaDetail(neighbor.mediaType, neighbor.tmdbId);
      if (!detail) continue;
      const neighborCandidate = mediaCandidateFromDetail(detail);
      if (
        query.kind === 'genre' &&
        !candidateMatchesLaneGenre(query.genreName, neighborCandidate)
      ) {
        continue;
      }
      pool.push(neighborCandidate);
    }
  }

  for (const mediaType of mediaTypes) {
    const items = await discoverMediaForTaste({
      mediaType,
      genreName: query.kind === 'genre' ? query.genreName : undefined,
      keywordId: query.kind === 'keyword' ? query.tmdbKeywordId : undefined,
      yearMin: profile.yearMin,
      yearMax: profile.yearMax,
      minVote: profile.minVoteAverage,
      page,
    });

    for (const item of items) {
      const candidate = listItemToCandidate(item, mediaType);
      if (query.kind === 'genre' && !candidateMatchesLaneGenre(query.genreName, candidate)) {
        continue;
      }
      pool.push(candidate);
    }
  }

  const unseen = pool.filter((c) => !seenIdsSet.has(c.mediaRef));
  if (unseen.length === 0) return [];

  const partialRanked = [...unseen]
    .map((c) => ({ c, partial: scoreCandidatePartial(profile, c) }))
    .sort((a, b) => b.partial - a.partial)
    .slice(0, PARTIAL_TOP)
    .map((x) => x.c);

  await mapWithConcurrency(partialRanked, KEYWORD_FETCH_CONCURRENCY, async (candidate) => {
    if (candidate.keywords.length > 0) return candidate;
    const keywords = await fetchTmdbKeywords(candidate.mediaType, candidate.tmdbId);
    candidate.keywords = keywords;
    return candidate;
  });

  const scored = partialRanked
    .map((candidate) => {
      const result = scoreCandidate(profile, candidate);
      return { ...result, candidate };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  let result = scored;
  if (query.kind === 'genre') {
    result = scored.filter((r) => candidateMatchesLaneGenre(query.genreName, r.candidate));
  }

  return result.slice(0, topN);
}
