import type { UserVectorProfile } from '@/lib/recommendation/types';
import { discoverMoviesForTaste } from '@/lib/tmdb/movie-public';

/** Pool TMDB por género (Explorar) — scoring vía rankCandidates en el consumidor */
export async function poolByGenre(
  profile: UserVectorProfile,
  genreName: string,
  page = 1,
) {
  return discoverMoviesForTaste(
    genreName,
    profile.yearMin,
    profile.yearMax,
    profile.minVoteAverage,
    page,
  );
}

export async function poolHiddenGems(profile: UserVectorProfile, page = 1) {
  const genre = profile.topGenreNames[0] ?? 'Drama';
  const items = await discoverMoviesForTaste(
    genre,
    profile.yearMin,
    profile.yearMax,
    profile.minVoteAverage + 0.2,
    page,
  );
  return items.filter((m) => m.vote_count >= 200 && m.vote_count <= 3000);
}
