import type { MediaRef } from '@/lib/recommendation/media-candidate';
import { getRecommendedLane } from '@/lib/recommendation/lanes/get-recommended-lane';
import type { UserVectorProfile } from '@/lib/recommendation/types';
import { discoverMoviesForTaste } from '@/lib/tmdb/movie-public';

/** Pool TMDB por género — scoring vía getRecommendedLane / rankCandidates */
export async function poolByGenre(
  profile: UserVectorProfile,
  genreName: string,
  seenIdsSet: ReadonlySet<MediaRef>,
  page = 1,
) {
  const ranked = await getRecommendedLane(
    { kind: 'genre', genreName, page },
    profile,
    seenIdsSet,
    { topN: 20, mediaTypes: ['movie'] },
  );
  return ranked.map((r) => r.candidate);
}

export async function poolHiddenGems(
  profile: UserVectorProfile,
  seenIdsSet: ReadonlySet<MediaRef>,
  page = 1,
) {
  const genre = profile.topGenreNames[0] ?? 'Drama';
  const items = await discoverMoviesForTaste(
    genre,
    profile.yearMin,
    profile.yearMax,
    profile.minVoteAverage + 0.2,
    page,
  );
  const filtered = items.filter((m) => m.vote_count >= 200 && m.vote_count <= 3000);
  const ranked = await getRecommendedLane(
    { kind: 'genre', genreName: genre, page },
    profile,
    seenIdsSet,
    { topN: 15, mediaTypes: ['movie'] },
  );
  return ranked.length > 0 ? ranked.map((r) => r.candidate) : filtered;
}
